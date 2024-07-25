import { Check, CircleCheckBig, ClipboardCopy, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/hooks/session';
import { useActiveTimeout } from '@/hooks/timeout';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadAsMarkdown } from '@/utils/download';

type ExportButtonProps = {
  markdownValue: string;
};

export function ExportButton({ markdownValue }: ExportButtonProps) {
  const session = useSession();
  const [onCopyToClipboard, copiedToClipboard] = useActiveTimeout(() =>
    copyToClipboard(markdownValue),
  );
  const [onDownload, downloaded] = useActiveTimeout(() =>
    downloadAsMarkdown(markdownValue),
  );

  const isUsingApi = session.isHost && session.apiSettings;
  const syncCopy = isUsingApi
    ? 'Synced locally'
    : session.isHost
      ? 'Synced to browser'
      : 'Synced with host';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button size="icon" variant="ghost">
          {copiedToClipboard || downloaded ? (
            <Check className="text-success h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onCopyToClipboard}>
          <ClipboardCopy className="mr-2 h-4 w-4" />
          <span>Copy to clipboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download file</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <CircleCheckBig className="text-success mr-2 h-4 w-4" />
          <span>{syncCopy}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// <Button onClick={copyJoinUrlToClipboard} variant="outline">
// {copiedJoinUrlToClipboard ? (
// <Check className="text-success h-4 w-4" />
// ) : (
// <>
//     <ClipboardCopy className="hidden h-4 w-4 sm:block" />
//     <LinkIcon className="h-4 w-4 sm:hidden" />
// </>
// )}
// <span className="ml-2 hidden sm:block">Copy invite URL</span>
// </Button>
