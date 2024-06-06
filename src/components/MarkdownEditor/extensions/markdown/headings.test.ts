// @vitest-environment jsdom
import { markdown } from '@codemirror/lang-markdown';
import { describe, expect, it } from 'vitest';

import { tempView } from '@/test-utils/view';

import markdownHeadings from './headings';

const extensions = [markdown(), markdownHeadings];

describe('headings', () => {
  describe.each(['#', '##', '###', '####', '#####', '######'])(
    `heading %s`,
    (headingSyntax) => {
      it('decorates', () => {
        const cm = tempView(`${headingSyntax} Hello world`, extensions);

        const headerDecoration = cm.contentDOM.querySelector(
          '.md-header-processing-instruction',
        );
        expect(headerDecoration).not.toBeNull();
        expect(headerDecoration?.textContent).toBe(`${headingSyntax} `);
      });

      it('decorates empty with no space', () => {
        const cm = tempView(`${headingSyntax}`, extensions);

        const headerDecoration = cm.contentDOM.querySelector(
          '.md-empty-header-processing-instruction',
        );
        expect(headerDecoration).not.toBeNull();
        expect(headerDecoration?.textContent).toBe(`${headingSyntax}`);
      });

      it('decorates empty with a space', () => {
        const cm = tempView(`${headingSyntax} `, extensions);

        const headerDecoration = cm.contentDOM.querySelector(
          '.md-empty-header-processing-instruction',
        );
        expect(headerDecoration).not.toBeNull();
        expect(headerDecoration?.textContent).toBe(`${headingSyntax} `);
      });

      it('decorates empty with multiple spaces', () => {
        const cm = tempView(`${headingSyntax}    `, extensions);

        const headerDecoration = cm.contentDOM.querySelector(
          '.md-empty-header-processing-instruction',
        );
        expect(headerDecoration).not.toBeNull();
        expect(headerDecoration?.textContent).toBe(`${headingSyntax} `);
      });
    },
  );
});
