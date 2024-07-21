import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { JSDOM } from 'jsdom';

export function tempView(state: EditorState): EditorView {
  const view = new EditorView({ state });

  const document = new JSDOM(`<!DOCTYPE html><div id="workspace"></div>`, {
    pretendToBeVisual: true,
  }).window.document;
  const workspace: HTMLElement = document.querySelector(
    '#workspace',
  )! as HTMLElement;
  workspace.append(view.dom);

  return view;
}
