import { CompletionSource } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { search as searchEmoji } from 'node-emoji';

const emojiCompletionSource: CompletionSource = (context) => {
  const word = context.matchBefore(/(?<=^|\s):\w+$/);
  if (!word) {
    return null;
  }

  const searchResults = searchEmoji(word.text.slice(1));
  return {
    from: word.from,
    options: searchResults.map((result) => ({
      detail: result.emoji,
      label: `:${result.name}:`,
      type: 'emoji',
    })),
  };
};

const emojiAutocomplete = EditorState.languageData.of(() => [
  { autocomplete: emojiCompletionSource },
]);

export default emojiAutocomplete;
