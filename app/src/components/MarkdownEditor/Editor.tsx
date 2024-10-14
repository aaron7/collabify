import React, { useMemo } from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, ViewUpdate } from '@codemirror/view';
import CodeMirror, {
  EditorView as RCEditorView,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { WebrtcProvider } from 'y-webrtc';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

import createCollabPlugin from './extensions/collab/collab';
import emojiPlugin from './extensions/emoji';
import markdownPlugin from './extensions/markdown';
import richTextClipboardPlugin from './extensions/rich-text-clipboard/rich-text-clipboard';
import createSelectionStatePlugin, {
  SelectionState,
} from './extensions/selection-state/selection-state';
import { getTheme } from './extensions/theme/theme';

import './Editor.css';

type EditorProps = {
  autoFocus: boolean;
  initialSelection: { anchor: number };
  onChange: (value: string, viewUpdate: ViewUpdate) => void;
  refs: React.RefObject<ReactCodeMirrorRef>;
  setSelectionState: (value: SelectionState) => void;
  value: string;
  webrtcProvider: WebrtcProvider;
};

const baseTheme = EditorView.baseTheme({
  '&.cm-editor': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--text))',
  },
});

const Editor = ({
  autoFocus,
  initialSelection,
  onChange,
  refs,
  setSelectionState,
  value,
  webrtcProvider,
}: EditorProps) => {
  const collabPlugin = useMemo(
    () => createCollabPlugin({ webrtcProvider }),
    [webrtcProvider],
  );

  const selectionStatePlugin = useMemo(
    () => createSelectionStatePlugin({ setSelectionState }),
    [setSelectionState],
  );

  const { theme } = useTheme();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  return (
    <CodeMirror
      autoFocus={autoFocus}
      basicSetup={{
        foldGutter: false,
        highlightActiveLine: false,
        highlightSelectionMatches: false,
        lineNumbers: false,
      }}
      extensions={[
        baseTheme,
        getTheme(theme === 'system' ? systemTheme : theme),
        RCEditorView.lineWrapping,
        RCEditorView.contentAttributes.of({ autocapitalize: 'on' }),
        markdown({
          addKeymap: false, // We add our own keymap in markdownPlugin
          base: markdownLanguage,
          codeLanguages: languages,
        }),

        markdownPlugin,
        richTextClipboardPlugin,
        selectionStatePlugin,
        emojiPlugin,
        ...(collabPlugin ? [collabPlugin] : []),
      ]}
      height="100%"
      onChange={onChange}
      ref={refs}
      selection={initialSelection}
      theme="none"
      value={value}
    />
  );
};

export default Editor;
