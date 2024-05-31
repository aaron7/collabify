import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

import './syntax-highlighting.css';

const markdownTagClasses = HighlightStyle.define([
  { class: 't-character', tag: tags.character },
  { class: 't-comment', tag: tags.comment },
  { class: 't-content', tag: tags.content },
  { class: 't-content-separator', tag: tags.contentSeparator },
  { class: 't-emphasis', tag: tags.emphasis },
  { class: 't-escape', tag: tags.escape },
  { class: 't-heading1', tag: tags.heading1 },
  { class: 't-heading2', tag: tags.heading2 },
  { class: 't-heading3', tag: tags.heading3 },
  { class: 't-heading4', tag: tags.heading4 },
  { class: 't-heading5', tag: tags.heading5 },
  { class: 't-heading6', tag: tags.heading6 },
  { class: 't-block-label', tag: tags.labelName },
  { class: 't-link', tag: tags.link },
  { class: 't-list', tag: tags.list },
  { class: 't-monospace', tag: tags.monospace },
  { class: 't-processing-instruction', tag: tags.processingInstruction },
  { class: 't-quote', tag: tags.quote },
  { class: 't-strikethrough', tag: tags.strikethrough },
  { class: 't-string', tag: tags.string },
  { class: 't-strong', tag: tags.strong },
  { class: 't-url', tag: tags.url },
]);

export default syntaxHighlighting(markdownTagClasses);
