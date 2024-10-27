import React from 'react';
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
import { SyntaxNode } from '@lezer/common';
import ReactDOM from 'react-dom/client';

import { Checkbox } from '@/components/ui/checkbox';

import { hasMouseDownStateChanged, isMouseDown } from './is-mouse-down';
import { overlapsWithSelection } from './utils/selection';

export class BulletWidget extends WidgetType {
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

export class TaskWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  override eq(other: TaskWidget) {
    return other.checked == this.checked;
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.className = 'md-task-checkbox';

    const root = ReactDOM.createRoot(wrap);
    root.render(React.createElement(Checkbox, { checked: this.checked }));

    return wrap;
  }

  override ignoreEvent() {
    return false;
  }
}

function isNodeChecked(view: EditorView, node: SyntaxNode) {
  return view.state.sliceDoc(node.from, node.to) === '[x]';
}

function toogleCheckbox(view: EditorView, pos: number) {
  const syntaxTree = ensureSyntaxTree(view.state, pos);
  if (!syntaxTree) {
    // Don't worry if we couldn't get the syntax tree in time
    return true;
  }

  const taskMarker = syntaxTree.resolve(pos, -1);
  if (!taskMarker || taskMarker.type.name !== 'TaskMarker') {
    return false;
  }

  const isChecked = isNodeChecked(view, taskMarker);
  view.dispatch({
    changes: {
      from: taskMarker.from + 1,
      insert: isChecked ? ' ' : 'x',
      to: taskMarker.to - 1,
    },
  });

  return true;
}

const bulletDeco = Decoration.replace({
  widget: new BulletWidget(),
});

const uncheckedTaskDeco = Decoration.replace({
  widget: new TaskWidget(false),
});

const checkedTaskDeco = Decoration.replace({
  widget: new TaskWidget(true),
});

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

    syntaxTree.iterate({
      enter: (node) => {
        const nodeType = node.type.name;
        if (
          nodeType === 'ListMark' &&
          node.matchContext(['BulletList', 'ListItem'])
        ) {
          const taskMarker = node.node.nextSibling?.getChild('TaskMarker');

          if (
            overlapsWithSelection({
              range: { from: node.from, to: taskMarker?.to || node.to },
              state: view.state,
            })
          ) {
            return;
          }

          if (taskMarker) {
            const taskDeco = isNodeChecked(view, taskMarker)
              ? checkedTaskDeco
              : uncheckedTaskDeco;
            lists.push(taskDeco.range(node.from, taskMarker.to));
          } else {
            lists.push(bulletDeco.range(node.from, node.to));
          }
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
      if (
        !isMouseDown(update) &&
        (update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          hasMouseDownStateChanged(update))
      ) {
        this.lists = lists(update.view, this.lists);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.lists,
    eventHandlers: {
      mousedown: (e, view) => {
        const target = e.target as HTMLElement;
        if (
          target.nodeName == 'BUTTON' &&
          target.parentElement?.classList.contains('md-task-checkbox')
        ) {
          const taskMarkerOffset = 5;
          return toogleCheckbox(
            view,
            view.posAtDOM(target.parentElement) + taskMarkerOffset,
          );
        }
      },
    },
  },
);

export default listsPlugin;
