import { uint32 } from 'lib0/random';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { type Session } from './session';

interface AwarenessStateUser {
  isHost: boolean;
}

export type AwarenessState = Map<
  number,
  {
    [x: string]: AwarenessStateUser;
  }
>;

export interface StatusEvent {
  connected: boolean;
}

export interface PeersEvent {
  webrtcPeers: Array<string>;
}

const ROOM_ID_PREFIX = 'collabify-';

// Example y.js colours
export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' },
];

type CreateWebrtcProviderProps = {
  isHost: boolean;
  session: Session;
  ydoc: Doc;
};

export const createWebrtcProvider = ({
  isHost,
  session,
  ydoc,
}: CreateWebrtcProviderProps) => {
  const roomId = `${ROOM_ID_PREFIX}${session.roomId}`;

  const signalingServerUrl = import.meta.env.VITE_WEBRTC_SIGNALING_SERVER_URL;
  const iceServersJson = import.meta.env.VITE_WEBRTC_ICE_SERVERS_JSON;
  const webrtcProvider = new WebrtcProvider(roomId, ydoc, {
    password: session.secret,
    peerOpts: {
      config: {
        ...(iceServersJson ? { iceServers: JSON.parse(iceServersJson) } : {}),
      },
    },
    signaling: [signalingServerUrl || 'ws://localhost:4444'],
  });

  const userColor = usercolors[uint32() % usercolors.length];
  webrtcProvider.awareness.setLocalStateField('user', {
    color: userColor.color,
    colorLight: userColor.light,
    isHost,
  });

  return webrtcProvider;
};

type CreateIndexedDbPersistenceProps = {
  session: Session;
  ydoc: Doc;
};

export const createIndexedDbPersistence = ({
  session,
  ydoc,
}: CreateIndexedDbPersistenceProps) => {
  const indexedDbKey = `${ROOM_ID_PREFIX}${session.roomId}`;
  return new IndexeddbPersistence(indexedDbKey, ydoc);
};

export function setDocMapAndWaitForSync<T>(
  doc: Doc,
  mapName: string,
  key: string,
  value: T,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const updateHandler = () => {
      doc.off('update', updateHandler);
      resolve();
    };

    doc.on('update', updateHandler);
    doc.getMap(mapName).set(key, value);

    setTimeout(() => {
      doc.off('update', updateHandler);
      reject(new Error('Sync timeout'));
    }, 5000);

    updateHandler();
  });
}

export function findHostId(awarenessState: AwarenessState) {
  for (const [key, value] of awarenessState.entries()) {
    if (value.user.isHost) {
      return key;
    }
  }
  return undefined;
}
