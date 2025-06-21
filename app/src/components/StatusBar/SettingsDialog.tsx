import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { useSettings } from '@/providers/SettingsProvider';

const formSchema = z.object({
  doNotShowWelcomeDialog: z.boolean(),
  name: z.string().max(20, 'Please choose a name under 20 characters'),
});

export default function SettingsDialog({
  onOpenChange,
  open,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setSettings, settings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      doNotShowWelcomeDialog: settings.doNotShowWelcomeDialog,
      name: settings.name,
    },
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    form.trigger().then((isValid: boolean) => {
      if (!isValid) {
        return;
      }
      setSettings(values);
      onOpenChange(false);
    });
  };

  /* Always reset default values when settings change */
  useEffect(() => {
    form.reset({
      doNotShowWelcomeDialog: settings.doNotShowWelcomeDialog,
      name: settings.name,
    });
  }, [settings, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-2 space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
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

                <FormField
                  control={form.control}
                  name="doNotShowWelcomeDialog"
                  render={({ field }) => (
                    <>
                      {/* Don't use FormItem to allow us to use the grid layout */}
                      <FormLabel
                        className="text-right"
                        htmlFor="doNotShowWelcomeDialog"
                      >
                        Don’t show welcome
                      </FormLabel>
                      <Checkbox
                        checked={field.value}
                        className="text-right"
                        id="doNotShowWelcomeDialog"
                        onCheckedChange={field.onChange}
                      />
                      <FormMessage />
                    </>
                  )}
                />
              </div>
            </div>
            <hr />
            <DialogFooter className="flex justify-end">
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
