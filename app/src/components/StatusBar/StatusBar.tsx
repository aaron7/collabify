import { useMemo, useState } from 'react';
import { Check, ClipboardCopy, Download, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import ThemeButton from '@/components/ThemeButton/ThemeButton';
import { Button } from '@/components/ui/button';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import { buildJoinUrl, type Session } from '@/utils/session';

import { EndSessionButton } from './EndSessionButton';
import { SettingsButton } from './SettingsButton';

const COPIED_TO_CLIPBOARD_TIMEOUT = 3000;

type StatusBarProps = {
  copyMarkdownToClipboard: () => void;
  isHost: boolean;
  onEndSession: () => void;
  session: Session;
};

const StatusBar = ({
  copyMarkdownToClipboard,
  isHost,
  onEndSession,
  session,
}: StatusBarProps) => {
  const [copiedJoinUrlToClipboard, setCopiedJoinUrlToClipboard] =
    useState(false);
  const [copiedMarkdownToClipboard, setCopiedMarkdownToClipboard] =
    useState(false);

  const joinUrl = useMemo(() => buildJoinUrl(session), [session]);

  const onCopyInviteUrlClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    copyToClipboard(joinUrl);

    setCopiedJoinUrlToClipboard(true);
    setTimeout(() => {
      setCopiedJoinUrlToClipboard(false);
    }, COPIED_TO_CLIPBOARD_TIMEOUT);
  };

  const onDownloadMarkdown = () => {
    copyMarkdownToClipboard();

    setCopiedMarkdownToClipboard(true);
    setTimeout(() => {
      setCopiedMarkdownToClipboard(false);
    }, COPIED_TO_CLIPBOARD_TIMEOUT);
  };

  return (
    <div className="background-prim flex justify-between p-1">
      <div className="ml-2 flex items-center">
        <Link to={routes.landing.path}>
          <h2 className="text-lg font-semibold">Collabify.it</h2>
        </Link>
      </div>
      <div className="flex space-x-2">
        {isHost && <EndSessionButton onEndSession={onEndSession} />}

        <Button onClick={onCopyInviteUrlClick} variant="outline">
          {copiedJoinUrlToClipboard ? (
            <Check className="text-success h-4 w-4" />
          ) : (
            <>
              <ClipboardCopy className="hidden h-4 w-4 sm:block" />
              <LinkIcon className="h-4 w-4 sm:hidden" />
            </>
          )}
          <span className="ml-2 hidden sm:block">Copy invite URL</span>
        </Button>

        <Button onClick={onDownloadMarkdown} size="icon" variant="ghost">
          {copiedMarkdownToClipboard ? (
            <Check className="text-success h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>

        <ThemeButton />

        <SettingsButton />
      </div>
    </div>
  );
};

export default StatusBar;
