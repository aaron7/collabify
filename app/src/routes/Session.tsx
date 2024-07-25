import React, { useState } from 'react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useLocation, useNavigate } from 'react-router-dom';

import EndOfSession from '@/components/EndOfSession/EndOfSession';
import Loading from '@/components/Loading/Loading';
import Editor from '@/components/MarkdownEditor/Editor';
import StatusBar from '@/components/StatusBar/StatusBar';
import { Separator } from '@/components/ui/separator';
import { WelcomeDialog } from '@/components/WelcomeDialog/WelcomeDialog';
import { useSession } from '@/hooks/session';
import { useCollabProvider } from '@/hooks/webrtc';
import { useSettings } from '@/providers/SettingsProvider';
import routes from '@/routes';
import { saveMarkdown, stopSessionCallback } from '@/utils/api';
import { getTitle } from '@/utils/doc';

const updateTitle = (doc: string) => {
  const title = getTitle(doc);
  if (document.title !== title) {
    document.title = title;
  }
};

const Session = () => {
  const navigate = useNavigate();
  const session = useSession();
  const location = useLocation();

  const { settings } = useSettings();

  const editorRefs = React.useRef<ReactCodeMirrorRef>({});
  const [value, setValue] = useState<string>('');
  const [hasSeenEditor, setHasSeenEditor] = useState(false);
  const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);

  const {
    awarenessClientId,
    awarenessStates,
    isActive,
    isConnected,
    isHostOnline,
    isSignalingConnected,
    onEndSession,
    webrtcProvider,
  } = useCollabProvider({
    initialMarkdown: location.state?.initialMarkdown || '',
    session,
    setValue,
  });

  const onEditorChange = React.useCallback((val: string) => {
    setValue(val);
    updateTitle(val);
  }, []);

  // Focus the editor when the user clicks the empty space when the editor
  // doesn't have enough lines to fill the screen.
  const onEmptySpaceBehindEditorClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (e.target === e.currentTarget) {
      editorRefs?.current?.view?.focus();
    }
  };

  const onEndSessionWrapper = () => {
    saveMarkdown(session, value).then(() => {
      onEndSession();
      stopSessionCallback(session);
    });
  };

  if (!isSignalingConnected) {
    return (
      <Loading
        copy="If you cannot connect, our signaling servers may be down"
        ctaCopy="Stop connecting"
        onCtaClick={() => navigate(routes.landing.path)}
        title="Connecting to collabify.it"
      />
    );
  }

  if (!isActive) {
    return <EndOfSession session={session} value={value} />;
  }

  if (!webrtcProvider || !isConnected || (!hasSeenEditor && !isHostOnline)) {
    const copy = value
      ? 'If you cannot connect, the host is offline.'
      : 'If you cannot connect, either the host is offline or the secret URL is incorrect.';
    return (
      <Loading
        copy={copy}
        ctaCopy="Stop connecting"
        mostRecentMarkdown={value}
        onCtaClick={() => navigate(routes.landing.path)}
        title="Connecting to host"
      />
    );
  }

  if (!isHostOnline) {
    return (
      <Loading
        copy="Please wait until you host is back online."
        ctaCopy="Exit session"
        mostRecentMarkdown={value}
        onCtaClick={() => navigate(routes.landing.path)}
        title="Your host has gone offline"
      />
    );
  }

  if (!hasSeenEditor) {
    setHasSeenEditor(true);
    updateTitle(value);
    setIsWelcomeDialogOpen(!settings.doNotShowWelcomeDialog);
  }

  const initialSelection = location.state?.initialSelection || { anchor: 0 };
  const autoFocus = location.state?.autoFocus || false;

  return (
    <div className="flex h-screen flex-col">
      <StatusBar
        awarenessClientId={awarenessClientId}
        awarenessStates={awarenessStates}
        onEndSession={onEndSessionWrapper}
        session={session}
        value={value}
      />
      <Separator />
      <div className="flex-grow overflow-y-auto">
        <div
          className="mx-auto max-w-3xl cursor-text px-2"
          onClick={onEmptySpaceBehindEditorClick}
        >
          <Editor
            autoFocus={autoFocus}
            initialSelection={initialSelection}
            onChange={onEditorChange}
            refs={editorRefs}
            value={value}
            webrtcProvider={webrtcProvider}
          />
        </div>
      </div>
      <WelcomeDialog
        isOpen={isWelcomeDialogOpen}
        setIsOpen={setIsWelcomeDialogOpen}
      />
    </div>
  );
};

export default Session;
