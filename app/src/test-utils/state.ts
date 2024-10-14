// Useful test helpers from https://github.com/codemirror/commands/blob/6.6.0/test/state.ts

import { EditorSelection, EditorState, Extension } from '@codemirror/state';

export function mkState(
  doc: string,
  extensions: Extension = [],
  cursorChar: string = String.raw`\|`,
) {
  const rangeRegex = new RegExp(`${cursorChar}|<([^]*?)>`, 'g');
  let m;
  const ranges = [];
  while ((m = rangeRegex.exec(doc))) {
    if (m[1]) {
      ranges.push(EditorSelection.range(m.index, m.index + m[1].length));
      doc =
        doc.slice(0, m.index) +
        doc.slice(m.index + 1, m.index + 1 + m[1].length) +
        doc.slice(m.index + m[0].length);
      rangeRegex.lastIndex -= 2;
    } else {
      ranges.push(EditorSelection.cursor(m.index));
      doc = doc.slice(0, m.index) + doc.slice(m.index + 1);
      rangeRegex.lastIndex--;
    }
  }
  return EditorState.create({
    doc,
    extensions: [extensions, EditorState.allowMultipleSelections.of(true)],
    selection: ranges.length ? EditorSelection.create(ranges) : undefined,
  });
}

export function stateStr(state: EditorState) {
  let doc = state.doc.toString();
  for (let i = state.selection.ranges.length - 1; i >= 0; i--) {
    const range = state.selection.ranges[i];
    doc = range.empty
      ? doc.slice(0, range.from) + '|' + doc.slice(range.from)
      : doc.slice(0, range.from) +
        '<' +
        doc.slice(range.from, range.to) +
        '>' +
        doc.slice(range.to);
  }
  return doc;
}
