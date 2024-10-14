import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { describe, expect, it, vi } from 'vitest';

import { mkState } from '@/test-utils/state';

import selectionStateField from './selection-state';

const assertEnabledKeys = (
  str: string,
  expectedKeys: string[],
  cursorChar: string = String.raw`\|`,
) => {
  const mockSetSelectionState = vi.fn();
  const extensions = [
    markdown({
      base: markdownLanguage,
    }),
    selectionStateField({ setSelectionState: mockSetSelectionState }),
  ];

  mkState(str, extensions, cursorChar);

  const selectionState = mockSetSelectionState.mock.calls[0][0];
  const enabledKeys = Object.keys(selectionState).filter(
    (key) => selectionState[key] === true,
  );

  expect(enabledKeys.sort()).toStrictEqual(expectedKeys.sort());
};

describe('selection-state', () => {
  describe('prefixed', () => {
    describe.each([
      {
        expectedKeys: ['heading1'],
        prefix: '# ',
      },
      {
        expectedKeys: ['heading2'],
        prefix: '## ',
      },
      {
        expectedKeys: ['heading3'],
        prefix: '### ',
      },
      {
        expectedKeys: ['heading4'],
        prefix: '#### ',
      },
      {
        expectedKeys: ['heading5'],
        prefix: '##### ',
      },
      {
        expectedKeys: ['heading6'],
        prefix: '###### ',
      },
      {
        expectedKeys: ['bulletList'],
        prefix: '- ',
      },
      {
        expectedKeys: ['bulletList'],
        prefix: '* ',
      },
      {
        expectedKeys: ['bulletList'],
        prefix: '+ ',
      },
      {
        expectedKeys: ['orderedList'],
        prefix: '1. ',
      },
      {
        expectedKeys: ['orderedList'],
        prefix: '99. ',
      },
      {
        expectedKeys: ['blockquote'],
        prefix: '> ',
      },
      {
        expectedKeys: ['bulletList', 'task'],
        prefix: '- [ ] ',
      },
    ])('$prefix', ({ expectedKeys, prefix }) => {
      it('cursor on line', () => {
        assertEnabledKeys(`${prefix}hello|`, expectedKeys);
      });

      it('partial line selection', () => {
        assertEnabledKeys(`${prefix}h<ell>o`, expectedKeys);
      });

      it('full line selection', () => {
        assertEnabledKeys(`<${prefix}hello>`, expectedKeys);
      });

      it('multi line selection', () => {
        assertEnabledKeys(`${prefix}h<ello\n${prefix}wor>ld`, expectedKeys);
      });
    });
  });

  describe('wrapped', () => {
    describe.each([
      {
        expectedKeys: ['italic'],
        wrap: '*',
      },
      {
        expectedKeys: ['bold'],
        wrap: '**',
      },
      {
        expectedKeys: ['strikethrough'],
        wrap: '~~',
      },
      {
        expectedKeys: ['inlineCode'],
        wrap: '`',
      },
    ])('$wrap', ({ expectedKeys, wrap }) => {
      it('cursor in wrap', () => {
        assertEnabledKeys(`${wrap}hell|o${wrap}`, expectedKeys);
      });

      it('partial selection in wrap', () => {
        assertEnabledKeys(`${wrap}he<ll>o${wrap}`, expectedKeys);
      });

      it('full wrap selection excluding markdown syntax', () => {
        assertEnabledKeys(`${wrap}<hello>${wrap}`, expectedKeys);
      });

      it('full wrap selection including markdown syntax', () => {
        assertEnabledKeys(`<${wrap}hello${wrap}>`, expectedKeys);
      });

      it('beginning of wrap cursor', () => {
        assertEnabledKeys(`|${wrap}hello${wrap}`, expectedKeys);
      });

      it('end of wrap cursor', () => {
        assertEnabledKeys(`${wrap}hello${wrap}|`, expectedKeys);
      });

      it('outside wrap before', () => {
        assertEnabledKeys(`| ${wrap}hello${wrap}`, []);
      });

      it('outside wrap after', () => {
        assertEnabledKeys(`${wrap}hello${wrap} |`, []);
      });

      it('outside wrap selection', () => {
        assertEnabledKeys(`${wrap}hello${wrap} <world>`, []);
      });
    });
  });

  describe('fencedCode', () => {
    it('cursor in code', () => {
      assertEnabledKeys('```python\na = 1| + 2\n```', ['fencedCode']);
    });

    it('partial selection in code', () => {
      assertEnabledKeys('```python\na <= 1 + 2>\n```', ['fencedCode']);
    });

    it('multi line partial selection in code', () => {
      assertEnabledKeys('```py<thon\na = 1| +> 2\n```', ['fencedCode']);
    });

    it('full selection', () => {
      assertEnabledKeys('<```python\na = 1| + 2\n```>', ['fencedCode']);
    });

    it('beginning of code cursor', () => {
      assertEnabledKeys('|```python\na = 1| + 2\n```', ['fencedCode']);
    });

    it('end of code cursor', () => {
      assertEnabledKeys('```python\na = 1| + 2\n```|', ['fencedCode']);
    });
  });

  describe('link', () => {
    it('cursor in link name', () => {
      assertEnabledKeys('[fo|o](https://example.org)', ['link']);
    });

    it('cursor in link url', () => {
      assertEnabledKeys('[foo](https://exam|ple.org)', ['link']);
    });

    it('partial selection', () => {
      assertEnabledKeys('[fo<o](https://exam>ple.org)', ['link']);
    });

    it('full selection', () => {
      assertEnabledKeys('<[foo](https://example.org)>', ['link']);
    });

    it('begging of link cursor', () => {
      assertEnabledKeys('|[foo](https://example.org)', ['link']);
    });

    it('end of link cursor', () => {
      assertEnabledKeys('[foo](https://example.org)|', ['link']);
    });
  });

  describe('image', () => {
    it('cursor in image name', () => {
      assertEnabledKeys('![fo|o](https://example.org/image.png)', ['image']);
    });

    it('cursor in image url', () => {
      assertEnabledKeys('![foo](https://exam|ple.org/image.png)', ['image']);
    });

    it('partial selection', () => {
      assertEnabledKeys('![fo<o](https://exam>ple.org/image.png)', ['image']);
    });

    it('full selection', () => {
      assertEnabledKeys('<![foo](https://example.org/image.png)>', ['image']);
    });

    it('begging of image cursor', () => {
      assertEnabledKeys('|![foo](https://example.org/image.png)', ['image']);
    });

    it('end of image cursor', () => {
      assertEnabledKeys('![foo](https://example.org/image.png)|', ['image']);
    });
  });

  describe('table', () => {
    it('cursor in table header', () => {
      assertEnabledKeys(
        '| header 1 | hea$der 2 |\n| --- | --- |\n| cell 1 | cell 2 |',
        ['table'],
        '§',
      );
    });

    it('cursor in table cell', () => {
      assertEnabledKeys(
        '| header 1 | header 2 |\n| --- | --- |\n| cel$l 1 | cell 2 |',
        ['table'],
        '§',
      );
    });

    it('partial selection', () => {
      assertEnabledKeys(
        '| head<er 1 | header 2 |\n| --- | --- |\n| cel>l 1 | cell 2 |',
        ['table'],
        '§',
      );
    });

    it('full selection', () => {
      assertEnabledKeys(
        '<| header 1 | header 2 |\n| --- | --- |\n| cell 1 | cell 2 |>',
        ['table'],
        '§',
      );
    });

    it('begging of table cursor', () => {
      assertEnabledKeys(
        '§| header 1 | header 2 |\n| --- | --- |\n| cell 1 | cell 2 |',
        ['table'],
        '§',
      );
    });

    it('end of table cursor', () => {
      assertEnabledKeys(
        '| header 1 | header 2 |\n| --- | --- |\n| cell 1 | cell 2 |$',
        ['table'],
        '§',
      );
    });
  });
});
