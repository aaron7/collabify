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
import { SquareArrowOutUpRight } from 'lucide-react';
import ReactDOM from 'react-dom/client';

import './links.css';

import { hasMouseDownStateChanged, isMouseDown } from './is-mouse-down';
import { EmptyWidget } from './utils/empty-widget';
import { overlapsWithSelection } from './utils/selection';

export class LinkIconWidget extends WidgetType {
  constructor(readonly linkUrl: string) {
    super();
  }

  override eq() {
    return true;
  }

  toDOM() {
    const linkIcon = document.createElement('span');
    linkIcon.className = 'inline-block cursor-pointer';
    linkIcon.onclick = (event) => {
      openLinkUrl(event, this.linkUrl);
    };

    const root = ReactDOM.createRoot(linkIcon);
    root.render(React.createElement(SquareArrowOutUpRight, { size: 10 }));

    return linkIcon;
  }
}

function links(view: EditorView, oldLinks: DecorationSet) {
  const decorations: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old formatting
    // for now.
    if (!syntaxTree) {
      return oldLinks;
    }

    const emptyDeco = Decoration.replace({
      widget: new EmptyWidget(),
    });

    syntaxTree.iterate({
      enter: (node) => {
        const nodeType = node.type.name;
        if (nodeType === 'Link') {
          const urlNode = node.node.getChild('URL');
          const linkUrl = urlNode
            ? view.state.sliceDoc(urlNode.from, urlNode.to)
            : null;
          const isValid = linkUrl && isValidUrl(linkUrl);

          if (isValid) {
            const linkIconDeco = Decoration.widget({
              side: 1,
              widget: new LinkIconWidget(linkUrl),
            });
            decorations.push(linkIconDeco.range(node.to));
          }

          const isEmptyLink = view.state
            .sliceDoc(node.from, node.to)
            .startsWith('[](');

          if (
            isEmptyLink ||
            overlapsWithSelection({
              range: { from: node.from, to: node.to },
              state: view.state,
            })
          ) {
            return false;
          }

          node.node.getChildren('LinkMark').forEach((child) => {
            decorations.push(emptyDeco.range(child.from, child.to));
          });

          node.node.getChildren('URL').forEach((child) => {
            decorations.push(emptyDeco.range(child.from, child.to));
          });

          if (isValid) {
            const linkDeco = Decoration.mark({
              attributes: {
                class: 'md-link',
                'data-url': linkUrl,
              },
            });
            decorations.push(linkDeco.range(node.from, node.to));
          }
        }
      },
      from,
      to,
    });
  }

  return Decoration.set(decorations.sort((a, b) => a.from - b.from));
}

const linksPlugin = ViewPlugin.fromClass(
  class {
    links: DecorationSet;

    constructor(view: EditorView) {
      this.links = links(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (
        !isMouseDown(update) &&
        (update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          hasMouseDownStateChanged(update))
      ) {
        this.links = links(update.view, this.links);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.links,
  },
);

const setupClickLinkEventHandler = EditorView.domEventHandlers({
  click(event) {
    const target = event.target as HTMLElement;
    if (target.parentElement?.classList?.contains('md-link')) {
      const url = target.parentElement.getAttribute('data-url');
      if (url) {
        openLinkUrl(event, url);
      }
    }
  },
});

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function openLinkUrl(event: MouseEvent, url: string) {
  if (event.altKey || event.shiftKey) {
    return;
  }

  window.open(url, '_blank');
}

export default [linksPlugin, setupClickLinkEventHandler];
