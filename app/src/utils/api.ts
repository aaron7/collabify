import createClient from 'openapi-fetch';

import type { paths } from '@/generated/api';

import { buildJoinUrl, buildSessionUrl, type Session } from './session';

export type ApiSettings = {
  baseUrl: string;
  fileId: string;
  token: string;
  version: 'v1';
};

export const getApiSettingsFromUrlFragment = (
  urlFragment: string,
): ApiSettings | null => {
  const hashParams = new URLSearchParams(urlFragment);
  if (
    hashParams.has('baseUrl') &&
    hashParams.has('fileId') &&
    hashParams.has('token') &&
    hashParams.has('version')
  ) {
    const version = hashParams.get('version');

    if (version !== 'v1') {
      throw new Error('Unsupported API version');
    }

    const baseUrl = hashParams.get('baseUrl');
    const fileId = hashParams.get('fileId');
    const token = hashParams.get('token');

    if (!baseUrl || !fileId || !token) {
      throw new Error('Invalid API parameters');
    }

    return {
      baseUrl,
      fileId,
      token,
      version,
    };
  }
  return null;
};

export async function loadInitialMarkdown(session: Session) {
  const apiSettings = session.apiSettings;
  if (!apiSettings) {
    return '';
  }

  const client = createClient<paths>({
    baseUrl: `${apiSettings.baseUrl}/${apiSettings.version}`,
  });
  const { data, response } = await client.GET('/file/{fileId}', {
    headers: {
      Accept: 'text/markdown',
      Authorization: `Bearer ${apiSettings.token}`,
    },
    params: {
      path: { fileId: apiSettings.fileId },
    },
    parseAs: 'text',
  });

  // Handle empty content because openapi-fetch returns {} to allow truthy
  // checks on data to succeed.
  if (
    response.status === 204 ||
    response.headers.get('Content-Length') === '0'
  ) {
    return '';
  }

  return data;
}

export async function saveMarkdown(session: Session, markdown: string) {
  const apiSettings = session.apiSettings;
  if (!apiSettings) {
    return;
  }

  const client = createClient<paths>({
    baseUrl: `${apiSettings.baseUrl}/${apiSettings.version}`,
  });
  await client.PUT('/file/{fileId}', {
    body: markdown,
    bodySerializer(body) {
      return body;
    },
    headers: {
      Authorization: `Bearer ${apiSettings.token}`,
      'Content-Type': 'text/markdown',
    },
    params: {
      path: { fileId: apiSettings.fileId },
    },
  });
}

export async function startSessionCallback(session: Session) {
  const apiSettings = session.apiSettings;
  if (!apiSettings) {
    return;
  }

  const client = createClient<paths>({
    baseUrl: `${apiSettings.baseUrl}/${apiSettings.version}`,
  });
  await client.POST('/session', {
    body: {
      joinUrl: buildJoinUrl(session),
      url: buildSessionUrl(session),
    },
    headers: {
      Authorization: `Bearer ${apiSettings.token}`,
    },
  });
}

export async function stopSessionCallback(session: Session) {
  const apiSettings = session.apiSettings;
  if (!apiSettings) {
    return;
  }

  const client = createClient<paths>({
    baseUrl: `${apiSettings.baseUrl}/${apiSettings.version}`,
  });
  await client.POST('/stop', {
    headers: {
      Authorization: `Bearer ${apiSettings.token}`,
    },
  });
}
