import {
  EditorSelection,
  EditorState,
  StateCommand,
  Transaction,
} from '@codemirror/state';

import { LinkState } from './links';

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
const existingPrefixRegex = /^(#+|[*+-]( \[[ x]])?|\d+\.|\d+\. \[[ x]]|>)\s/;

function prefixSelectedLinesWith(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  newPrefix: string,
) {
  const changes = state.selection.ranges.flatMap((range) => {
    const lineFrom = state.doc.lineAt(range.from);
    const lineTo = state.doc.lineAt(range.to);

    return Array.from(
      { length: lineTo.number - lineFrom.number + 1 },
      (_, index) => lineFrom.number + index,
    ).map((lineNumber) => {
      const line = state.doc.line(lineNumber);

      let existingPrefix = '';
      const existingPrefixMatches = existingPrefixRegex.exec(line.text);
      if (existingPrefixMatches) {
        existingPrefix = existingPrefixMatches[0];
      }

      const formattedNewPrefix = newPrefix.replaceAll(
        String.raw`\d`,
        String(lineNumber - lineFrom.number + 1),
      );

      return {
        from: line.from,
        insert: formattedNewPrefix,
        to: line.from + existingPrefix.length,
      };
    });
  });

  dispatch(
    state.update({
      changes,
    }),
  );

  return true;
}

function insertOrReplaceText(
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  text: string,
) {
  const changes = state.selection.ranges.map((range) => {
    return { from: range.from, insert: text, to: range.to };
  });

  // Create a temporary transaction to get the new selection which we can then
  // modify so we don't have to implement selection update logic which should
  // include multi cursor support.
  const transaction = state.update({
    changes,
  });

  dispatch(
    state.update({
      changes,
      selection: EditorSelection.create(
        transaction.newSelection.ranges.map((range) => {
          if (range.from === range.to) {
            return EditorSelection.cursor(range.from + text.length);
          }
          return EditorSelection.range(range.from, range.to);
        }),
      ),
    }),
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
  insertOrReplaceText(state, dispatch, '```\n\n```');

// TODO(markdown-commands): Implement a more sophisticated image insertion command
export const insertImage: StateCommand = ({ dispatch, state }) =>
  insertOrReplaceText(state, dispatch, '![alt](src)');

// TOOD(markdown-commands): Implement a more sophisticated table insertion command
export const insertTable: StateCommand = ({ dispatch, state }) =>
  insertOrReplaceText(state, dispatch, '|   |   |\n|---|---|\n|   |   |');

export const insertEmptyLink: StateCommand = ({ dispatch, state }) =>
  insertOrReplaceText(state, dispatch, `[]()`);

export const insertLink: ({
  text,
  url,
}: {
  text: string;
  url: string;
}) => StateCommand =
  ({ text, url }) =>
  ({ dispatch, state }) =>
    insertOrReplaceText(state, dispatch, `[${text}](${url})`);

export function updateLink({
  dispatch,
  state,
  text,
  url,
}: {
  dispatch: (tr: Transaction) => void;
  state: EditorState;
  text: { content: string; from: number; to: number };
  url: { content: string; from: number; to: number };
}) {
  dispatch(
    state.update({
      changes: [
        { from: text.from, insert: text.content, to: text.to },
        { from: url.from, insert: url.content, to: url.to },
      ],
    }),
  );
  return true;
}

export function removeLink({
  dispatch,
  selectedLink,
  state,
}: {
  dispatch: (tr: Transaction) => void;
  selectedLink: LinkState;
  state: EditorState;
}) {
  dispatch(
    state.update({
      changes: [
        {
          from: selectedLink.from,
          insert: selectedLink.text.content,
          to: selectedLink.to,
        },
      ],
    }),
  );
  return true;
}
