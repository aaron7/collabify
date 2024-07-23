import { markdownLanguage } from '@codemirror/lang-markdown';

const closeBrackets = markdownLanguage.data.of({
  closeBrackets: {
    brackets: ['(', '[', '{', "'", '"', '`', '```', '*', '**', '_', '__'],
  },
});

export default closeBrackets;
