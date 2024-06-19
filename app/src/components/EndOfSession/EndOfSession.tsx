import React from 'react';
import {
  Check,
  CircleCheckBig,
  ClipboardCopy,
  DoorClosed,
  Download,
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
    downloadAsMarkdown('collabify.md', value),
  );

  const [copyMarkdownToClipboard, copiedMarkdownToClipboard] = useActiveTimeout(
    () => copyToClipboard(value),
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center max-sm:px-4">
      <h2 className="mb-5 text-center text-3xl">The session has ended</h2>

      {/* TODO: Show true sync status */}
      <div className="mb-10 flex items-center justify-center">
        {session.isHost ? (
          session.apiSettings ? (
            <>
              <CircleCheckBig className="text-success mr-2 h-4 w-4" />
              <span>Synced to your file successfully</span>
            </>
          ) : (
            <span>Please export your markdown</span>
          )
        ) : (
          <>
            <CircleCheckBig className="text-success mr-2 h-4 w-4" />
            <span>Synced to the host successfully</span>
          </>
        )}
      </div>

      <div className="mb-3 flex space-x-2">
        <Button onClick={downloadMarkdown} variant="outline">
          {downloadedMarkdown ? (
            <Check className="text-success mr-2 h-4 w-4" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download a copy
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

      <div className="flex">
        <Link to={routes.landing.path}>
          <Button variant="link">Go to collabify.it</Button>
        </Link>
      </div>
    </div>
  );
};

export default EndOfSession;
