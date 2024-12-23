import { markdownKeymap } from '@codemirror/lang-markdown';
import { indentUnit } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';

import closeBrackets from './close-brackets';
import commandKeymap from './command-keymap';
import fencedCode from './fenced-code';
import formatting from './formatting';
import headings from './headings';
import horizontalRule from './horizontal-rule';
import images from './images';
import inlineCode from './inline-code';
import isMouseDown from './is-mouse-down';
import links from './links';
import lists from './lists';

// Remove the Backspace binding from the default markdown keymap because
// deleting the list and blockquote markdown syntax when deleting the space
// after it is not expected.
const markdownKeymapWithoutDeletion = markdownKeymap.filter(
  (binding) => binding.key !== 'Backspace',
);

const markdownPlugin = [
  isMouseDown,
  closeBrackets,
  fencedCode,
  formatting,
  headings,
  horizontalRule,
  indentUnit.of('    '),
  inlineCode,
  lists,
  links,
  images,
  Prec.high(commandKeymap),
  Prec.high(keymap.of(markdownKeymapWithoutDeletion)),
];

export default markdownPlugin;
