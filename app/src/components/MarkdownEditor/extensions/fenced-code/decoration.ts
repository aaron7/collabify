import { ensureSyntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

import './fenced-code.css';

const codeBlockMarker = Decoration.line({ class: 'md-codeblock' });
const codeBlockMarkerStart = Decoration.line({ class: 'md-codeblock-start' });
const codeBlockMarkerEnd = Decoration.line({ class: 'md-codeblock-end' });

function fencedCode(view: EditorView, oldFencedCode: DecorationSet) {
  const fencedCode: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old inlineCode
    // for now.
    if (!syntaxTree) {
      return oldFencedCode;
    }

    syntaxTree.iterate({
      enter: (node) => {
        if (node.type.is('FencedCode')) {
          const firstLine = view.state.doc.lineAt(node.from).number;
          const lastLine = view.state.doc.lineAt(node.to).number;
          for (let i = firstLine; i <= lastLine; i++) {
            const lineFrom = view.state.doc.line(i).from;

            fencedCode.push(codeBlockMarker.range(lineFrom, lineFrom));

            if (i === firstLine) {
              fencedCode.push(codeBlockMarkerStart.range(lineFrom, lineFrom));
            }

            if (i === lastLine) {
              fencedCode.push(codeBlockMarkerEnd.range(lineFrom, lineFrom));
            }
          }
        }
      },
      from,
      to,
    });
  }
  return Decoration.set(fencedCode);
}

const fencedCodePlugin = ViewPlugin.fromClass(
  class {
    fencedCode: DecorationSet;

    constructor(view: EditorView) {
      this.fencedCode = fencedCode(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.fencedCode = fencedCode(update.view, this.fencedCode);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.fencedCode,
  },
);

export default fencedCodePlugin;
