import { EditorState } from '@codemirror/state';

export function overlapsWithSelection({
  range: { from, to },
  state,
}: {
  range: {
    from: number;
    to: number;
  };
  state: EditorState;
}) {
  const ranges = state.selection.ranges;

  let low = 0;
  let high = ranges.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const range = ranges[mid];

    if (range.to < from) {
      low = mid + 1;
    } else if (range.from > to) {
      high = mid - 1;
    } else {
      return true;
    }
  }

  return false;
}
