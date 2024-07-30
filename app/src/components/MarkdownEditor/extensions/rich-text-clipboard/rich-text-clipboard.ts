import { ensureSyntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import TurndownService from '@joplin/turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  headingStyle: 'atx',
  hr: '---',
});
turndownService.use(gfm);

const getCurrentSelectedNode = (view: EditorView) => {
  const currentSelection = view.state.selection.main;
  const syntaxTree = ensureSyntaxTree(view.state, currentSelection.from, 1500);
  if (!syntaxTree) {
    // Don't worry if we couldn't get the syntax tree in time
    return null;
  }
  return syntaxTree.resolve(currentSelection.from, -1);
};

const createRichTextClipboardPlugin = () => {
  let isShiftDown = false;

  return EditorView.domEventHandlers({
    keydown: (event) => {
      if (event.key === 'Shift') {
        isShiftDown = true;
      }
      return false;
    },
    keyup: (event) => {
      if (event.key === 'Shift') {
        isShiftDown = false;
      }
      return false;
    },
    paste: (event: ClipboardEvent, view: EditorView) => {
      const clipboardData = event.clipboardData;
      const richText = clipboardData?.getData('text/html');

      const isPasteFromUser = event.isTrusted;
      if (!clipboardData || !richText || isShiftDown || !isPasteFromUser) {
        return false;
      }

      // Don't paste rich text if the current selection is a code block
      const currentSelectedNode = getCurrentSelectedNode(view);
      if (currentSelectedNode?.type.name === 'FencedCode') {
        return false;
      }

      // Don't paste rich text if the clipboard is from VSCode
      if (clipboardData.types.includes('vscode-editor-data')) {
        return false;
      }

      const markdown = turndownService.turndown(richText);

      const newClipboardData = new DataTransfer();
      newClipboardData.setData('text/plain', markdown);

      // Dispatch a new paste event with the markdown content
      const newPasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: newClipboardData,
        composed: true,
      });
      event.target?.dispatchEvent(newPasteEvent);

      return true;
    },
  });
};

const richTextClipboardPlugin = createRichTextClipboardPlugin();

export default richTextClipboardPlugin;
