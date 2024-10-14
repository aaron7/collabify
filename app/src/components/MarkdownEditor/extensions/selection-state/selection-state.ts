import { syntaxTree } from '@codemirror/language';
import { EditorState, StateField } from '@codemirror/state';
import { SyntaxNode } from '@lezer/common';

export type SelectionState = {
  blockquote: boolean;
  bold: boolean;
  bulletList: boolean;
  fencedCode: boolean;
  heading1: boolean;
  heading2: boolean;
  heading3: boolean;
  heading4: boolean;
  heading5: boolean;
  heading6: boolean;
  image: boolean;
  inlineCode: boolean;
  italic: boolean;
  link: boolean;
  orderedList: boolean;
  strikethrough: boolean;
  table: boolean;
  task: boolean;
};

export type SelectionStateKey = keyof SelectionState;

const selectionStateKeysToNodeType: Record<SelectionStateKey, string> = {
  blockquote: 'Blockquote',
  bold: 'StrongEmphasis',
  bulletList: 'BulletList',
  fencedCode: 'FencedCode',
  heading1: 'ATXHeading1',
  heading2: 'ATXHeading2',
  heading3: 'ATXHeading3',
  heading4: 'ATXHeading4',
  heading5: 'ATXHeading5',
  heading6: 'ATXHeading6',
  image: 'Image',
  inlineCode: 'InlineCode',
  italic: 'Emphasis',
  link: 'Link',
  orderedList: 'OrderedList',
  strikethrough: 'Strikethrough',
  table: 'Table',
  task: 'Task',
};

function isNodeTypeInSelection(
  state: EditorState,
  from: number,
  to: number,
  nodeType: string,
) {
  const tree = syntaxTree(state);

  let inSelection = false;

  tree.iterate({
    enter: (node: SyntaxNode) => {
      if (node.type.name === nodeType) {
        inSelection = true;
        return false; // Stop further iteration once we find the containing node
      }
    },
    from,
    to,
  });

  return inSelection;
}

const getSelectionState = (state: EditorState): SelectionState => {
  const ranges = state.selection.ranges;

  const entries: [SelectionStateKey, string][] = Object.entries(
    selectionStateKeysToNodeType,
  ) as [SelectionStateKey, string][];

  const result = entries.reduce((acc, [key, nodeType]) => {
    acc[key] = ranges.every((range) => {
      const lineFrom = state.doc.lineAt(range.from);
      const lineTo = state.doc.lineAt(range.to);

      // If the selection is a single line, only check within the specific range
      if (lineFrom.number === lineTo.number) {
        return isNodeTypeInSelection(state, range.from, range.to, nodeType);
      }

      // If the selection spans multiple lines, check the entire line ranges
      // even if it's not part of the selection
      return Array.from(
        { length: lineTo.number - lineFrom.number + 1 },
        (_, index) => lineFrom.number + index,
      ).every((lineNumber) => {
        const line = state.doc.line(lineNumber);
        return isNodeTypeInSelection(state, line.from, line.to, nodeType);
      });
    });
    return acc;
  }, {} as SelectionState);

  return result;
};

type CreateSelectionStatePluginProps = {
  setSelectionState: (state: SelectionState) => void;
};

const createSelectionStatePlugin = ({
  setSelectionState,
}: CreateSelectionStatePluginProps) =>
  StateField.define({
    create(state) {
      const initialValue = getSelectionState(state);
      setSelectionState(initialValue);
      return initialValue;
    },
    update(value, tr) {
      if (tr.docChanged || tr.selection) {
        const newValue = getSelectionState(tr.state);
        setSelectionState(newValue);
        return newValue;
      }

      return value;
    },
  });

export default createSelectionStatePlugin;
