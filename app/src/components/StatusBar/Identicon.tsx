import React, { useMemo } from 'react';
import { minidenticon } from 'minidenticons';

import { AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type IdenticonProps = {
  alt: string;
  value: string;
};

const Identicon = ({ alt, value }: IdenticonProps) => {
  const svgString = useMemo(() => minidenticon(value), [value]);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <AvatarImage
            alt={alt}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(minidenticon(svgString))}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <span>{alt}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Identicon;
