import { ensureSyntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

import { EmptyWidget } from './empty-widget';

const formatDefinitions = {
  Emphasis: {
    syntaxLength: 1,
  },
  Strikethrough: {
    syntaxLength: 2,
  },
  StrongEmphasis: {
    syntaxLength: 2,
  },
};

function doesRangeOverlapWithSelection({
  from,
  to,
  view,
}: {
  from: number;
  to: number;
  view: EditorView;
}) {
  const ranges = view.state.selection.ranges;

  let low = 0;
  let high = ranges.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const range = ranges[mid];

    if (range.to < from) {
      low = mid + 1;
    } else if (range.from > to) {
      high = mid - 1;
    } else {
      return true;
    }
  }

  return false;
}

function formatting(view: EditorView, oldFormatting: DecorationSet) {
  const formatting: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old formatting
    // for now.
    if (!syntaxTree) {
      return oldFormatting;
    }

    const deco = Decoration.replace({
      widget: new EmptyWidget(view),
    });

    syntaxTree.iterate({
      enter: (node) => {
        const nodeType = node.type.name;
        if (nodeType in formatDefinitions) {
          if (
            doesRangeOverlapWithSelection({
              from: node.from,
              to: node.to,
              view,
            })
          ) {
            // Don't format nested nodes so return false to skip children
            return false;
          }

          const definition =
            formatDefinitions[nodeType as keyof typeof formatDefinitions];

          formatting.push(
            deco.range(node.from, node.from + definition.syntaxLength),
          );
          formatting.push(
            deco.range(node.to - definition.syntaxLength, node.to),
          );
        }
      },
      from,
      to,
    });
  }

  return Decoration.set(formatting.sort((a, b) => a.from - b.from));
}

const formattingPlugin = ViewPlugin.fromClass(
  class {
    formatting: DecorationSet;

    constructor(view: EditorView) {
      this.formatting = formatting(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.formatting = formatting(update.view, this.formatting);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.formatting,
  },
);

export default formattingPlugin;
