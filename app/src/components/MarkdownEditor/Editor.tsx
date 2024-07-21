import React, { useMemo } from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Prec } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import CodeMirror, {
  EditorView as RCEditorView,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { WebrtcProvider } from 'y-webrtc';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';

import createCollabPlugin from './extensions/collab/collab';
import fenchedCodePlugin from './extensions/fenced-code/decoration';
import markdownCommands from './extensions/markdown/commands';
import markdownFormatting from './extensions/markdown/formatting';
import markdownHeadings from './extensions/markdown/headings';
import { getTheme } from './extensions/theme/theme';

import './Editor.css';

type EditorProps = {
  onChange: (value: string, viewUpdate: ViewUpdate) => void;
  refs: React.RefObject<ReactCodeMirrorRef>;
  value: string;
  webrtcProvider: WebrtcProvider;
};

const baseTheme = EditorView.baseTheme({
  '&.cm-editor': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--text))',
  },
});

const Editor = ({ onChange, refs, value, webrtcProvider }: EditorProps) => {
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
        markdownFormatting,
        Prec.high(markdownCommands),
        RCEditorView.lineWrapping,
        RCEditorView.contentAttributes.of({ autocapitalize: 'on' }),
        ...(collabPlugin ? [collabPlugin] : []),
        fenchedCodePlugin,
      ]}
      height="100%"
      onChange={onChange}
      ref={refs}
      theme="none"
      value={value}
    />
  );
};

export default Editor;
