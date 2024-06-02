import { useMemo, useState } from 'react';
import {
  Check,
  ClipboardCopy,
  Download,
  RefreshCwOff,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import { buildJoinUrl, type Session } from '@/utils/session';

const COPIED_TO_CLIPBOARD_TIMEOUT = 3000;

type StatusBarProps = {
  isHost: boolean;
  onEndSession: () => void;
  session: Session;
};

const StatusBar = ({ isHost, onEndSession, session }: StatusBarProps) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const joinUrl = useMemo(() => buildJoinUrl(session), [session]);

  const onCopyInviteUrlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    copyToClipboard(joinUrl);

    setCopiedToClipboard(true);
    setTimeout(() => {
      setCopiedToClipboard(false);
    }, COPIED_TO_CLIPBOARD_TIMEOUT);
  };

  return (
    <div className="background-prim flex justify-between p-1">
      <div className="flex items-center">
        <Link to={routes.landing.path}>
          <h2 className="text-lg font-semibold">Collabify.it</h2>
        </Link>
      </div>
      <div className="flex space-x-2">
        {isHost && (
          <Button onClick={onEndSession} variant="outline">
            <RefreshCwOff className="mr-2 h-4 w-4 text-destructive" />
            End session
          </Button>
        )}

        <Button onClick={onCopyInviteUrlClick} variant="outline">
          {copiedToClipboard ? (
            <Check className="mr-2 h-4 w-4 text-success" />
          ) : (
            <ClipboardCopy className="mr-2 h-4 w-4" />
          )}
          Copy invite URL
        </Button>

        <Button size="icon" variant="ghost">
          <Download className="h-4 w-4" />
        </Button>

        <Button size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StatusBar;
