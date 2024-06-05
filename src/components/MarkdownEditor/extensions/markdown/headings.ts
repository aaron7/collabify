import {
  HighlightStyle,
  syntaxHighlighting,
  syntaxTree,
} from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

import './headings.css';

const emptyHeadingRegex = new RegExp('^#+ *$', 'i');

function headings(view: EditorView) {
  const headings: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (
          node.type.is('ATXHeading1') ||
          node.type.is('ATXHeading2') ||
          node.type.is('ATXHeading3') ||
          node.type.is('ATXHeading4') ||
          node.type.is('ATXHeading5') ||
          node.type.is('ATXHeading6')
        ) {
          const line = view.state.doc.lineAt(node.from);
          const deco = Decoration.mark({
            class: emptyHeadingRegex.test(line.text)
              ? 'md-empty-header-processing-instruction'
              : 'md-header-processing-instruction',
          });
          const num = Number.parseInt(node.type.name.slice(-1));
          headings.push(deco.range(node.from, node.from + num + 1));
        }
      },
      from,
      to,
    });
  }
  return Decoration.set(headings);
}

const headingsPlugin = ViewPlugin.fromClass(
  class {
    headings: DecorationSet;

    constructor(view: EditorView) {
      this.headings = headings(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.startState) != syntaxTree(update.state)
      ) {
        this.headings = headings(update.view);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.headings,
  },
);

const headingsHighlightStyle = HighlightStyle.define([
  { class: 'my-4 text-4xl font-semibold no-underline', tag: tags.heading1 },
  { class: 'my-3 text-3xl font-semibold no-underline', tag: tags.heading2 },
  { class: 'my-2 text-2xl font-semibold no-underline', tag: tags.heading3 },
  { class: 'my-2 text-xl font-semibold no-underline', tag: tags.heading4 },
  { class: 'my-1 text-lg font-semibold no-underline', tag: tags.heading5 },
  { class: 'text-base font-semibold no-underline', tag: tags.heading6 },
]);

const headingsSyntaxHighlighting = syntaxHighlighting(headingsHighlightStyle);

export default [headingsPlugin, headingsSyntaxHighlighting];
