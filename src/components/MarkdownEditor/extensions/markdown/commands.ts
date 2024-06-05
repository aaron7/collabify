import {
  EditorSelection,
  EditorState,
  StateCommand,
  Transaction,
} from '@codemirror/state';
import { keymap } from '@codemirror/view';

export function wrapTextWith(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  openString: string,
  closeString: string = openString,
) {
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const getTargetRange = (from: number, to: number) => {
          if (from === to) {
            // If no selection, use the word at the cursor
            const word = state.wordAt(from);
            if (!word) {
              return { from, to };
            }
            return { from: word.from, to: word.to };
          }
          return { from, to };
        };

        const { from, to } = getTargetRange(range.from, range.to);

        const existingOpen = state.sliceDoc(from - openString.length, from);
        const existingClose = state.sliceDoc(to, to + closeString.length);

        if (existingOpen === openString && existingClose === closeString) {
          // Undo the wrapping if the selection is already wrapped
          return {
            changes: [
              { from: from - openString.length, insert: '', to: from },
              { from: to, insert: '', to: to + closeString.length },
            ],
            range: EditorSelection.range(
              range.from - openString.length,
              range.to - openString.length,
            ),
          };
        }

        return {
          changes: [
            { from, insert: openString },
            { from: to, insert: closeString },
          ],
          range: EditorSelection.range(
            range.from + openString.length,
            range.to + openString.length,
          ),
        };
      }),
    ),
  );

  return true;
}

export const makeBold: StateCommand = ({ dispatch, state }) =>
  wrapTextWith(state, dispatch, '**');

export const makeItalic: StateCommand = ({ dispatch, state }) =>
  wrapTextWith(state, dispatch, '*');

export const makeStrikethrough: StateCommand = ({ dispatch, state }) =>
  wrapTextWith(state, dispatch, '~~');

const markdownKeymap = keymap.of([
  { key: 'Mod-b', run: makeBold },
  { key: 'Mod-i', run: makeItalic },
  { key: 'Mod-shift-s', run: makeStrikethrough },
]);

export default markdownKeymap;
