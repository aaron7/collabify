import { syntaxTree } from '@codemirror/language';
import { EditorState, RangeSetBuilder, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

import './fenced-code.css';

const codeBlockMarker = Decoration.line({ class: 'md-codeblock' });
const codeBlockMarkerStart = Decoration.line({ class: 'md-codeblock-start' });
const codeBlockMarkerEnd = Decoration.line({ class: 'md-codeblock-end' });

const decorateFencedCode = (state: EditorState) => {
  const builder = new RangeSetBuilder<Decoration>();
  syntaxTree(state).iterate({
    enter(node) {
      if (node.type.is('FencedCode')) {
        const firstLine = state.doc.lineAt(node.from).number;
        const lastLine = state.doc.lineAt(node.to).number;
        for (let i = firstLine; i <= lastLine; i++) {
          builder.add(
            state.doc.line(i).from,
            state.doc.line(i).from,
            codeBlockMarker,
          );

          // Add addional markers for the first and last line of the code block
          if (i === firstLine) {
            builder.add(
              state.doc.line(i).from,
              state.doc.line(i).from,
              codeBlockMarkerStart,
            );
          }
          if (i === lastLine) {
            builder.add(
              state.doc.line(i).from,
              state.doc.line(i).from,
              codeBlockMarkerEnd,
            );
          }
        }
      }
    },
  });
  return builder.finish();
};

const CodeBlockField = StateField.define<DecorationSet>({
  create(state) {
    return decorateFencedCode(state);
  },

  provide(field) {
    return EditorView.decorations.from(field);
  },

  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    return decorateFencedCode(tr.state);
  },
});

export default CodeBlockField;
