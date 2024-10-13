import {
  EditorSelection,
  EditorState,
  StateCommand,
  Transaction,
} from '@codemirror/state';

function getWrapTargetRange(state: EditorState, from: number, to: number) {
  if (from === to) {
    // If no selection, use the word at the cursor
    const word = state.wordAt(from);
    if (!word) {
      return { from, to };
    }
    return { from: word.from, to: word.to };
  }
  return { from, to };
}

function wrapSelectedTextWith(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  openString: string,
  closeString: string = openString,
) {
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const { from, to } = getWrapTargetRange(state, range.from, range.to);

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

// TODO(markdown-commands): Instead of using a regex to find existing prefixes,
// identify the marks and positions from the syntax tree.
const existingPrefixRegex = /^(#+|[*+-]( \[[ x]])?|\d+\.|\d+\. \[[ x]])\s/;

function prefixSelectedLinesWith(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  newPrefix: string,
) {
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const lineFrom = state.doc.lineAt(range.from);
        const lineTo = state.doc.lineAt(range.to);

        const changes = [];

        // Keep track of the first line prefix and the character count change
        // to adjust the final cursor position correctly
        let firstLineExistingPrefix = '';
        let firstLineNewPrefix = '';
        let characterCountChange = 0;

        for (
          let lineNumber = lineFrom.number;
          lineNumber <= lineTo.number;
          lineNumber++
        ) {
          const line = state.doc.line(lineNumber);

          let existingPrefix = '';
          const existingPrefixMatches = existingPrefixRegex.exec(line.text);
          if (existingPrefixMatches) {
            existingPrefix = existingPrefixMatches[0];
          }

          // Replace `\d` with the incremental list number
          const formattedNewPrefix = newPrefix.replaceAll(
            String.raw`\d`,
            String(lineNumber - lineFrom.number + 1),
          );

          if (lineNumber === lineFrom.number) {
            firstLineExistingPrefix = existingPrefix;
            firstLineNewPrefix = formattedNewPrefix;
          }

          characterCountChange -= existingPrefix.length;
          characterCountChange += formattedNewPrefix.length;

          changes.push({
            from: line.from,
            insert: formattedNewPrefix,
            to: line.from + existingPrefix.length,
          });
        }

        const existingPrefixLengthBeforeCursor = Math.min(
          firstLineExistingPrefix.length,
          range.from - lineFrom.from,
        );

        return {
          changes,
          range: EditorSelection.range(
            range.from -
              existingPrefixLengthBeforeCursor +
              firstLineNewPrefix.length,
            range.to + characterCountChange,
          ),
        };
      }),
    ),
  );

  return true;
}

function insertText(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  text: string,
) {
  dispatch(
    state.update(
      state.changeByRange((range) => {
        return {
          changes: [{ from: range.from, insert: text }],
          range: EditorSelection.range(
            range.from + text.length,
            range.from + text.length,
          ),
        };
      }),
    ),
  );
  return true;
}

export const makeHeading1: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '# ');

export const makeHeading2: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '## ');

export const makeHeading3: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '### ');

export const makeHeading4: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '#### ');

export const makeHeading5: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '##### ');

export const makeHeading6: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '###### ');

export const makeUnorderedList: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '- ');

export const makeOrderedList: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, String.raw`\d. `);

export const makeTaskList: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '- [ ] ');

export const makeParagraph: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '');

export const makeBlockquote: StateCommand = ({ dispatch, state }) =>
  prefixSelectedLinesWith(state, dispatch, '> ');

export const toggleBold: StateCommand = ({ dispatch, state }) =>
  wrapSelectedTextWith(state, dispatch, '**');

export const toggleItalic: StateCommand = ({ dispatch, state }) =>
  wrapSelectedTextWith(state, dispatch, '*');

export const toggleStrikethrough: StateCommand = ({ dispatch, state }) =>
  wrapSelectedTextWith(state, dispatch, '~~');

export const toggleInlineCode: StateCommand = ({ dispatch, state }) =>
  wrapSelectedTextWith(state, dispatch, '`');

// TODO(markdown-commands): Insert cursor in the middle of the fenced code block
export const insertFencedCode: StateCommand = ({ dispatch, state }) =>
  insertText(state, dispatch, '```\n\n```');

// TODO(markdown-commands): Implement a more sophisticated image insertion command
export const insertImage: StateCommand = ({ dispatch, state }) =>
  insertText(state, dispatch, '![alt](src)');

// TOOD(markdown-commands): Implement a more sophisticated table insertion command
export const insertTable: StateCommand = ({ dispatch, state }) =>
  insertText(state, dispatch, '|   |   |\n|---|---|\n|   |   |');

// TODO(markdown-commands): Implement a more sophisticated link insertion command
export const insertLink: StateCommand = ({ dispatch, state }) =>
  insertText(state, dispatch, '[text](url)');
