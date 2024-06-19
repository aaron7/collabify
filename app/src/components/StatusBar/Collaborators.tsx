import React, { useMemo } from 'react';

import { Avatar } from '@/components/ui/avatar';
import type { AwarenessStates } from '@/utils/collab';

import Identicon from './Identicon';

type CollaboratorsProps = {
  awarenessClientId: number | null;
  awarenessStates: AwarenessStates;
};

const filterMapByKeys = <K, V>(
  map: Map<K, V>,
  filterFunction: (key: K) => boolean,
): Map<K, V> =>
  new Map(Array.from(map.entries()).filter(([key, _]) => filterFunction(key)));

export const Collaborators = ({
  awarenessClientId,
  awarenessStates,
}: CollaboratorsProps) => {
  const others = useMemo(
    () => filterMapByKeys(awarenessStates, (key) => key !== awarenessClientId),
    [awarenessStates, awarenessClientId],
  );

  if (!awarenessClientId) {
    return null;
  }

  return (
    <div className="flex items-center">
      {Array.from(others.entries()).map(([key, value]) => (
        <Avatar
          className="border-secondary h-8 w-8 border border-solid"
          key={key}
        >
          <Identicon alt={value.user.name} value={key.toString()} />
        </Avatar>
      ))}
    </div>
  );
};
