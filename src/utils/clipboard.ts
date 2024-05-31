export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).catch((error) => {
    // TODO: Show a toast notification to the user that the copy failed.
  });
}
