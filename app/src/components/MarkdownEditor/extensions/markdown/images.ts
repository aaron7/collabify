import { ensureSyntaxTree } from '@codemirror/language';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view';

import { hasMouseDownStateChanged, isMouseDown } from './is-mouse-down';
import { EmptyWidget } from './utils/empty-widget';
import { overlapsWithSelection } from './utils/selection';

export class ImageWidget extends WidgetType {
  constructor(
    readonly imageUrl: string,
    readonly onClickSetSelectionFrom: number,
    readonly onClickSetSelectionTo: number,
  ) {
    super();
  }

  override eq(other: ImageWidget) {
    return (
      other.imageUrl == this.imageUrl &&
      other.onClickSetSelectionFrom == this.onClickSetSelectionFrom &&
      other.onClickSetSelectionTo == this.onClickSetSelectionTo
    );
  }

  toDOM(view: EditorView) {
    const image = document.createElement('img');
    image.classList.add('inline');
    image.setAttribute('src', this.imageUrl || '');
    image.onclick = () =>
      this.handleClick(
        view,
        this.onClickSetSelectionFrom,
        this.onClickSetSelectionTo,
      );
    return image;
  }

  override updateDOM(dom: HTMLElement, view: EditorView): boolean {
    const image = dom as HTMLImageElement;
    image.setAttribute('src', this.imageUrl || '');
    image.onclick = () =>
      this.handleClick(
        view,
        this.onClickSetSelectionFrom,
        this.onClickSetSelectionTo,
      );
    return true;
  }

  handleClick(
    view: EditorView,
    onClickSetSelectionFrom: number,
    onClickSetSelectionTo: number,
  ) {
    view.dispatch({
      selection: {
        anchor: onClickSetSelectionFrom,
        head: onClickSetSelectionTo,
      },
    });
  }
}

function images(view: EditorView, oldImages: DecorationSet) {
  const decorations: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old formatting
    // for now.
    if (!syntaxTree) {
      return oldImages;
    }

    const emptyDeco = Decoration.replace({
      widget: new EmptyWidget(),
    });

    syntaxTree.iterate({
      enter: (node) => {
        const nodeType = node.type.name;
        if (nodeType === 'Image') {
          const urlNode = node.node.getChild('URL');

          if (urlNode) {
            const imageUrl = view.state.sliceDoc(urlNode.from, urlNode.to);
            const imageWidgetDeco = Decoration.widget({
              side: 1,
              widget: new ImageWidget(imageUrl, urlNode.from, urlNode.to),
            });
            decorations.push(imageWidgetDeco.range(node.to));
          }

          if (
            overlapsWithSelection({
              range: { from: node.from, to: node.to },
              state: view.state,
            })
          ) {
            return false;
          }

          decorations.push(emptyDeco.range(node.from, node.to));
        }
      },
      from,
      to,
    });
  }

  return Decoration.set(decorations.sort((a, b) => a.from - b.from));
}

const imagesPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = images(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (
        !isMouseDown(update) &&
        (update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          hasMouseDownStateChanged(update))
      ) {
        this.decorations = images(update.view, this.decorations);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.decorations,
  },
);

export default [imagesPlugin];
