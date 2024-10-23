import { EditorState, StateCommand } from '@codemirror/state';
import { describe, expect, it } from 'vitest';

import { mkState, stateStr } from '@/test-utils/state';

import {
  insertEmptyLink,
  insertFencedCode,
  insertImage,
  insertLinkOrImage,
  insertTable,
  makeBlockquote,
  makeHeading1,
  makeHeading2,
  makeHeading3,
  makeHeading4,
  makeHeading5,
  makeHeading6,
  makeParagraph,
  makeTaskList,
  makeUnorderedList,
  toggleBold,
  toggleInlineCode,
  toggleItalic,
  toggleStrikethrough,
} from './commands';

const cmd = (state: EditorState, command: StateCommand) => {
  command({
    dispatch(tr) {
      state = tr.state;
    },
    state,
  });
  return state;
};

const assertCommandStateChange =
  (command: StateCommand) => (from: string, to: string) => {
    expect(stateStr(cmd(mkState(from), command))).toBe(to);
  };

describe('commands', () => {
  describe.each([
    {
      command: 'toggleBold',
      test: assertCommandStateChange(toggleBold),
      wrap: '**',
    },
    {
      command: 'toggleItalic',
      test: assertCommandStateChange(toggleItalic),
      wrap: '*',
    },
    {
      command: 'toggleStrikethrough',
      test: assertCommandStateChange(toggleStrikethrough),
      wrap: '~~',
    },
    {
      command: 'toggleInlineCode',
      test: assertCommandStateChange(toggleInlineCode),
      wrap: '`',
    },
  ])('$command', ({ test, wrap }) => {
    describe('wraps', () => {
      it('word from end', () => {
        test(' hello| ', ` ${wrap}hello|${wrap} `);
      });

      it('word from middle', () => {
        test(' h|ello ', ` ${wrap}h|ello${wrap} `);
      });

      it('word from start', () => {
        test(' |hello ', ` ${wrap}|hello${wrap} `);
      });

      it('selected word', () => {
        test(' <hello> ', ` ${wrap}<hello>${wrap} `);
      });

      it('partial word', () => {
        test('he<llo worl>d', `he${wrap}<llo worl>${wrap}d`);
      });
    });

    describe('unwraps', () => {
      it('word from end', () => {
        test(` ${wrap}hello|${wrap} `, ' hello| ');
      });

      it('word from middle', () => {
        test(` ${wrap}h|ello${wrap} `, ' h|ello ');
      });

      it('word from start', () => {
        test(` ${wrap}|hello${wrap} `, ' |hello ');
      });

      it('selected word', () => {
        test(` ${wrap}<hello>${wrap} `, ' <hello> ');
      });

      it('partial word', () => {
        test(`he${wrap}<llo worl>${wrap}d`, 'he<llo worl>d');
      });
    });
  });

  describe.each([
    {
      command: 'makeHeading1',
      prefix: '# ',
      test: assertCommandStateChange(makeHeading1),
    },
    {
      command: 'makeHeading2',
      prefix: '## ',
      test: assertCommandStateChange(makeHeading2),
    },
    {
      command: 'makeHeading3',
      prefix: '### ',
      test: assertCommandStateChange(makeHeading3),
    },
    {
      command: 'makeHeading4',
      prefix: '#### ',
      test: assertCommandStateChange(makeHeading4),
    },
    {
      command: 'makeHeading5',
      prefix: '##### ',
      test: assertCommandStateChange(makeHeading5),
    },
    {
      command: 'makeHeading6',
      prefix: '###### ',
      test: assertCommandStateChange(makeHeading6),
    },
    {
      command: 'makeUnorderedList',
      prefix: '- ',
      test: assertCommandStateChange(makeUnorderedList),
    },
    {
      command: 'makeTaskList',
      prefix: '- [ ] ',
      test: assertCommandStateChange(makeTaskList),
    },
    {
      command: 'makeParagraph',
      prefix: '',
      test: assertCommandStateChange(makeParagraph),
    },
    {
      command: 'makeBlockquote',
      prefix: '> ',
      test: assertCommandStateChange(makeBlockquote),
    },
  ])('$command', ({ prefix, test }) => {
    describe('prefixes single line', () => {
      it('empty line', () => {
        test('|', `${prefix}|`);
      });

      it('no existing prefix', () => {
        test('hello| ', `${prefix}hello| `);
      });

      it('existing heading prefix', () => {
        test('# hello| ', `${prefix}hello| `);
      });

      it('existing list prefix', () => {
        test('- hello| ', `${prefix}hello| `);
      });

      it('existing checklist prefix', () => {
        test('- [ ] hello| ', `${prefix}hello| `);
      });

      it('existing numbered list prefix', () => {
        test('1. hello| ', `${prefix}hello| `);
      });

      it('with partial selection', () => {
        test('h<ell>o', `${prefix}h<ell>o`);
      });

      it('with line selection', () => {
        test('<hello>', `${prefix}<hello>`);
      });
    });

    describe('prefixes multiple lines', () => {
      it('no existing prefixes', () => {
        test('<hello\nworld>', `${prefix}<hello\n${prefix}world>`);
      });

      it('existing heading prefixes', () => {
        test(`<# hello\n# world>`, `<${prefix}hello\n${prefix}world>`);
      });

      it('existing list prefixes', () => {
        test(`<- hello\n- world>`, `<${prefix}hello\n${prefix}world>`);
      });

      it('partial selection with existing prefixes', () => {
        test(`# h<ello\n# wor>ld`, `${prefix}h<ello\n${prefix}wor>ld`);
      });
    });
  });

  describe.each([
    {
      command: 'insertFencedCode',
      test: assertCommandStateChange(insertFencedCode),
      text: '```\n\n```',
    },
    {
      command: 'insertImage',
      test: assertCommandStateChange(insertImage),
      text: '![alt](src)',
    },
    {
      command: 'insertLinkOrImage > link',
      test: assertCommandStateChange(
        insertLinkOrImage({
          text: 'example',
          url: 'https://example.org',
          variant: 'link',
        }),
      ),
      text: '[example](https://example.org)',
    },
    {
      command: 'insertLinkOrImage > image',
      test: assertCommandStateChange(
        insertLinkOrImage({
          text: 'example',
          url: 'https://example.org',
          variant: 'image',
        }),
      ),
      text: '![example](https://example.org)',
    },
    {
      command: 'insertEmptyLink',
      test: assertCommandStateChange(insertEmptyLink),
      text: '[]()',
    },
    {
      command: 'insertTable',
      test: assertCommandStateChange(insertTable),
      text: '|   |   |\n|---|---|\n|   |   |',
    },
  ])('$command', ({ test, text }) => {
    describe('inserts', () => {
      it('at cursor', () => {
        test('hello |', `hello ${text}|`);
      });

      it('replaces selection', () => {
        test('hello <world>', `hello <${text}>`);
      });
    });
  });
});
