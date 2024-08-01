import { EditorState, StateCommand } from '@codemirror/state';
import { describe, expect, it } from 'vitest';

import { mkState, stateStr } from '@/test-utils/state';

import { makeBold, makeItalic, makeStrikethrough } from './command-keymap';

const cmd = (state: EditorState, command: StateCommand) => {
  command({
    dispatch(tr) {
      state = tr.state;
    },
    state,
  });
  return state;
};

const testMakeBold = (from: string, to: string) => {
  expect(stateStr(cmd(mkState(from), makeBold))).toBe(to);
};

const testMakeItalic = (from: string, to: string) => {
  expect(stateStr(cmd(mkState(from), makeItalic))).toBe(to);
};

const testMakeStrikethrough = (from: string, to: string) => {
  expect(stateStr(cmd(mkState(from), makeStrikethrough))).toBe(to);
};

describe('commands', () => {
  describe.each([
    { command: 'makeBold', test: testMakeBold, wrap: '**' },
    { command: 'makeItalic', test: testMakeItalic, wrap: '*' },
    {
      command: 'makeStrikethrough',
      test: testMakeStrikethrough,
      wrap: '~~',
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
});
