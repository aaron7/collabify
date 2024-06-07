import React, { useMemo } from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Prec } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import CodeMirror, { EditorView as RCEditorView } from '@uiw/react-codemirror';
import { WebrtcProvider } from 'y-webrtc';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

import createCollabPlugin from './extensions/collab/collab';
import fenchedCodePlugin from './extensions/fenced-code/decoration';
import markdownCommands from './extensions/markdown/commands';
import markdownHeadings from './extensions/markdown/headings';
import { getTheme } from './extensions/theme/theme';

import './Editor.css';

type EditorProps = {
  onChange: (value: string, viewUpdate: ViewUpdate) => void;
  value: string;
  webrtcProvider: WebrtcProvider;
};

const baseTheme = EditorView.baseTheme({
  '&.cm-editor': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--text))',
  },
});

const Editor = ({ onChange, value, webrtcProvider }: EditorProps) => {
  const collabPlugin = useMemo(
    () => createCollabPlugin({ webrtcProvider }),
    [webrtcProvider],
  );
  const { theme } = useTheme();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  return (
    <CodeMirror
      basicSetup={{
        foldGutter: false,
        highlightActiveLine: true,
        highlightSelectionMatches: false,
        lineNumbers: false,
      }}
      extensions={[
        baseTheme,
        getTheme(theme === 'system' ? systemTheme : theme),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        markdownHeadings,
        Prec.high(markdownCommands),
        RCEditorView.lineWrapping,
        ...(collabPlugin ? [collabPlugin] : []),
        fenchedCodePlugin,
      ]}
      height="100%"
      onChange={onChange}
      theme="none"
      value={value}
    />
  );
};

export default Editor;
