import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { JSDOM } from 'jsdom';

export function tempView(doc = '', extensions: Extension = []): EditorView {
  const view = new EditorView({
    state: EditorState.create({ doc, extensions }),
  });

  const document = new JSDOM(`<!DOCTYPE html><div id="workspace"></div>`, {
    pretendToBeVisual: true,
  }).window.document;
  const workspace: HTMLElement = document.querySelector(
    '#workspace',
  )! as HTMLElement;
  workspace.append(view.dom);

  return view;
}
