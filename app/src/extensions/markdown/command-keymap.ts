import { keymap } from '@codemirror/view';

import {
  insertEmptyLink,
  makeHeading1,
  makeHeading2,
  makeHeading3,
  makeHeading4,
  makeHeading5,
  makeHeading6,
  makeOrderedList,
  makeParagraph,
  makeTaskList,
  makeUnorderedList,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
} from './commands';

const markdownKeymap = keymap.of([
  { key: 'Mod-b', run: toggleBold },
  { key: 'Mod-i', run: toggleItalic },
  { key: 'Mod-shift-s', run: toggleStrikethrough },
  { key: 'Mod-alt-0', run: makeParagraph },
  { key: 'Mod-alt-1', run: makeHeading1 },
  { key: 'Mod-alt-2', run: makeHeading2 },
  { key: 'Mod-alt-3', run: makeHeading3 },
  { key: 'Mod-alt-4', run: makeHeading4 },
  { key: 'Mod-alt-5', run: makeHeading5 },
  { key: 'Mod-alt-6', run: makeHeading6 },
  { key: 'Mod-Shift-7', run: makeOrderedList },
  { key: 'Mod-Shift-8', run: makeUnorderedList },
  { key: 'Mod-Shift-9', run: makeTaskList },
  { key: 'Mod-l', run: makeTaskList },
  { key: 'Mod-k', run: insertEmptyLink },
]);

export default markdownKeymap;
