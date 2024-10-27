import { defaultHighlightStyle, HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const lightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#fff',
    },
  },
  {
    dark: false,
  },
);

export const lightHighlightStyle = HighlightStyle.define([
  ...defaultHighlightStyle.specs,

  { color: 'hsl(var(--primary))', tag: tags.heading },
  {
    color: 'hsl(var(--secondary))',
    tag: [tags.processingInstruction, tags.string, tags.inserted],
  },
]);
