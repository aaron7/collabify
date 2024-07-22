import { Prec } from '@codemirror/state';

import markdownCommands from './commands';
import markdownFormatting from './formatting';
import markdownHeadings from './headings';
import inlineCode from './inline-code';

const markdownPlugin = [
  markdownHeadings,
  markdownFormatting,
  inlineCode,
  Prec.high(markdownCommands),
];

export default markdownPlugin;
