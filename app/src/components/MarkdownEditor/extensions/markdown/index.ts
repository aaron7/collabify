import { Prec } from '@codemirror/state';

import closeBrackets from './close-brackets';
import commands from './commands';
import formatting from './formatting';
import headings from './headings';
import horizontalRule from './horizontal-rule';
import inlineCode from './inline-code';
import link from './link.tsx';

const markdownPlugin = [
  headings,
  formatting,
  inlineCode,
  Prec.high(commands),
  horizontalRule,
  closeBrackets,
  link,
];

export default markdownPlugin;
