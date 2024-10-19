import { StateEffect, StateField } from '@codemirror/state';
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

export const setIsMouseDown = StateEffect.define<boolean>({});

export const isMouseDownField = StateField.define({
  create() {
    return false;
  },

  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setIsMouseDown)) {
        return effect.value;
      }
    }
    return value;
  },
});

const setupMouseDownEventHandler = EditorView.domEventHandlers({
  mousedown(_, view) {
    view.dispatch({
      effects: setIsMouseDown.of(true),
    });
  },
});

const setupMouseUpEventHandler = ViewPlugin.define((view) => {
  // Add the `mouseup` listener to the `document` so it fires even if the mouse
  // leaves the editor. Dispatch `setIsMouseDown` in the next tick to allow any
  // existing click events in the message queue to be processed first.
  document.addEventListener('mouseup', () => {
    setTimeout(() => {
      view?.dispatch({
        effects: setIsMouseDown.of(false),
      });
    }, 0);
  });

  return {};
});

export function isMouseDown(update: ViewUpdate) {
  return update.state.field(isMouseDownField);
}

export function hasMouseDownStateChanged(update: ViewUpdate) {
  return (
    update.state.field(isMouseDownField) !=
    update.startState.field(isMouseDownField)
  );
}

export default [
  isMouseDownField,
  setupMouseDownEventHandler,
  setupMouseUpEventHandler,
];
