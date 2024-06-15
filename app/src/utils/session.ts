import routes from '@/routes';

import { generateSecureAlphanumericString } from './random';

const SESSION_LOCAL_STORAGE_KEY_PREFIX = 'session.v1.';

export type Session = {
  apiUrl?: string;
  createdAt: string;
  id: string;
  isHost: boolean;
  lastOpenedAt: string;
  secret: string;
};

function saveSession(session: Session): void {
  localStorage.setItem(
    `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${session.id}`,
    JSON.stringify(session),
  );
}

function loadSession(id: string): Session | null {
  const sessionJson = localStorage.getItem(
    `${SESSION_LOCAL_STORAGE_KEY_PREFIX}${id}`,
  );
  return sessionJson ? JSON.parse(sessionJson) : null;
}

type CreateAndSaveSessionProps = {
  apiUrl?: string;
  id?: string;
  isHost: boolean;
  secret?: string;
};

function createAndSaveSession({
  apiUrl,
  id,
  isHost,
  secret,
}: CreateAndSaveSessionProps): Session {
  const now = new Date().toISOString();
  const session = {
    apiUrl,
    createdAt: now,
    id: id || generateSecureAlphanumericString(10),
    isHost,
    lastOpenedAt: now,
    secret: secret || generateSecureAlphanumericString(32),
  };
  saveSession(session);
  return session;
}

type CreateNewSessionProps = {
  apiUrl?: string;
};

export function createNewSession({ apiUrl }: CreateNewSessionProps): Session {
  return createAndSaveSession({ apiUrl, isHost: true });
}

export function buildSessionUrlFragment(session: Session): string {
  return new URLSearchParams({
    id: session.id,
  }).toString();
}

export function getSessionFromUrlFragment(urlFragement: string): Session {
  const urlFragmentParams = new URLSearchParams(urlFragement);

  const id = urlFragmentParams.get('id');
  if (!id) {
    throw new Error('The URL fragment does not contain an id');
  }

  const session = loadSession(id);
  if (!session) {
    throw new Error('Please ask the host for a join URL to join the session');
  }

  return session;
}

export function getSessionFromJoinUrlFragment(urlFragment: string): Session {
  const urlFragmentParams = new URLSearchParams(urlFragment);

  const secretAndId = urlFragmentParams.get('secret');
  if (!secretAndId) {
    throw new Error('The URL fragment does not contain a secret');
  }
  const [secret, id] = secretAndId.split('.');

  const existingSession = loadSession(id);
  if (existingSession) {
    if (existingSession.secret !== secret) {
      throw new Error(
        "The secret does not match the existing session's secret",
      );
    }
    return existingSession;
  }

  return createAndSaveSession({
    id,
    isHost: false,
    secret,
  });
}

export function buildJoinUrl(session: Session): string {
  // We include the word "secret" in the URL fragment to
  // make it clear that the URL contains a secret when sharing.
  const joinUrlFragment = new URLSearchParams({
    secret: `${session.secret}.${session.id}`,
  }).toString();

  return `${window.location.origin}${routes.join.path}#${joinUrlFragment}`;
}
