import React, { useMemo } from 'react';

import { Avatar } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import type { AwarenessStates, AwarenessStateUser } from '@/utils/collab';

import Identicon from './Identicon';

type CollaboratorsProps = {
  awarenessClientId: number | null;
  awarenessStates: AwarenessStates;
};

const NUM_TO_INCLUDE = 3;

const filterMapByKeys = <K, V>(
  map: Map<K, V>,
  filterFunction: (key: K) => boolean,
): Map<K, V> =>
  new Map(Array.from(map.entries()).filter(([key, _]) => filterFunction(key)));

const CollobaratorAvatar = ({
  clientId,
  user,
}: {
  clientId: number;
  user: AwarenessStateUser;
}) => (
  <Avatar className="border-secondary h-8 w-8 border border-solid">
    <Identicon
      alt={user.name}
      colour={user.color}
      value={clientId.toString()}
    />
  </Avatar>
);

export const Collaborators = ({
  awarenessClientId,
  awarenessStates,
}: CollaboratorsProps) => {
  const collaborators = useMemo(
    () => filterMapByKeys(awarenessStates, (key) => key !== awarenessClientId),
    [awarenessStates, awarenessClientId],
  );

  if (!awarenessClientId) {
    return null;
  }

  const firstGroup = Array.from(collaborators.entries()).slice(
    0,
    NUM_TO_INCLUDE,
  );
  const others = Array.from(collaborators.entries()).slice(NUM_TO_INCLUDE);

  return (
    <div className="flex items-center space-x-1 max-[520px]:hidden">
      {firstGroup.map(([key, value]) => (
        <CollobaratorAvatar clientId={key} key={key} user={value.user} />
      ))}
      {others.length > 0 && (
        <HoverCard openDelay={100}>
          <HoverCardTrigger>
            <Avatar
              className="border-secondary border-solidflex text-primary h-8 w-8 items-center justify-center border text-xs"
              key={'others'}
            >
              <span>+{others.length <= 99 ? others.length : 99}</span>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-full max-w-64">
            <div className="flex flex-wrap">
              {others.map(([key, value]) => (
                <CollobaratorAvatar
                  clientId={key}
                  key={key}
                  user={value.user}
                />
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};
