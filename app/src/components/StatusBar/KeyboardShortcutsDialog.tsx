import React from 'react';
import { ArrowBigUp, ArrowDown, ArrowUp, Command, Option } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const shortcuts = [
  {
    name: 'Open shortcuts',
    shortcut: [Command, '?'],
  },
  {
    name: 'Bold',
    shortcut: [Command, 'b'],
  },
  {
    name: 'Italic',
    shortcut: [Command, 'i'],
  },
  {
    name: 'Strikethrough',
    shortcut: [Command, ArrowBigUp, 's'],
  },
  {
    name: 'Paragraph',
    shortcut: [Command, Option, '0'],
  },
  {
    name: 'Heading 1',
    shortcut: [Command, Option, '1'],
  },
  {
    name: 'Heading 2',
    shortcut: [Command, Option, '2'],
  },
  {
    name: 'Heading 3',
    shortcut: [Command, Option, '3'],
  },
  {
    name: 'Heading 4',
    shortcut: [Command, Option, '4'],
  },
  {
    name: 'Heading 5',
    shortcut: [Command, Option, '5'],
  },
  {
    name: 'Heading 6',
    shortcut: [Command, Option, '6'],
  },
  {
    name: 'Ordered List',
    shortcut: [Command, ArrowBigUp, '7'],
  },
  {
    name: 'Unordered List',
    shortcut: [Command, ArrowBigUp, '8'],
  },
  {
    name: 'Task List',
    shortcut: [Command, ArrowBigUp, '9'],
  },
  {
    name: 'Insert Empty Link',
    shortcut: [Command, 'k'],
  },
  {
    name: 'Move Line Up',
    shortcut: [Option, ArrowUp],
  },
  {
    name: 'Copy Line Up',
    shortcut: [ArrowBigUp, Option, ArrowUp],
  },
  {
    name: 'Move Line Down',
    shortcut: [Option, ArrowDown],
  },
  {
    name: 'Copy Line Down',
    shortcut: [ArrowBigUp, Option, ArrowDown],
  },
  {
    name: 'Delete line',
    shortcut: [Command, ArrowBigUp, 'k'],
  },
];

export default function KeyboardShortcutsDialog({
  onOpenChange,
  open,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Action</TableHead>
                <TableHead>Shortcut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortcuts.map(({ name, shortcut }) => (
                <TableRow key={name}>
                  <TableCell className="text-right font-medium">
                    {name}
                  </TableCell>
                  <TableCell className="flex items-center font-mono">
                    {shortcut.map((Component, i) => {
                      const isFirst = i === 0;
                      const isLast = i === shortcut.length - 1;
                      const className = cn('inline h-4 w-4', {
                        'ml-2': isLast,
                        'mr-2': isFirst,
                        'mx-2': !isFirst && !isLast,
                      });

                      return (
                        <React.Fragment key={i}>
                          {typeof Component === 'string' ? (
                            <span className={className}>{Component}</span>
                          ) : (
                            <Component className={className} />
                          )}
                          {!isLast && '+'}
                        </React.Fragment>
                      );
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
