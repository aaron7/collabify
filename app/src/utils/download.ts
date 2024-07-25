import { getTitle } from './doc';
import { slugify } from './string';

export function downloadAsMarkdown(content: string) {
  const filename = `${slugify(getTitle(content))}.md`;
  const blob = new Blob([content], { type: 'text/markdown' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
