import React, { useState } from 'react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useNavigate } from 'react-router-dom';

import Loading from '@/components/Loading/Loading';
import Editor from '@/components/MarkdownEditor/Editor';
import StatusBar from '@/components/StatusBar/StatusBar';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/hooks/session';
import { useCollabProvider } from '@/hooks/webrtc';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';

const Session = () => {
  const navigate = useNavigate();
  const session = useSession();

  const editorRefs = React.useRef<ReactCodeMirrorRef>({});
  const [value, setValue] = useState<string>('');

  const { isActive, isConnected, isHostOnline, onEndSession, webrtcProvider } =
    useCollabProvider({ session, setValue });

  const onEditorChange = React.useCallback((val: string) => {
    setValue(val);
  }, []);

  const copyMarkdownToClipboard = () => {
    copyToClipboard(value);
  };

  // Focus the editor when the user clicks the empty space when the editor
  // doesn't have enough lines to fill the screen.
  const onEmptySpaceBehindEditorClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (e.target === e.currentTarget) {
      editorRefs?.current?.view?.focus();
    }
  };

  if (!webrtcProvider || !isConnected) {
    return (
      <Loading
        copy="If you cannot connect, either the host is offline or the secret URL is incorrect."
        ctaCopy="Stop connecting"
        onCtaClick={() => navigate(routes.landing.path)}
        title="Connecting to your host"
      />
    );
  }

  if (!isActive) {
    return (
      <Loading
        ctaCopy="Exit session"
        onCtaClick={() => navigate(routes.landing.path)}
        showLoader={false}
        title="The session has ended"
      />
    );
  }

  if (!isHostOnline) {
    return (
      <Loading
        ctaCopy="Exit session"
        onCtaClick={() => navigate(routes.landing.path)}
        title="Your host has gone offline"
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        copyMarkdownToClipboard={copyMarkdownToClipboard}
        onEndSession={onEndSession}
        session={session}
      />
      <Separator />
      <div className="flex-grow overflow-y-auto">
        <div
          className="mx-auto h-full cursor-text lg:w-2/3"
          onClick={onEmptySpaceBehindEditorClick}
        >
          <Editor
            onChange={onEditorChange}
            refs={editorRefs}
            value={value}
            webrtcProvider={webrtcProvider}
          />
        </div>
      </div>
    </div>
  );
};

export default Session;
