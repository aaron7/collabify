import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type WebrtcProvider } from 'y-webrtc';

import Editor from '@/components/MarkdownEditor/Editor';
import StatusBar from '@/components/StatusBar/StatusBar';
import { Separator } from '@/components/ui/separator';
import routes from '@/routes';
import {
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

  const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(
    null,
  );
  const [awarenessStates, setAwarenessStates] = useState<AwarenessState>(
    new Map(),
  );

  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [value, setValue] = useState<string>('');

  // Always setup a new webrtcProvider when the session changes
  useEffect(() => {
    const newWebrtcProvider = createWebrtcProvider(session, isHost);
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

  const onEditorChange = React.useCallback((val: string) => {
    setValue(val);
  }, []);

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
      <div>
        <span>Waiting to connect to the host or existing peers...</span>
        <span>
          If you cannot connect, either the host has gone offline or the secret
          is incorrect.
        </span>
      </div>
    );
  }

  // Session has been explicitly ended by the host
  if (
    isConnected &&
    webrtcProvider &&
    webrtcProvider?.doc.getMap('status').get('ended')
  ) {
    return (
      <div>
        <span>The session has ended</span>
      </div>
    );
  }

  // The host has gone offline
  const hostId = findHostId(awarenessStates);
  if (hostId && !isHost && !awarenessStates.get(hostId)) {
    return (
      <div>
        <span>The host has gone offline.</span>
      </div>
    );
  }

  return (
    <div>
      <StatusBar
        isHost={isHost}
        onEndSession={onEndSession}
        session={session}
      />
      <Separator />
      <Editor
        onChange={onEditorChange}
        value={value}
        webrtcProvider={webrtcProvider}
      />
    </div>
  );
};

export default Session;
