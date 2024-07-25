import React from 'react';
import {
  Check,
  CircleCheckBig,
  ClipboardCopy,
  DoorClosed,
  Download,
  Github,
  House,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useActiveTimeout } from '@/hooks/timeout';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadAsMarkdown } from '@/utils/download';
import { Session } from '@/utils/session';

type EndOfSessionProps = {
  session: Session;
  value: string;
};

const EndOfSession = ({ session, value }: EndOfSessionProps) => {
  const canCloseWindow = window.opener != null || window.history.length == 1;

  // TODO: Extract a better filename
  const [downloadMarkdown, downloadedMarkdown] = useActiveTimeout(() =>
    downloadAsMarkdown(value),
  );

  const [copyMarkdownToClipboard, copiedMarkdownToClipboard] = useActiveTimeout(
    () => copyToClipboard(value),
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-8 max-sm:px-4">
      <h2 className="text-center text-3xl">Thank you for collaborating</h2>

      {/* TODO: Show true sync status */}
      <div className="flex items-center justify-center">
        {session.isHost ? (
          session.apiSettings ? (
            <>
              <CircleCheckBig className="text-success mr-2 h-4 w-4" />
              <span>Synced to your file successfully</span>
            </>
          ) : (
            <span>Please download your markdown</span>
          )
        ) : (
          <>
            <CircleCheckBig className="text-success mr-2 h-4 w-4" />
            <span>Synced to the host successfully</span>
          </>
        )}
      </div>

      <div className="flex space-x-2">
        <Button onClick={downloadMarkdown} variant="outline">
          {downloadedMarkdown ? (
            <Check className="text-success mr-2 h-4 w-4" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {session.isHost && !session.apiSettings
            ? 'Download file'
            : 'Download a copy'}
        </Button>
        <Button onClick={copyMarkdownToClipboard} variant="outline">
          {copiedMarkdownToClipboard ? (
            <Check className="text-success mr-2 h-4 w-4" />
          ) : (
            <ClipboardCopy className="mr-2 h-4 w-4" />
          )}
          Copy to clipboard
        </Button>
        {canCloseWindow && (
          <Button onClick={window.close} variant="outline">
            <DoorClosed className="mr-2 h-4 w-4" />
            Close window
          </Button>
        )}
      </div>

      <div className="sm:place-items-auto grid grid-cols-1 place-items-center sm:grid-cols-3">
        <a
          href="https://feedback.collabify.it"
          rel="noreferrer"
          target="_blank"
        >
          <Button variant="link">
            <MessageCircle className="mr-1 h-4 w-4" />
            Give feedback
          </Button>
        </a>
        <a
          href="https://github.com/aaron7/collabify"
          rel="noreferrer"
          target="_blank"
        >
          <Button variant="link">
            <Github className="mr-1 h-4 w-4" />
            GitHub
          </Button>
        </a>
        <Link to={routes.landing.path}>
          <Button variant="link">
            <House className="mr-1 h-4 w-4" />
            Go to collabify.it
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EndOfSession;
