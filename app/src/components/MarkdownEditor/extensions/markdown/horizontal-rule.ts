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

import './horizontal-rule.css';

export class HorizontalRuleWidget extends WidgetType {
  override eq() {
    return true;
  }

  toDOM() {
    const hr = document.createElement('hr');
    hr.className = 'md-horizontal-rule';
    return hr;
  }

  override ignoreEvent() {
    // Allow click to focus
    return false;
  }
}

function getLinesFromSelection(view: EditorView) {
  const ranges = view.state.selection.ranges;
  const lines = new Set<number>();

  for (const range of ranges) {
    const startLine = view.state.doc.lineAt(range.from).number;
    const endLine = view.state.doc.lineAt(range.to).number;
    for (let line = startLine; line <= endLine; line++) {
      lines.add(line);
    }
  }
  return lines;
}

const deco = Decoration.line({ class: 'md-horizontal-rule-line' });

function horizontalRule(view: EditorView, oldHorizontalRule: DecorationSet) {
  const horizontalRule: Range<Decoration>[] = [];

  for (const { from, to } of view.visibleRanges) {
    const syntaxTree = ensureSyntaxTree(view.state, view.visibleRanges[0].to);

    // If a syntax tree was not available and we couldn't parse it within a
    // reasonable time then don't block the thread and return the old horizontalRule
    // for now.
    if (!syntaxTree) {
      return oldHorizontalRule;
    }

    const selectedLines = getLinesFromSelection(view);

    syntaxTree.iterate({
      enter: (node) => {
        if (node.type.is('HorizontalRule')) {
          const decoWidget = Decoration.replace({
            widget: new HorizontalRuleWidget(),
          });

          const line = view.state.doc.lineAt(node.from);
          if (selectedLines.has(line.number)) {
            return;
          }

          horizontalRule.push(deco.range(node.from, node.from));
          horizontalRule.push(decoWidget.range(node.from, node.to));
        }
      },
      from,
      to,
    });
  }
  return Decoration.set(horizontalRule);
}

const horizontalRulePlugin = ViewPlugin.fromClass(
  class {
    horizontalRule: DecorationSet;

    constructor(view: EditorView) {
      this.horizontalRule = horizontalRule(view, Decoration.none);
    }

    update(update: ViewUpdate) {
      if (
        !isMouseDown(update) &&
        (update.docChanged ||
          update.viewportChanged ||
          update.selectionSet ||
          hasMouseDownStateChanged(update))
      ) {
        this.horizontalRule = horizontalRule(update.view, this.horizontalRule);
      }
    }

    destroy() {}
  },
  {
    decorations: (v) => v.horizontalRule,
  },
);

export default horizontalRulePlugin;
