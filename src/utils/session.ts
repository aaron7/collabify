import routes from '@/routes';

import { generateSecureAlphanumericString } from './random';

export type Session = {
  roomId: string;
  secret: string;
};

function generateRoomId(): string {
  return generateSecureAlphanumericString(10);
}

function generateSecret(): string {
  return generateSecureAlphanumericString(32);
}

export function createNewSession(): Session {
  return {
    roomId: generateRoomId(),
    secret: generateSecret(),
  };
}

export function encodeSessionWithoutSecret(session: Session): string {
  return `${session.roomId}`;
}

export function encodeJoinUrlFragment(session: Session): string {
  // We include the word "secret" in the URL to make it clear
  // that the URL contains a secret when sharing.
  return `secret=${session.secret}+${session.roomId}`;
}

export function decodeJoinUrlFragment(urlFragment: string): Session {
  const encodedSessionWithSecret = urlFragment.split('secret=')[1];
  const [secret, roomId] = encodedSessionWithSecret.split('+');
  return { roomId, secret };
}

export function buildJoinUrl(session: Session): string {
  return `${window.location.origin}${routes.join.path}#${encodeJoinUrlFragment(session)}`;
}
