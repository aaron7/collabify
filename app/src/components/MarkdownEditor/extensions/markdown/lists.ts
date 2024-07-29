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

import { overlapsWithSelection } from '../utils/selection';

export class BulletWidget extends WidgetType {
  constructor(readonly view: EditorView) {
    super();
  }

  override eq() {
    return true;
  }

  toDOM() {
    const span = document.createElement('span');
    span.textContent = '•';
    span.className = 'font-black';
    return span;
  }
}

function lists(view: EditorView, oldLists: DecorationSet) {
  const lists: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old lists
    // for now.
    if (!syntaxTree) {
      return oldLists;
    }

    const deco = Decoration.replace({
      widget: new BulletWidget(view),
    });

    syntaxTree.iterate({
      enter: (node) => {
        const nodeType = node.type.name;
        if (nodeType === 'ListMark') {
          if (
            overlapsWithSelection({
              range: { from: node.from, to: node.to },
              state: view.state,
            })
          ) {
            return;
          }

          lists.push(deco.range(node.from, node.to));
        }
      },
      from,
      to,
    });
  }

  return Decoration.set(lists.sort((a, b) => a.from - b.from));
}

const listsPlugin = ViewPlugin.fromClass(
  class {
    lists: DecorationSet;

    constructor(view: EditorView) {
      this.lists = lists(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.lists = lists(update.view, this.lists);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.lists,
  },
);

export default listsPlugin;
