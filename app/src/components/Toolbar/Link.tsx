import React from 'react';
import { EditorView } from '@codemirror/view';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  insertLink,
  removeLink,
  updateLink,
} from '@/components/MarkdownEditor/extensions/markdown/commands';
import { getSelectedLinks } from '@/components/MarkdownEditor/extensions/markdown/links';
import { SelectionState } from '@/components/MarkdownEditor/extensions/selection-state/selection-state';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';

const formSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  url: z.string().url('URL is not valid'),
});

export default function Link({
  editorView,
  selectionState,
}: {
  editorView: EditorView | undefined;
  selectionState: SelectionState;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      text: '',
      url: '',
    },
    resolver: zodResolver(formSchema),
  });

  function onFormOpen() {
    form.reset();

    if (!editorView) {
      return;
    }

    const existingSelectedLinks = getSelectedLinks(editorView);

    // Populate the text field with any selected text, ignoring multiple selections
    const selection = editorView.state.selection.ranges[0];
    if (!existingSelectedLinks.length && !selection.empty) {
      const text = editorView.state.sliceDoc(selection.from, selection.to);
      form.setValue('text', text);
      setTimeout(() => {
        form.setFocus('url');
      }, 0);
    }

    // Only populate the fields if a single link is selected as we are not
    // supporting updating multiple links at once
    if (existingSelectedLinks.length === 1) {
      const existingSelectedLink = existingSelectedLinks[0];
      form.setValue('text', existingSelectedLink.text.content);
      if (existingSelectedLink.url) {
        form.setValue('url', existingSelectedLink.url.content);
      }
    }
  }

  function onDeleteLink() {
    if (!editorView) {
      return;
    }

    const existingSelectedLinks = getSelectedLinks(editorView);
    if (existingSelectedLinks.length === 1) {
      const selectedLink = existingSelectedLinks[0];
      removeLink({
        dispatch: editorView?.dispatch,
        selectedLink,
        state: editorView.state,
      });
    }

    setIsOpen(false);
    editorView.focus();
  }

  function onInsertLink(values: z.infer<typeof formSchema>) {
    if (!editorView) {
      return;
    }

    form.trigger().then((isValid: boolean) => {
      if (!isValid) {
        return;
      }

      const existingSelectedLinks = getSelectedLinks(editorView);

      if (existingSelectedLinks.length === 1) {
        const selectedLink = existingSelectedLinks[0];
        updateLink({
          dispatch: editorView?.dispatch,
          state: editorView.state,
          text: {
            content: values.text,
            from: selectedLink.text.from,
            to: selectedLink.text.to,
          },
          url: {
            content: values.url,
            from: selectedLink.url
              ? selectedLink.url.from
              : selectedLink.text.to + 2,
            to: selectedLink.url
              ? selectedLink.url.to
              : selectedLink.text.to + 2,
          },
        });
      } else {
        insertLink({ text: values.text, url: values.url })({
          dispatch: editorView?.dispatch,
          state: editorView?.state,
        });
      }

      setIsOpen(false);
      editorView.focus();
    });
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        asChild
        onClick={onFormOpen}
        onMouseDown={(e) => e.preventDefault()}
      >
        <a>
          <Toggle
            aria-label={selectionState.link ? 'Update link' : 'Insert link'}
            className="rounded-none"
            onMouseDown={(e) => e.preventDefault()}
            pressed={selectionState.link}
          >
            <Link2 className="h-4 w-4" />
          </Toggle>
        </a>
      </PopoverTrigger>

      <PopoverContent>
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(onInsertLink)}
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-around">
                {selectionState.link && (
                  <Button onClick={onDeleteLink} variant="destructive">
                    Remove link
                  </Button>
                )}
                <Button type="submit">
                  {selectionState.link ? 'Update link' : 'Insert link'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
