// @vitest-environment jsdom
import { markdown } from '@codemirror/lang-markdown';
import { describe, expect, it } from 'vitest';

import { mkState } from '@/test-utils/state';
import { tempView } from '@/test-utils/view';

import markdownHeadings from './headings';

const extensions = [markdown(), markdownHeadings];

describe('headings', () => {
  describe.each(['#', '##', '###', '####', '#####', '######'])(
    `heading %s`,
    (headingSyntax) => {
      it('does not hide syntax when line is selected', () => {
        const cm = tempView(
          mkState(`${headingSyntax} Hello world|`, extensions),
        );

        const spans = cm.contentDOM.querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent).toBe(`${headingSyntax} Hello world`);
      });

      it('hides syntax when line is NOT selected', () => {
        const cm = tempView(
          mkState(`${headingSyntax} Hello world\n|`, extensions),
        );

        const spans = cm.contentDOM.querySelectorAll('span');
        expect(spans.length).toBe(2);
        expect(spans[0].textContent).toBe('');
        expect(spans[1].textContent).toBe('Hello world');
      });

      it('decorates empty with no space', () => {
        const cm = tempView(mkState(`${headingSyntax}\n|`, extensions));

        const spans = cm.contentDOM.querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent).toBe(`${headingSyntax}`);
      });

      it('decorates empty with a space', () => {
        const cm = tempView(mkState(`${headingSyntax} \n|`, extensions));

        const spans = cm.contentDOM.querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent).toBe(`${headingSyntax} `);
      });

      it('decorates empty with multiple spaces', () => {
        const cm = tempView(mkState(`${headingSyntax}    \n|`, extensions));

        const spans = cm.contentDOM.querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent).toBe(`${headingSyntax}    `);
      });
    },
  );
});
