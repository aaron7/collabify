import React from 'react';
import { ensureSyntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image, Link2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  insertLinkOrImage,
  removeLinkOrImage,
  updateLinkOrImage,
  type LinkOrImageState,
} from '@/components/MarkdownEditor/extensions/markdown/commands';
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

const variants = {
  image: {
    displayName: 'image',
    formLabels: {
      text: 'Alt text',
      url: 'Image URL',
    },
    icon: <Image className="h-4 w-4" />,
    parentNodeType: 'Image',
  },
  link: {
    displayName: 'link',
    formLabels: {
      text: 'Text',
      url: 'URL',
    },
    icon: <Link2 className="h-4 w-4" />,
    parentNodeType: 'Link',
  },
};

export default function LinkOrImage({
  editorView,
  selectionState,
  variant,
}: {
  editorView: EditorView | undefined;
  selectionState: SelectionState;
  variant: 'link' | 'image';
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const { displayName, formLabels, icon } = variants[variant];
  const selectionStateValue = selectionState[variant];

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

    const existingSelected = getSelected(editorView, variant);

    // Populate the text field with any selected text, ignoring multiple selections
    const selection = editorView.state.selection.ranges[0];
    if (!existingSelected.length && !selection.empty) {
      const text = editorView.state.sliceDoc(selection.from, selection.to);
      form.setValue('text', text);
      setTimeout(() => {
        form.setFocus('url');
      }, 0);
    }

    // Only populate the fields if a single link is selected as we are not
    // supporting updating multiple links at once
    if (existingSelected.length === 1) {
      const firstExistingSelected = existingSelected[0];
      form.setValue('text', firstExistingSelected.text.content);
      if (firstExistingSelected.url) {
        form.setValue('url', firstExistingSelected.url.content);
      }
    }
  }

  function onDelete() {
    if (!editorView) {
      return;
    }

    const existingSelected = getSelected(editorView, variant);
    if (existingSelected.length === 1) {
      const selected = existingSelected[0];
      removeLinkOrImage({
        dispatch: editorView?.dispatch,
        selected,
        state: editorView.state,
        variant,
      });
    }

    setIsOpen(false);
    editorView.focus();
  }

  function onInsert(values: z.infer<typeof formSchema>) {
    if (!editorView) {
      return;
    }

    form.trigger().then((isValid: boolean) => {
      if (!isValid) {
        return;
      }

      const existingSelected = getSelected(editorView, variant);

      if (existingSelected.length === 1) {
        const selected = existingSelected[0];
        updateLinkOrImage({
          dispatch: editorView?.dispatch,
          state: editorView.state,
          text: {
            content: values.text,
            from: selected.text.from,
            to: selected.text.to,
          },
          url: {
            content: values.url,
            from: selected.url ? selected.url.from : selected.text.to + 2,
            to: selected.url ? selected.url.to : selected.text.to + 2,
          },
        });
      } else {
        insertLinkOrImage({ text: values.text, url: values.url, variant })({
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
            aria-label={
              selectionStateValue
                ? `Update ${displayName}`
                : `Insert  ${displayName}`
            }
            className="rounded-none"
            onMouseDown={(e) => e.preventDefault()}
            pressed={selectionStateValue}
          >
            {icon}
          </Toggle>
        </a>
      </PopoverTrigger>

      <PopoverContent>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onInsert)}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formLabels.text}</FormLabel>
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
                    <FormLabel>{formLabels.url}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-around">
                {selectionStateValue && (
                  <Button onClick={onDelete} variant="destructive">
                    Remove {displayName}
                  </Button>
                )}
                <Button type="submit">
                  {selectionStateValue
                    ? `Update ${displayName}`
                    : `Insert ${displayName}`}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

function getSelected(editorView: EditorView, variant: 'link' | 'image') {
  const { parentNodeType } = variants[variant];

  const tree = ensureSyntaxTree(editorView.state, editorView.state.doc.length);

  if (!tree) {
    return [];
  }

  const selected: LinkOrImageState[] = [];

  editorView.state.selection.ranges.forEach((range) => {
    const from = range.from;
    const to = range.to;

    tree.iterate({
      enter: (node) => {
        if (node.type.name === parentNodeType) {
          const urlNode = node.node.getChild('URL');
          const linkMarkNodes = node.node.getChildren('LinkMark');

          selected.push({
            from: node.from,
            text: {
              content: editorView.state.sliceDoc(
                linkMarkNodes[0].to,
                linkMarkNodes[1].from,
              ),
              from: linkMarkNodes[0].to,
              to: linkMarkNodes[1].from,
            },
            to: node.to,
            url: urlNode
              ? {
                  content: editorView.state.sliceDoc(urlNode.from, urlNode.to),
                  from: urlNode.from,
                  to: urlNode.to,
                }
              : null,
          });
        }
      },
      from,
      to,
    });
  });

  return selected;
}
