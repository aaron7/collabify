import { uint32 } from 'lib0/random';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { type Session } from './session';

export interface AwarenessStateUser {
  color: string;
  colorLight: string;
  isHost: boolean;
  name: string;
}

export type AwarenessStates = Map<
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
  const roomId = `${ROOM_ID_PREFIX}${session.id}`;

  const signalingServersJson = import.meta.env
    .VITE_WEBRTC_SIGNALING_SERVERS_JSON;
  const iceServersJson = import.meta.env.VITE_WEBRTC_ICE_SERVERS_JSON;
  const webrtcProvider = new WebrtcProvider(roomId, ydoc, {
    password: session.secret,
    peerOpts: {
      config: {
        ...(iceServersJson ? { iceServers: JSON.parse(iceServersJson) } : {}),
      },
    },
    signaling: signalingServersJson
      ? JSON.parse(signalingServersJson)
      : ['ws://localhost:4444'],
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
  const indexedDbKey = `${ROOM_ID_PREFIX}${session.id}`;
  return new IndexeddbPersistence(indexedDbKey, ydoc);
};

export function findHostId(awarenessState: AwarenessStates) {
  for (const [key, value] of awarenessState.entries()) {
    if (value.user.isHost) {
      return key;
    }
  }
  return undefined;
}
