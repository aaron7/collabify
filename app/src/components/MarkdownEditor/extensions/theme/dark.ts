import { HighlightStyle } from '@codemirror/language';
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from '@codemirror/theme-one-dark';
import { tags } from '@lezer/highlight';

export const darkTheme = oneDarkTheme;

export const darkHighlightStyle = HighlightStyle.define([
  ...oneDarkHighlightStyle.specs,

  { color: 'hsl(var(--primary))', tag: tags.heading },
  {
    color: 'hsl(var(--secondary))',
    tag: [tags.processingInstruction, tags.string, tags.inserted],
  },
]);
