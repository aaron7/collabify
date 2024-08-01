import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view';
import { get as getEmoji, has as hasEmoji } from 'node-emoji';

class EmojiWidget extends WidgetType {
  constructor(readonly emoji: string) {
    super();
  }

  override eq(other: EmojiWidget) {
    return other.emoji == this.emoji;
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.textContent = getEmoji(this.emoji) || `:${this.emoji}:`;
    return wrap;
  }
}

const emojiMatcher = new MatchDecorator({
  decoration: (match) => {
    const emoji = match[1];
    if (!hasEmoji(emoji)) {
      return null;
    }
    return Decoration.replace({
      widget: new EmojiWidget(emoji),
    });
  },
  regexp: /:(\w+):/g,
});

const emojis = ViewPlugin.fromClass(
  class {
    emojis: DecorationSet;
    constructor(view: EditorView) {
      this.emojis = emojiMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.emojis = emojiMatcher.updateDeco(update, this.emojis);
    }
  },
  {
    decorations: (instance) => instance.emojis,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.emojis || Decoration.none;
      }),
  },
);

export default emojis;
