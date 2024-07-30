import showdown from 'showdown';

const showdownConverter = new showdown.Converter({
  strikethrough: true,
  tables: true,
});

export async function copyToClipboard(text: string): Promise<void> {
  const richText = showdownConverter.makeHtml(text);
  const clipboardItem = new ClipboardItem({
    'text/plain': new Blob([text], { type: 'text/plain' }),
    'text/html': new Blob([richText], { type: 'text/html' }),
  });

  await navigator.clipboard.write([clipboardItem]).catch((error) => {
    // TODO: Show a toast notification to the user that the copy failed.
  });
}
