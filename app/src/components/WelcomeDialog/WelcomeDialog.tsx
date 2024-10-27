import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/providers/SettingsProvider';

const formSchema = z.object({
  doNotShowWelcomeDialog: z.boolean(),
  name: z.string().max(20, 'Please choose a name under 20 characters'),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      doNotShowWelcomeDialog: settings.doNotShowWelcomeDialog,
      name: settings.name,
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      editorView?.focus();
    }
  }, [isOpen, editorView]);

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    form.trigger().then((isValid: boolean) => {
      if (!isValid) {
        return;
      }
      setSettings(values);
      setIsOpen(false);
    });
  };

  const handleDarkModeSwitch = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleOnOpenChange = (open: boolean) => {
    form.trigger().then((isValid: boolean) => {
      if (isValid) {
        setSettings(form.getValues());
      }
    });
    setIsOpen(open);
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} open={isOpen}>
      <DialogContent
        className="sm:max-w-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Getting started</DialogTitle>
        </DialogHeader>
        <ul className="ml-4 list-disc space-y-1 sm:ml-8">
          <li>Your data is end-to-end encrypted.</li>
          <li>Your markdown will be available after the session has ended.</li>
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
        <Form {...form}>
          <form
            className="mt-2 space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-[auto,1fr] items-center gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <>
                      {/* Don't use FormItem to allow us to use the grid layout */}
                      <FormLabel className="text-right" htmlFor="name">
                        Your name
                      </FormLabel>

                      <Input
                        {...field}
                        className="col-span-1"
                        id="name"
                        placeholder="Anonymous"
                      />
                      <FormMessage className="col-span-2" />
                    </>
                  )}
                />

                {/* Change dark mode setting immediately */}
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
              <FormField
                control={form.control}
                name="doNotShowWelcomeDialog"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      id="doNotShowWelcomeDialog"
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor="doNotShowWelcomeDialog"
                    >
                      Don’t show this again
                    </FormLabel>
                    <FormMessage />
                  </div>
                )}
              />
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
