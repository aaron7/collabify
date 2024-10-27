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

const selectionStateKeysToNodeType: Record<
  SelectionStateKey,
  { disableMultiSelect?: boolean; nodeType: string }
> = {
  blockquote: { nodeType: 'Blockquote' },
  bold: { nodeType: 'StrongEmphasis' },
  bulletList: { nodeType: 'BulletList' },
  fencedCode: { disableMultiSelect: true, nodeType: 'FencedCode' },
  heading1: { nodeType: 'ATXHeading1' },
  heading2: { nodeType: 'ATXHeading2' },
  heading3: { nodeType: 'ATXHeading3' },
  heading4: { nodeType: 'ATXHeading4' },
  heading5: { nodeType: 'ATXHeading5' },
  heading6: { nodeType: 'ATXHeading6' },
  image: { disableMultiSelect: true, nodeType: 'Image' },
  inlineCode: { nodeType: 'InlineCode' },
  italic: { nodeType: 'Emphasis' },
  link: { disableMultiSelect: true, nodeType: 'Link' },
  orderedList: { nodeType: 'OrderedList' },
  strikethrough: { nodeType: 'Strikethrough' },
  table: { disableMultiSelect: true, nodeType: 'Table' },
  task: { nodeType: 'Task' },
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

function doesNodeTypeSpanEntireSelection(
  state: EditorState,
  from: number,
  to: number,
  nodeType: string,
) {
  const tree = syntaxTree(state);

  let spansSelection = false;

  tree.iterate({
    enter: (node: SyntaxNode) => {
      if (node.type.name === nodeType) {
        if (node.from <= from && node.to >= to) {
          spansSelection = true;
          return false; // Stop further iteration once we find the containing node
        }
      }
    },
    from,
    to,
  });

  return spansSelection;
}

function getSelectionState(state: EditorState): SelectionState {
  const ranges = state.selection.ranges;

  const entries: [
    SelectionStateKey,
    { disableMultiSelect?: boolean; nodeType: string },
  ][] = Object.entries(selectionStateKeysToNodeType) as [
    SelectionStateKey,
    { disableMultiSelect?: boolean; nodeType: string },
  ][];

  const result = entries.reduce(
    (acc, [key, { disableMultiSelect, nodeType }]) => {
      if (disableMultiSelect && ranges.length > 1) {
        acc[key] = false;
        return acc;
      }

      acc[key] = ranges.every((range) => {
        const lineFrom = state.doc.lineAt(range.from);
        const lineTo = state.doc.lineAt(range.to);

        // If the selection is a single line, only check within the specific range
        if (lineFrom.number === lineTo.number) {
          if (nodeType === 'Task') {
            return isNodeTypeInSelection(state, range.from, range.to, nodeType);
          }

          return doesNodeTypeSpanEntireSelection(
            state,
            range.from,
            range.to,
            nodeType,
          );
        }

        // If we can multi select and the selection spans multiple lines, check
        // each line even if it's not fully selected
        if (!disableMultiSelect) {
          return Array.from(
            { length: lineTo.number - lineFrom.number + 1 },
            (_, index) => lineFrom.number + index,
          ).every((lineNumber) => {
            const line = state.doc.line(lineNumber);

            // Because Lezer Task nodes don't span the entire line unlike List
            // nodes, we special case it here to only check if it's within the
            // selection
            if (nodeType === 'Task') {
              return isNodeTypeInSelection(state, line.from, line.to, nodeType);
            }

            return doesNodeTypeSpanEntireSelection(
              state,
              line.from,
              line.to,
              nodeType,
            );
          });
        }

        return doesNodeTypeSpanEntireSelection(
          state,
          range.from,
          range.to,
          nodeType,
        );
      });
      return acc;
    },
    {} as SelectionState,
  );

  // Task lists are also lists, so only return the task key
  if (result.task) {
    result.bulletList = false;
    result.orderedList = false;
  }

  return result;
}

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
