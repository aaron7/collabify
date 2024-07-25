import { useEffect, useState } from 'react';
import { IndexeddbPersistence } from 'y-indexeddb';
import { type WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { useSettings } from '@/providers/SettingsProvider';
import {
  createIndexedDbPersistence,
  createWebrtcProvider,
  findHostId,
  type AwarenessStates,
  type StatusEvent,
} from '@/utils/collab';
import { Session } from '@/utils/session';

type UseWebrtcProviderProps = {
  initialMarkdown: string;
  session: Session;
  setValue: (value: string) => void;
};

const useWebrtcProvider = ({
  initialMarkdown,
  session,
  setValue,
}: UseWebrtcProviderProps) => {
  const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(
    null,
  );
  const [awarenessStates, setAwarenessStates] = useState<AwarenessStates>(
    new Map(),
  );
  const [awarenessClientId, setAwarenessClientId] = useState<number | null>(
    null,
  );
  const [isSignalingConnected, setIsSignalingConnected] = useState(false);
  const [isWebrtcConnected, setIsWebrtcConnected] = useState(false);
  const [hasWebrtcSynced, setHasWebrtcSynced] = useState(session.isHost);
  const [hasIndexedDbSynced, setHasIndexedDbSynced] = useState(false);
  const [hasInitialMarkdownLoaded, setHasInitialMarkdownLoaded] =
    useState(false);

  // Create a new webrtcProvider when the session changes
  useEffect(() => {
    const ydoc = new Doc();
    const newWebrtcProvider = createWebrtcProvider({
      isHost: session.isHost,
      session,
      ydoc,
    });

    const indexedDbProvider = createIndexedDbPersistence({ session, ydoc });
    indexedDbProvider.on('synced', (event: IndexeddbPersistence) => {
      setValue(event.doc.getText('content').toString());
      setHasIndexedDbSynced(true);
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
  }, [session, setValue]);

  useEffect(() => {
    if (webrtcProvider?.signalingConns) {
      webrtcProvider?.signalingConns?.map((conn) =>
        conn.on('connect', () => {
          setIsSignalingConnected(true);
        }),
      );
    }
  }, [webrtcProvider?.signalingConns]);

  // Handle webrtcProvider events
  useEffect(() => {
    const onStatus = (event: StatusEvent) => {
      setIsWebrtcConnected(event.connected);
    };

    const onSynced = () => {
      if (!hasWebrtcSynced) {
        if (webrtcProvider) {
          setValue(webrtcProvider?.doc.getText('content').toString());
        }
        setHasWebrtcSynced(true);
      }
    };

    const onAwarenessUpdate = () => {
      const awarenessStates = webrtcProvider?.awareness.getStates();
      setAwarenessStates(new Map(awarenessStates));
      setAwarenessClientId(webrtcProvider?.awareness.clientID || null);
    };

    webrtcProvider?.on('status', onStatus);
    webrtcProvider?.on('synced', onSynced);
    webrtcProvider?.awareness.on('update', onAwarenessUpdate);

    return () => {
      webrtcProvider?.off('status', onStatus);
      webrtcProvider?.off('synced', onSynced);
      webrtcProvider?.awareness.off('update', onAwarenessUpdate);
    };
  }, [
    hasWebrtcSynced,
    setHasWebrtcSynced,
    setAwarenessStates,
    webrtcProvider,
    webrtcProvider?.awareness,
    setValue,
  ]);

  const hasSyncedAllProviders = hasWebrtcSynced && hasIndexedDbSynced;

  // Set intial markdown when the webrtcProvider is connected and has synced
  useEffect(() => {
    if (
      isWebrtcConnected &&
      hasSyncedAllProviders &&
      webrtcProvider &&
      !hasInitialMarkdownLoaded
    ) {
      if (initialMarkdown) {
        const statusMap = webrtcProvider.doc.getMap('status');
        if (!statusMap.get('loadedInitialMarkdown')) {
          setValue(initialMarkdown);
          webrtcProvider.doc
            .getText('content')
            .delete(0, webrtcProvider.doc.getText('content').length);
          webrtcProvider.doc.getText('content').insert(0, initialMarkdown);
          statusMap.set('loadedInitialMarkdown', true);
        }
      }
      setHasInitialMarkdownLoaded(true);
    }
  }, [
    isWebrtcConnected,
    hasSyncedAllProviders,
    hasInitialMarkdownLoaded,
    setHasInitialMarkdownLoaded,
    setValue,
    webrtcProvider,
    initialMarkdown,
  ]);

  return {
    awarenessClientId,
    awarenessStates,
    isConnected:
      isWebrtcConnected && hasSyncedAllProviders && hasInitialMarkdownLoaded,
    isSignalingConnected,
    webrtcProvider,
  };
};

type UseCollabProviderProps = {
  initialMarkdown: string;
  session: Session;
  setValue: (value: string) => void;
};

export const useCollabProvider = ({
  initialMarkdown,
  session,
  setValue,
}: UseCollabProviderProps) => {
  const isHost = session.isHost;

  const { settings } = useSettings();

  const {
    awarenessClientId,
    awarenessStates,
    isConnected,
    isSignalingConnected,
    webrtcProvider,
  } = useWebrtcProvider({
    initialMarkdown,
    session,
    setValue,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    webrtcProvider?.awareness.setLocalStateField('user', {
      ...(webrtcProvider?.awareness.getLocalState()?.user || {}),
      name: settings.name,
    });
  }, [settings.name, webrtcProvider?.awareness]);

  // When the session ends, set status to 'ended' and navigate back to the home page
  const onEndSession = () => {
    if (!webrtcProvider) {
      return;
    }
    webrtcProvider.doc.getMap('status').set('ended', true);
  };

  useEffect(() => {
    if (!webrtcProvider) {
      return;
    }

    const statusMap = webrtcProvider.doc.getMap('status');
    statusMap.observe(() => {
      if (statusMap.get('ended')) {
        setIsActive(false);
      }
    });
  }, [webrtcProvider, setIsActive]);

  const hostId = findHostId(awarenessStates);
  const isHostOnline = isHost || (hostId && awarenessStates.get(hostId));

  return {
    awarenessClientId,
    awarenessStates,
    isActive,
    isConnected,
    isHostOnline,
    isSignalingConnected,
    onEndSession,
    webrtcProvider,
  };
};
