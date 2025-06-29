import React, { useState } from 'react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useLocation, useNavigate } from 'react-router-dom';

import EndOfSession from '@/components/EndOfSession/EndOfSession';
import Loading from '@/components/Loading/Loading';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import StatusBar from '@/components/StatusBar/StatusBar';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { WelcomeDialog } from '@/components/WelcomeDialog/WelcomeDialog';
import type { SelectionState } from '@/extensions/selection-state';
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
  const [selectionState, setSelectionState] = useState<SelectionState | null>(
    null,
  );

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
        showCopyAfter={5000}
        title="Connecting"
      />
    );
  }

  if (!isActive) {
    return <EndOfSession session={session} value={value} />;
  }

  if (!webrtcProvider || !isConnected || (!hasSeenEditor && !isHostOnline)) {
    const copy = value
      ? 'If you cannot connect, your host has likely disconnected.'
      : 'If you cannot connect, either your host has disconnected or the secret URL is incorrect.';
    return (
      <Loading
        copy={copy}
        ctaCopy="Stop connecting"
        mostRecentMarkdown={value}
        onCtaClick={() => navigate(routes.landing.path)}
        showCopyAfter={5000}
        title="Connecting to host"
      />
    );
  }

  if (!isHostOnline) {
    return (
      <Loading
        copy="Please wait until your host is back online."
        ctaCopy="Exit session"
        mostRecentMarkdown={value}
        onCtaClick={() => navigate(routes.landing.path)}
        title="Waiting for host"
      />
    );
  }

  if (!hasSeenEditor) {
    setHasSeenEditor(true);
    updateTitle(value);
    setIsWelcomeDialogOpen(!settings.doNotShowWelcomeDialog);
  }

  const requstedInitialSelection = location.state?.initialSelection;
  const initialSelection =
    requstedInitialSelection && requstedInitialSelection.anchor <= value.length
      ? requstedInitialSelection
      : { anchor: 0 };

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
      {selectionState && (
        <Toolbar editorRefs={editorRefs} selectionState={selectionState} />
      )}

      <div className="flex grow flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl grow flex-col px-2">
          <MarkdownEditor
            autoFocus={autoFocus}
            initialSelection={initialSelection}
            onChange={onEditorChange}
            refs={editorRefs}
            setSelectionState={setSelectionState}
            value={value}
            webrtcProvider={webrtcProvider}
          />
        </div>
      </div>
      <WelcomeDialog
        editorRefs={editorRefs}
        isOpen={isWelcomeDialogOpen}
        setIsOpen={setIsWelcomeDialogOpen}
      />
      <Toaster richColors />
    </div>
  );
};

export default Session;
