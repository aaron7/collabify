import { useEffect, useState } from 'react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import {
  Check,
  CircleCheckBig,
  ClipboardCopy,
  Download,
  Keyboard,
  MessageCircle,
  Moon,
  RefreshCcw,
  Settings as SettingsIcon,
  SlidersHorizontal,
  UserPen,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/hooks/session';
import { useActiveTimeout } from '@/hooks/timeout';
import { useSettings } from '@/providers/SettingsProvider';
import { saveMarkdown } from '@/utils/api';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadAsMarkdown } from '@/utils/download';

import { Switch } from '../ui/switch';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import SettingsDialog from './SettingsDialog';

type SettingsButtonProps = {
  markdownValue: string;
};

export function SettingsButton({ markdownValue }: SettingsButtonProps) {
  const session = useSession();
  const { settings } = useSettings();
  const { setTheme, theme } = useTheme();

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isKeyboardShortcutsDialogOpen, setIsKeyboardShortcutsDialogOpen] =
    useState(false);

  const [onCopyToClipboard, copiedToClipboard] = useActiveTimeout(() =>
    copyToClipboard(markdownValue),
  );
  const [onDownload, downloaded] = useActiveTimeout(() =>
    downloadAsMarkdown(markdownValue),
  );

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleDarkModeSwitch = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleForceSync = () => {
    saveMarkdown(session, markdownValue)
      .then(() => {
        toast.success('Synced locally');
      })
      .catch(() => {
        toast.error('Failed to sync locally');
      });
  };

  /* Keyboard shortcuts shortcut */
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.metaKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsKeyboardShortcutsDialogOpen(!isKeyboardShortcutsDialogOpen);
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button size="icon" variant="ghost">
            {copiedToClipboard || downloaded ? (
              <Check className="text-success h-4 w-4" />
            ) : (
              <SettingsIcon className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent collisionPadding={5}>
          <DropdownMenuLabel>Markdown</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onCopyToClipboard}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            <span>Copy to clipboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download</span>
          </DropdownMenuItem>
          {!session.isHost && (
            <DropdownMenuItem
              className="flex flex-col items-start"
              disabled={true}
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-center">
                <CircleCheckBig className="text-success mr-2 h-4 w-4" />
                <span>Synced to host</span>
              </div>
            </DropdownMenuItem>
          )}
          {session.isHost && (
            <DropdownMenuItem
              className="flex flex-col items-start"
              disabled={!session.apiSettings}
              onClick={handleForceSync}
            >
              <div className="flex items-center justify-center">
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Force sync</span>
              </div>
              <span className="mt-2 text-xs">
                Launch via extension or CLI to auto sync
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
            <UserPen className="mr-2 h-4 w-4" />
            {settings.name ? (
              <span className="">{settings.name}</span>
            ) : (
              <span className="text-muted-foreground decoration-muted-foreground underline decoration-dotted">
                Anonymous
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleDarkModeSwitch(!isDarkMode);
            }}
          >
            <Moon className="mr-2 h-4 w-4" />
            <div className="flex w-full items-center justify-between">
              <span>Dark mode</span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeSwitch}
                onClick={(e) => e.preventDefault()}
              />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <span>Other</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsKeyboardShortcutsDialogOpen(true)}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild={true}>
            <a
              href="https://github.com/aaron7/collabify"
              rel="noreferrer"
              target="_blank"
            >
              <SiGithub className="mr-2 h-4 w-4" />
              <span>GitHub repo</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild={true}>
            <a
              href="https://feedback.collabify.it"
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Give feedback</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog
        onOpenChange={setIsSettingsDialogOpen}
        open={isSettingsDialogOpen}
      />
      <KeyboardShortcutsDialog
        onOpenChange={setIsKeyboardShortcutsDialogOpen}
        open={isKeyboardShortcutsDialogOpen}
      />
    </>
  );
}
