import React from 'react';
import { LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

type LoadingProps = {
  copy?: string;
  ctaCopy: string;
  onCtaClick: () => void;
  showLoader: boolean;
  title: string;
};

const defaultProps = {
  showLoader: true,
};

const Loading = ({
  copy,
  ctaCopy,
  onCtaClick,
  showLoader,
  title,
}: LoadingProps) => {
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
      {copy && <p className="mt-12 font-light italic">{copy}</p>}
    </div>
  );
};

Loading.defaultProps = defaultProps;

export default Loading;
