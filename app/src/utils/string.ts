export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/\s+/g, '-') // Replace spaces with -
    .replaceAll(/[^\w\-]+/g, '') // Remove all non-word chars
    .replaceAll(/--+/g, '-') // Replace multiple - with single -
    .replace(/-+$/, ''); // Remove trailing - at the end
}
