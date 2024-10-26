import { useEffect, useState } from 'react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/providers/SettingsProvider';

export function WelcomeDialog({
  editorRefs,
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editorRefs: React.RefObject<ReactCodeMirrorRef>;
}) {
  const editorView = editorRefs?.current?.view;

  const { setSettings, settings } = useSettings();
  const { setTheme, theme } = useTheme();

  const [name, setName] = useState(settings.name);
  const [doNotShowWelcomeDialog, setDoNotShowWelcomeDialog] = useState(
    settings.doNotShowWelcomeDialog,
  );

  useEffect(() => {
    if (!isOpen) {
      editorView?.focus();
    }
  }, [isOpen, editorView]);

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettings({ doNotShowWelcomeDialog, name });
  };

  const handleDarkModeSwitch = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Getting started</DialogTitle>
        </DialogHeader>
        <ul className="ml-4 list-disc space-y-1 sm:ml-8">
          <li>Your data is end-to-end encrypted.</li>
          <li>Your markdown is available after a session has ended.</li>
          <li>
            Feedback is welcome at{' '}
            <a
              className="text-blue-500"
              href="https://feedback.collabify.it"
              rel="noreferrer"
              target="_blank"
            >
              feedback.collabify.it
            </a>
            , or in the{' '}
            <a
              className="text-blue-500"
              href="https://github.com/aaron7/collabify"
              rel="noreferrer"
              target="_blank"
            >
              GitHub repo
            </a>
            .
          </li>
        </ul>
        <hr />
        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center">
            <div className="grid grid-cols-[auto,1fr] items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Your name
              </Label>
              <Input
                className="col-span-1"
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />

              <Label className="text-right" htmlFor="name">
                Dark mode
              </Label>
              <Switch
                checked={isDarkMode}
                id="dark-mode"
                onCheckedChange={handleDarkModeSwitch}
              />
            </div>
            <p className="text-muted-foreground mt-6 text-sm">
              You can update later using the top-right settings icon.
            </p>
          </div>
          <hr />
          <DialogFooter className="gap-6 sm:justify-between">
            <div className="flex items-center justify-center space-x-2">
              <Checkbox
                checked={doNotShowWelcomeDialog}
                id="terms"
                onCheckedChange={(checked: boolean) =>
                  setDoNotShowWelcomeDialog(checked)
                }
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="terms"
              >
                Don’t show this again
              </label>
            </div>
            <DialogClose asChild>
              <Button type="submit">Continue</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
