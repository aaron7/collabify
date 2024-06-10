import React, { useEffect, useState } from 'react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useLocation, useNavigate } from 'react-router-dom';
import { IndexeddbPersistence } from 'y-indexeddb';
import { type WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import Loading from '@/components/Loading/Loading';
import Editor from '@/components/MarkdownEditor/Editor';
import { useSettings } from '@/components/SettingsProvider/SettingsProvider';
import StatusBar from '@/components/StatusBar/StatusBar';
import { Separator } from '@/components/ui/separator';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import {
  createIndexedDbPersistence,
  createWebrtcProvider,
  findHostId,
  setDocMapAndWaitForSync,
  type AwarenessState,
  type PeersEvent,
  type StatusEvent,
} from '@/utils/collab';

const Session = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const session = location.state?.session;
  const isHost = location.state?.isHost;

  const { settings } = useSettings();

  const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(
    null,
  );
  const [awarenessStates, setAwarenessStates] = useState<AwarenessState>(
    new Map(),
  );

  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [value, setValue] = useState<string>('');

  const editorRef = React.useRef<ReactCodeMirrorRef>({});

  // Always setup a new webrtcProvider when the session changes
  useEffect(() => {
    const ydoc = new Doc();
    const newWebrtcProvider = createWebrtcProvider({
      isHost,
      session,
      ydoc,
    });
    const indexedDbProvider = createIndexedDbPersistence({ session, ydoc });
    indexedDbProvider.on('synced', (event: IndexeddbPersistence) => {
      setValue(event.doc.getText('content').toString());
    });
    setWebrtcProvider(newWebrtcProvider);
    setAwarenessStates(new Map(newWebrtcProvider.awareness.getStates()));
    setValue(newWebrtcProvider.doc.getText('content').toString());

    return () => {
      if (newWebrtcProvider) {
        newWebrtcProvider.disconnect();
        newWebrtcProvider.destroy();
      }
    };
  }, [session, isHost]);

  useEffect(() => {
    webrtcProvider?.awareness.setLocalStateField('user', {
      name: settings.name,
    });
  }, [settings.name, webrtcProvider?.awareness]);

  const onEditorChange = React.useCallback((val: string) => {
    setValue(val);
  }, []);

  const copyMarkdownToClipboard = () => {
    copyToClipboard(value);
  };

  // When the session ends, set status to 'ended' and navigate back to the home page
  const onEndSession = () => {
    if (!webrtcProvider) {
      return;
    }
    setDocMapAndWaitForSync(webrtcProvider.doc, 'status', 'ended', true)
      .then(() => {
        navigate(routes.landing.path);
      })
      .catch((error) => {
        // TODO: Handle error
      });
  };

  // Handle webrtcProvider events
  useEffect(() => {
    const onStatus = (event: StatusEvent) => {
      setIsConnected(event.connected);
    };

    const onPeers = (event: PeersEvent) => {
      setPeers(event.webrtcPeers);
    };

    const onAwarenessUpdate = () => {
      const awarenessStates = webrtcProvider?.awareness.getStates();
      setAwarenessStates(new Map(awarenessStates));
    };

    webrtcProvider?.on('status', onStatus);
    webrtcProvider?.on('peers', onPeers);
    webrtcProvider?.awareness.on('update', onAwarenessUpdate);

    return () => {
      webrtcProvider?.off('status', onStatus);
      webrtcProvider?.off('peers', onPeers);
      webrtcProvider?.awareness.off('update', onAwarenessUpdate);
    };
  }, [setAwarenessStates, webrtcProvider, webrtcProvider?.awareness]);

  // Initial loading state
  if (!webrtcProvider || !isConnected || (!isHost && !peers.length)) {
    return (
      <Loading
        copy="If you cannot connect, either the host is offline or the secret URL is incorrect."
        ctaCopy="Stop connecting"
        onCtaClick={() => navigate(routes.landing.path)}
        title="Connecting to your host"
      />
    );
  }

  // Session has been explicitly ended by the host
  if (
    isConnected &&
    webrtcProvider &&
    webrtcProvider?.doc.getMap('status').get('ended')
  ) {
    return (
      <Loading
        ctaCopy="Exit session"
        onCtaClick={() => navigate(routes.landing.path)}
        showLoader={false}
        title="The session has ended"
      />
    );
  }

  // The host has gone offline
  const hostId = findHostId(awarenessStates);
  if (hostId && !isHost && !awarenessStates.get(hostId)) {
    return (
      <Loading
        ctaCopy="Exit session"
        onCtaClick={() => navigate(routes.landing.path)}
        title="Your host has gone offline"
      />
    );
  }

  // Focus the editor when the user clicks the empty space when the editor
  // doesn't have enough lines to fill the screen.
  const onEmptySpaceBehindEditorClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (e.target === e.currentTarget) {
      editorRef?.current?.view?.focus();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        copyMarkdownToClipboard={copyMarkdownToClipboard}
        isHost={isHost}
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
            ref={editorRef}
            value={value}
            webrtcProvider={webrtcProvider}
          />
        </div>
      </div>
    </div>
  );
};

export default Session;
