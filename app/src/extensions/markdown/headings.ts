import {
  ensureSyntaxTree,
  HighlightStyle,
  syntaxHighlighting,
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

import { hasMouseDownStateChanged, isMouseDown } from './is-mouse-down';
import { EmptyWidget } from './utils/empty-widget';

function getLinesFromSelection(view: EditorView) {
  const ranges = view.state.selection.ranges;
  const lines = new Set<number>();

  for (const range of ranges) {
    const startLine = view.state.doc.lineAt(range.from).number;
    const endLine = view.state.doc.lineAt(range.to).number;
    for (let line = startLine; line <= endLine; line++) {
      lines.add(line);
    }
  }
  return lines;
}

const emptyHeadingRegex = new RegExp('^#+ *$', 'i');

function headings(view: EditorView, oldHeadings: DecorationSet) {
  const headings: Range<Decoration>[] = [];

  const selectedLines = getLinesFromSelection(view);

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old headings
    // for now.
    if (!syntaxTree) {
      return oldHeadings;
    }

    syntaxTree.iterate({
      enter: (node) => {
        if (
          node.type.is('ATXHeading1') ||
          node.type.is('ATXHeading2') ||
          node.type.is('ATXHeading3') ||
          node.type.is('ATXHeading4') ||
          node.type.is('ATXHeading5') ||
          node.type.is('ATXHeading6')
        ) {
          // Only highlight the heading if the line is selected
          const line = view.state.doc.lineAt(node.from);
          if (
            emptyHeadingRegex.test(line.text) ||
            selectedLines.has(line.number)
          ) {
            return;
          }

          const deco = Decoration.replace({
            widget: new EmptyWidget(),
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
      this.headings = headings(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (
        !isMouseDown(update) &&
        (update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          hasMouseDownStateChanged(update))
      ) {
        this.headings = headings(update.view, this.headings);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.headings,
  },
);

const headingsHighlightStyle = HighlightStyle.define([
  {
    class: 'text-4xl font-extrabold tracking-tight lg:text-5xl no-underline',
    tag: tags.heading1,
  },
  {
    class: 'text-3xl font-semibold tracking-tight no-underline',
    tag: tags.heading2,
  },
  {
    class: 'text-2xl font-semibold tracking-tight no-underline',
    tag: tags.heading3,
  },
  {
    class: 'text-xl font-semibold tracking-tight no-underline',
    tag: tags.heading4,
  },
  {
    class: 'text-lg font-semibold tracking-tight no-underline',
    tag: tags.heading5,
  },
  {
    class: 'text-base font-semibold tracking-tight no-underline',
    tag: tags.heading6,
  },
]);

const headingsSyntaxHighlighting = syntaxHighlighting(headingsHighlightStyle);

export default [headingsPlugin, headingsSyntaxHighlighting];
