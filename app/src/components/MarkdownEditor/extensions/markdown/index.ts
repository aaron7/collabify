import { Prec } from '@codemirror/state';

import commands from './commands';
import formatting from './formatting';
import headings from './headings';
import horizontalRule from './horizontal-rule';
import inlineCode from './inline-code';

const markdownPlugin = [
  headings,
  formatting,
  inlineCode,
  Prec.high(commands),
  horizontalRule,
];

export default markdownPlugin;
