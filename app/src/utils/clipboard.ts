import showdown from 'showdown';
import { toast } from 'sonner';

const showdownConverter = new showdown.Converter({
  strikethrough: true,
  tables: true,
});

export async function copyToClipboard(text: string): Promise<void> {
  const richText = showdownConverter.makeHtml(text);
  const clipboardItem = new ClipboardItem({
    'text/html': new Blob([richText], { type: 'text/html' }),
    'text/plain': new Blob([text], { type: 'text/plain' }),
  });

  await navigator.clipboard.write([clipboardItem]).catch(() => {
    toast.error('Failed to copy to clipboard');
  });
}
