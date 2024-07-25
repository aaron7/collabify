export function getTitle(doc: string) {
  const titleMatch = doc.match(/^# (.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled';
}
