import React, { useEffect } from 'react';
import { Check, ClipboardCopy, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useActiveTimeout } from '@/hooks/timeout';
import routes from '@/routes';
import { copyToClipboard } from '@/utils/clipboard';
import { recoverIndexedDbPersistenceRawMarkdown } from '@/utils/collab';
import { downloadAsMarkdown } from '@/utils/download';

type ErrorProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const Error = ({ error, resetErrorBoundary }: ErrorProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    resetErrorBoundary();
    navigate(routes.landing.path);
  };

  const [recoveredMarkdown, setRecoveredMarkdown] = React.useState<
    string | null
  >(null);

  // Attempt to recover markdown from IndexedDB and the session ID in the URL fragment
  useEffect(() => {
    const urlFragmentParams = new URLSearchParams(location.hash.slice(1));
    const sessionId = urlFragmentParams.get('id');
    if (sessionId) {
      recoverIndexedDbPersistenceRawMarkdown(sessionId).then((markdown) =>
        setRecoveredMarkdown(markdown),
      );
    }
  }, [location.hash]);

  const [downloadMarkdown, downloadedMarkdown] = useActiveTimeout(
    () => recoveredMarkdown && downloadAsMarkdown(recoveredMarkdown),
  );

  const [copyMarkdownToClipboard, copiedMarkdownToClipboard] = useActiveTimeout(
    () => recoveredMarkdown && copyToClipboard(recoveredMarkdown),
  );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-8 max-sm:px-4">
      <h2 className="text-center text-3xl">Something went wrong</h2>
      <p className="max-w-lg font-mono font-light">Error: {error.message}</p>
      <p>
        Please include the above in a{' '}
        <a
          className="text-blue-500 hover:underline"
          href="https://github.com/aaron7/collabify"
          rel="noreferrer"
          target="_blank"
        >
          GitHub issue
        </a>{' '}
        or via{' '}
        <a
          className="text-blue-500 hover:underline"
          href="https://feedback.collabify.it"
          rel="noreferrer"
          target="_blank"
        >
          feedback.collabify.it
        </a>
        .
      </p>

      {recoveredMarkdown && (
        <div className="flex space-x-2">
          <Button onClick={downloadMarkdown} variant="outline">
            {downloadedMarkdown ? (
              <Check className="text-success mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download file
          </Button>
          <Button onClick={copyMarkdownToClipboard} variant="outline">
            {copiedMarkdownToClipboard ? (
              <Check className="text-success mr-2 h-4 w-4" />
            ) : (
              <ClipboardCopy className="mr-2 h-4 w-4" />
            )}
            Copy to clipboard
          </Button>
        </div>
      )}

      <Button onClick={goBack} variant="outline">
        Go to collabify.it
      </Button>
    </div>
  );
};

export default Error;
