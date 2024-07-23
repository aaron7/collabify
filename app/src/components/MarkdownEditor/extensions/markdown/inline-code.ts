import { ensureSyntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

import './inline-code.css';

const deco = Decoration.mark({ class: 'md-inline-code' });

function inlineCode(view: EditorView, oldInlineCode: DecorationSet) {
  const inlineCode: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old inlineCode
    // for now.
    if (!syntaxTree) {
      return oldInlineCode;
    }

    syntaxTree.iterate({
      enter: (node) => {
        if (node.type.is('InlineCode')) {
          inlineCode.push(deco.range(node.from, node.to));
        }
      },
      from,
      to,
    });
  }
  return Decoration.set(inlineCode);
}

const inlineCodePlugin = ViewPlugin.fromClass(
  class {
    inlineCode: DecorationSet;

    constructor(view: EditorView) {
      this.inlineCode = inlineCode(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.inlineCode = inlineCode(update.view, this.inlineCode);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.inlineCode,
  },
);

export default inlineCodePlugin;
