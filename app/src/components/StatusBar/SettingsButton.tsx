import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/providers/SettingsProvider';

export function SettingsButton() {
  const { setSettings, settings } = useSettings();

  const [name, setName] = useState(settings.name);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettings({ ...settings, name });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 space-y-4 py-4">
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
            <div>
              <p className="text-sm">
                Your feedback is welcome at{' '}
                <a
                  className="text-blue-500"
                  href="https://feedback.collabify.it"
                  rel="noreferrer"
                  target="_blank"
                >
                  feedback.collabify.it
                </a>{' '}
                or via our{' '}
                <a
                  className="text-blue-500"
                  href="https://github.com/aaron7/collabify"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub repo
                </a>
                .
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
