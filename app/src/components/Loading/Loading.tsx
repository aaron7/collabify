import React, { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { downloadAsMarkdown } from '@/utils/download';

type LoadingProps = {
  copy?: string;
  ctaCopy: string;
  mostRecentMarkdown?: string;
  onCtaClick: () => void;
  showCopyAfter?: number;
  showLoader?: boolean;
  title: string;
};

const Loading = ({
  copy,
  ctaCopy,
  mostRecentMarkdown,
  onCtaClick,
  showCopyAfter = 0,
  showLoader = true,
  title,
}: LoadingProps) => {
  const onDownloadMarkdown = () =>
    mostRecentMarkdown && downloadAsMarkdown(mostRecentMarkdown);

  const [showCopy, setShowCopy] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowCopy(true);
    }, showCopyAfter);

    return () => clearTimeout(timeoutId);
  }, [showCopyAfter, setShowCopy]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center max-sm:px-4">
      <h2 className="text-3xl">{title}</h2>
      {showLoader && (
        <LoaderCircle
          aria-label="Loading..."
          className="m-4 h-10 w-10 animate-spin"
        />
      )}
      <Button onClick={onCtaClick} variant="outline">
        {ctaCopy}
      </Button>
      {showCopy && copy && (
        <p className="text-muted-foreground mt-12 max-w-96 text-center font-light">
          {copy}
          {mostRecentMarkdown && (
            <>
              {' '}
              You can download the most recently seen markdown{' '}
              <span
                className="cursor-pointer text-blue-500"
                onClick={onDownloadMarkdown}
              >
                here
              </span>
              .
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default Loading;
