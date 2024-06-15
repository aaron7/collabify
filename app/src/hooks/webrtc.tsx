import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndexeddbPersistence } from 'y-indexeddb';
import { type WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { useSettings } from '@/providers/SettingsProvider';
import routes from '@/routes';
import {
  createIndexedDbPersistence,
  createWebrtcProvider,
  findHostId,
  setDocMapAndWaitForSync,
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

    const onAwarenessUpdate = () => {
      const awarenessStates = webrtcProvider?.awareness.getStates();
      setAwarenessStates(new Map(awarenessStates));
    };

    webrtcProvider?.on('status', onStatus);
    webrtcProvider?.awareness.on('update', onAwarenessUpdate);

    return () => {
      webrtcProvider?.off('status', onStatus);
      webrtcProvider?.awareness.off('update', onAwarenessUpdate);
    };
  }, [setAwarenessStates, webrtcProvider, webrtcProvider?.awareness]);

  return {
    awarenessStates,
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

  const navigate = useNavigate();

  const { settings } = useSettings();

  const { awarenessStates, isConnected, webrtcProvider } = useWebrtcProvider({
    session,
    setValue,
  });

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
    setDocMapAndWaitForSync(webrtcProvider.doc, 'status', 'ended', true)
      .then(() => {
        navigate(routes.landing.path);
      })
      .catch((error) => {
        // TODO: Handle error
      });
  };

  const hostId = findHostId(awarenessStates);
  const isHostOnline = isHost || (hostId && awarenessStates.get(hostId));
  const isActive = webrtcProvider?.doc.getMap('status').get('ended') || true;

  return {
    awarenessStates,
    isActive,
    isConnected,
    isHostOnline,
    onEndSession,
    webrtcProvider,
  };
};