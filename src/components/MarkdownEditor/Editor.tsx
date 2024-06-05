import React from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, ViewUpdate } from '@codemirror/view';
import CodeMirror, { EditorView as RCEditorView } from '@uiw/react-codemirror';
import { WebrtcProvider } from 'y-webrtc';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

import createCollabPlugin from './extensions/collab/collab';
import fenchedCodePlugin from './extensions/fenced-code/decoration';
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
  },
});

const Editor = ({ onChange, value, webrtcProvider }: EditorProps) => {
  const collabPlugin = createCollabPlugin({ webrtcProvider });
  const { theme } = useTheme();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  return (
    <>
      <div className="mx-auto text-base lg:w-2/3">
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
            RCEditorView.lineWrapping,
            ...(collabPlugin ? [collabPlugin] : []),
            fenchedCodePlugin,
          ]}
          height="100%"
          onChange={onChange}
          theme="none"
          value={value}
        />
      </div>
    </>
  );
};

export default Editor;
