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
  colour: string;
  value: string;
};

const Identicon = ({ alt, colour, value }: IdenticonProps) => {
  const svgString = useMemo(() => minidenticon(value), [value]);
  const svgStringWithColor = svgString.replace(
    /fill="hsl\(\d+\s+\d+%\s+\d+%\s*\)"/,
    `fill="${colour}"`,
  );
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <AvatarImage
            alt={alt}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgStringWithColor)}`}
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
