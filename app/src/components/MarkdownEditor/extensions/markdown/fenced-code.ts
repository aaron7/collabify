import { ensureSyntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';

import { EmptyWidget } from './utils/empty-widget';
import { overlapsWithSelection } from './utils/selection';

import './fenced-code.css';

const codeBlockMarker = Decoration.line({ class: 'md-codeblock' });
const codeBlockMarkerStart = Decoration.line({ class: 'md-codeblock-start' });
const codeBlockMarkerEnd = Decoration.line({ class: 'md-codeblock-end' });
const codeBlockInactive = Decoration.line({
  class: 'md-codeblock-start-inactive',
});

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

    const emptyWidget = Decoration.replace({
      widget: new EmptyWidget(view),
    });

    syntaxTree.iterate({
      enter: (node) => {
        if (node.type.is('FencedCode')) {
          const isSelected = overlapsWithSelection({
            range: { from: node.from, to: node.to },
            state: view.state,
          });

          if (!isSelected) {
            fencedCode.push(codeBlockInactive.range(node.from, node.from));
            const codeMarks = node.node.getChildren('CodeMark');
            for (const codeMark of codeMarks) {
              fencedCode.push(emptyWidget.range(codeMark.from, codeMark.to));
            }
          }

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
  return Decoration.set(
    fencedCode.sort(
      (a, b) => a.from - b.from || a.value.startSide - b.value.startSide,
    ),
  );
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
