import { syntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

import './headings.css';

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
          const deco = Decoration.mark({
            class: 'md-header-processing-instruction',
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

export default headingsPlugin;
