import { EditorView, Rect, WidgetType } from '@codemirror/view';

export class EmptyWidget extends WidgetType {
  constructor(readonly view: EditorView) {
    super();
  }

  override eq() {
    return true;
  }

  toDOM() {
    return document.createElement('span');
  }

  override coordsAt(dom: HTMLElement): Rect | null {
    // Return the position of the element after the empty widget
    // which allows remote cursors to render correctly.
    const elementAfterWidget = dom.nextElementSibling;
    if (elementAfterWidget) {
      const elementAfterWidgetPos = this.view.posAtDOM(elementAfterWidget);
      return this.view.coordsAtPos(elementAfterWidgetPos, 1);
    }
    return null;
  }
}
