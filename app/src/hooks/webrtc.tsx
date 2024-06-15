import { useEffect, useState } from 'react';
import { IndexeddbPersistence } from 'y-indexeddb';
import { type WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { useSettings } from '@/providers/SettingsProvider';
import {
  createIndexedDbPersistence,
  createWebrtcProvider,
  findHostId,
  type AwarenessState,
  type StatusEvent,
} from '@/utils/collab';
import { Session } from '@/utils/session';

type UseWebrtcProviderProps = {
  session: Session;
  setValue: (value: string) => void;
};

const useWebrtcProvider = ({ session, setValue }: UseWebrtcProviderProps) => {
  const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(
    null,
  );
  const [awarenessStates, setAwarenessStates] = useState<AwarenessState>(
    new Map(),
  );
  const [isConnected, setIsConnected] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

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

  // Handle webrtcProvider events
  useEffect(() => {
    const onStatus = (event: StatusEvent) => {
      setIsConnected(event.connected);
    };

    const onSynced = () => {
      if (!hasSynced) {
        setHasSynced(true);
      }
    };

    const onAwarenessUpdate = () => {
      const awarenessStates = webrtcProvider?.awareness.getStates();
      setAwarenessStates(new Map(awarenessStates));
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
    hasSynced,
    setHasSynced,
    setAwarenessStates,
    webrtcProvider,
    webrtcProvider?.awareness,
  ]);

  return {
    awarenessStates,
    hasSynced,
    isConnected,
    webrtcProvider,
  };
};

type UseCollabProviderProps = {
  session: Session;
  setValue: (value: string) => void;
};

export const useCollabProvider = ({
  session,
  setValue,
}: UseCollabProviderProps) => {
  const isHost = session.isHost;

  const { settings } = useSettings();

  const { awarenessStates, hasSynced, isConnected, webrtcProvider } =
    useWebrtcProvider({
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
    awarenessStates,
    hasSynced,
    isActive,
    isConnected,
    isHostOnline,
    onEndSession,
    webrtcProvider,
  };
};
