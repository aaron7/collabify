import { PopoverClose } from '@radix-ui/react-popover';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type EndSessionButtonProps = {
  onEndSession: () => void;
};

export function EndSessionButton({ onEndSession }: EndSessionButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <LogOut className="text-destructive h-4 w-4" strokeWidth={2.5} />
          <span className="ml-2 hidden sm:block">End session</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center justify-center space-x-4">
          <PopoverClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </PopoverClose>
          <Button onClick={onEndSession} variant={'destructive'}>
            End session
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Your Markdown will be available to download.
        </p>
      </PopoverContent>
    </Popover>
  );
}
