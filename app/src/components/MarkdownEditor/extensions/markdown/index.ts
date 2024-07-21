import { Prec } from '@codemirror/state';

import markdownCommands from './commands';
import markdownFormatting from './formatting';
import markdownHeadings from './headings';

const markdownPlugin = [
  markdownHeadings,
  markdownFormatting,
  Prec.high(markdownCommands),
];

export default markdownPlugin;
