import { EditorView, Rect, WidgetType } from '@codemirror/view';

export class EmptyWidget extends WidgetType {
  private view: EditorView | null = null;

  override eq() {
    return true;
  }

  toDOM(view: EditorView) {
    this.view = view;
    return document.createElement('span');
  }

  override coordsAt(dom: HTMLElement): Rect | null {
    if (!this.view) {
      return null;
    }

    // Return the position of the element after the empty widget
    // which allows remote cursors to render correctly.
    const elementAfterWidget = dom.nextElementSibling?.nextElementSibling;
    if (elementAfterWidget) {
      const elementAfterWidgetPos = this.view.posAtDOM(elementAfterWidget);
      return this.view.coordsAtPos(elementAfterWidgetPos, 1);
    }

    return null;
  }
}
