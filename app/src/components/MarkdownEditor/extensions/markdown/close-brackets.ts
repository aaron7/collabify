import { markdownLanguage } from '@codemirror/lang-markdown';
import { EditorSelection, Prec, type ChangeSpec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

const closeBrackets = markdownLanguage.data.of({
  closeBrackets: {
    brackets: ['(', '[', '{', "'", '"', '`', '*', '*', '_', '~'],
  },
});

/**
 * `markdownLanguage` supports closing triple backticks, but the following
 * extension closes the brackets on the next line while keeping the
 * selection in place.
 */
const closeFencedCodeBrackets = Prec.high(
  EditorView.inputHandler.of((view, from, to, text) => {
    const before = view.state.doc.sliceString(from - 2, from) + text;

    if (before === '```') {
      const changes: ChangeSpec[] = [
        {
          from,
          insert: text + '\n```\n',
          to,
        },
      ];

      view.dispatch({
        changes,
        selection: EditorSelection.cursor(to + 1),
      });
      return true;
    }
    return false;
  }),
);

export default [closeBrackets, closeFencedCodeBrackets];
