import React from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { ViewUpdate } from '@codemirror/view';
import CodeMirror, { EditorView as RCEditorView } from '@uiw/react-codemirror';
import { WebrtcProvider } from 'y-webrtc';

import createCollabPlugin from './extensions/collab/collab';
import fenchedCodePlugin from './extensions/fenced-code/decoration';
import markdownHeadingsPlugin from './extensions/markdown/headings';
import markdownSyntaxHighlighting from './extensions/markdown/syntax-highlighting';

import './Editor.css';

type EditorProps = {
  onChange: (value: string, viewUpdate: ViewUpdate) => void;
  value: string;
  webrtcProvider: WebrtcProvider;
};

const Editor = ({ onChange, value, webrtcProvider }: EditorProps) => {
  const collabPlugin = createCollabPlugin({ webrtcProvider });

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
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            syntaxHighlighting(defaultHighlightStyle),
            markdownSyntaxHighlighting,
            markdownHeadingsPlugin,
            RCEditorView.lineWrapping,
            ...(collabPlugin ? [collabPlugin] : []),
            fenchedCodePlugin,
          ]}
          height="100%"
          onChange={onChange}
          value={value}
        />
      </div>
    </>
  );
};

export default Editor;
