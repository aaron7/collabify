import { useState } from 'react';

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
import { useSettings } from '@/providers/SettingsProvider';

export function WelcomeDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { setSettings, settings } = useSettings();

  const [name, setName] = useState(settings.name);
  const [doNotShowWelcomeDialog, setDoNotShowWelcomeDialog] = useState(
    settings.doNotShowWelcomeDialog,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettings({ doNotShowWelcomeDialog, name });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
        </DialogHeader>
        <ul className="ml-6 list-disc text-sm">
          <li>Your data is end-to-end encrypted.</li>
          <li>
            Your feedback is welcome at{' '}
            <a
              className="text-blue-500"
              href="https://feedback.collabify.it"
              rel="noreferrer"
              target="_blank"
            >
              feedback.collabify.it
            </a>{' '}
            or in our{' '}
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 pb-6 pt-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center space-x-2">
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
                Don’t this show again
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
