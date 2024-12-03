import { useMemo } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useActiveTimeout } from '@/hooks/timeout';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import type { AwarenessStates } from '@/utils/collab';
import { buildJoinUrl, type Session } from '@/utils/session';

import { Collaborators } from './Collaborators';
import { EndSessionButton } from './EndSessionButton';
import { SettingsButton } from './SettingsButton';

type StatusBarProps = {
  awarenessClientId: number | null;
  awarenessStates: AwarenessStates;
  onEndSession: () => void;
  session: Session;
  value: string;
};

const StatusBar = ({
  awarenessClientId,
  awarenessStates,
  onEndSession,
  session,
  value,
}: StatusBarProps) => {
  const joinUrl = useMemo(() => buildJoinUrl(session), [session]);

  const [copyJoinUrlToClipboard, copiedJoinUrlToClipboard] = useActiveTimeout(
    () => {
      copyToClipboard(joinUrl);
    },
  );

  return (
    <div className="background-prim flex justify-between p-1">
      <div className="ml-2 flex items-center">
        <Link to={routes.landing.path}>
          <h2 className="text-primary font-poppins text-lg font-bold">
            <span>Collabify</span>
            <span className="text-xs opacity-50">.it</span>
          </h2>
        </Link>
      </div>
      <div className="flex space-x-2">
        <Collaborators
          awarenessClientId={awarenessClientId}
          awarenessStates={awarenessStates}
        />

        {session.isHost && <EndSessionButton onEndSession={onEndSession} />}

        <Button onClick={copyJoinUrlToClipboard} variant="ghost">
          {copiedJoinUrlToClipboard ? (
            <Check className="text-success h-4 w-4" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
          <span className="ml-2 hidden sm:block">Copy invite</span>
        </Button>

        <SettingsButton markdownValue={value} />
      </div>
    </div>
  );
};

export default StatusBar;
