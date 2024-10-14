import { StateCommand } from '@codemirror/state';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import {
  Bold,
  Code,
  Grid2X2,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  SquareCode,
  Strikethrough,
} from 'lucide-react';

import {
  insertFencedCode,
  insertImage,
  insertLink,
  insertTable,
  makeBlockquote,
  makeHeading1,
  makeHeading2,
  makeHeading3,
  makeHeading4,
  makeHeading5,
  makeHeading6,
  makeOrderedList,
  makeParagraph,
  makeTaskList,
  makeUnorderedList,
  toggleBold,
  toggleInlineCode,
  toggleItalic,
  toggleStrikethrough,
} from '@/components/MarkdownEditor/extensions/markdown/commands';
import {
  SelectionState,
  SelectionStateKey,
} from '@/components/MarkdownEditor/extensions/selection-state/selection-state';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

type ToolbarToggleProps = {
  ariaLabel: string;
  command: (isToggleChecked: boolean) => void;
  icon: React.ReactNode;
  pressed: boolean;
};

function ToolbarToggle({
  ariaLabel,
  command,
  icon,
  pressed,
}: ToolbarToggleProps) {
  return (
    <Toggle
      aria-label={ariaLabel}
      className="rounded-none"
      onMouseDown={(e) => e.preventDefault()}
      onPressedChange={command}
      pressed={pressed}
    >
      {icon}
    </Toggle>
  );
}

type ToolbarProps = {
  editorRefs: React.RefObject<ReactCodeMirrorRef>;
  selectionState: SelectionState;
};

export function Toolbar({ editorRefs, selectionState }: ToolbarProps) {
  const editorView = editorRefs?.current?.view;

  const handleToggleLine =
    (makeCommand: StateCommand) => (isToggleChecked: boolean) => {
      if (!editorView) {
        return;
      }

      if (isToggleChecked) {
        makeCommand({
          dispatch: editorView?.dispatch,
          state: editorView?.state,
        });
      } else {
        makeParagraph({
          dispatch: editorView?.dispatch,
          state: editorView?.state,
        });
      }
    };

  const handleToggleSelection = (toggleCommand: StateCommand) => () => {
    if (!editorView) {
      return;
    }

    toggleCommand({ dispatch: editorView?.dispatch, state: editorView?.state });
  };

  const headingKeys = [
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6',
  ] as SelectionStateKey[];
  const isActiveHeading = headingKeys.some((key) => selectionState[key]);

  return (
    <div className="relative flex justify-center">
      <div className="bg-background absolute z-20 flex h-10 overflow-hidden rounded-b-lg border-x border-b">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild={true}
            onMouseDown={(e) => e.preventDefault()}
          >
            <a>
              <Toggle
                aria-label="Heading"
                className={cn('rounded-none', {
                  'px-2.5': isActiveHeading, // the numbered heading icons are wider
                })}
                onMouseDown={(e) => e.preventDefault()}
                pressed={isActiveHeading}
              >
                {!isActiveHeading && <Heading className="h-4 w-4" />}
                {selectionState.heading1 && <Heading1 className="h-5 w-5" />}
                {selectionState.heading2 && <Heading2 className="h-5 w-5" />}
                {selectionState.heading3 && <Heading3 className="h-5 w-5" />}
                {selectionState.heading4 && <Heading4 className="h-5 w-5" />}
                {selectionState.heading5 && <Heading5 className="h-5 w-5" />}
                {selectionState.heading6 && <Heading6 className="h-5 w-5" />}
              </Toggle>
            </a>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              editorView?.focus();
            }}
          >
            <DropdownMenuCheckboxItem
              checked={selectionState.heading1}
              onCheckedChange={handleToggleLine(makeHeading1)}
              onMouseDown={(e) => e.preventDefault()}
            >
              Heading 1
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectionState.heading2}
              onCheckedChange={handleToggleLine(makeHeading2)}
            >
              Heading 2
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectionState.heading3}
              onCheckedChange={handleToggleLine(makeHeading3)}
            >
              Heading 3
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectionState.heading4}
              onCheckedChange={handleToggleLine(makeHeading4)}
            >
              Heading 4
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectionState.heading5}
              onCheckedChange={handleToggleLine(makeHeading5)}
            >
              Heading 5
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectionState.heading6}
              onCheckedChange={handleToggleLine(makeHeading6)}
            >
              Heading 6
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarToggle
          ariaLabel="Toggle bold"
          command={handleToggleSelection(toggleBold)}
          icon={<Bold className="h-4 w-4" />}
          pressed={selectionState.bold}
        />
        <ToolbarToggle
          ariaLabel="Toggle italic"
          command={handleToggleSelection(toggleItalic)}
          icon={<Italic className="h-4 w-4" />}
          pressed={selectionState.italic}
        />
        <ToolbarToggle
          ariaLabel="Toggle strikethrough"
          command={handleToggleSelection(toggleStrikethrough)}
          icon={<Strikethrough className="h-4 w-4" />}
          pressed={selectionState.strikethrough}
        />
        <ToolbarToggle
          ariaLabel="Toggle inline code"
          command={handleToggleSelection(toggleInlineCode)}
          icon={<Code className="h-4 w-4" />}
          pressed={selectionState.inlineCode}
        />

        <Separator orientation="vertical" />

        <ToolbarToggle
          ariaLabel="Insert link"
          command={handleToggleSelection(insertLink)}
          icon={<Link2 className="h-4 w-4" />}
          pressed={selectionState.link}
        />
        <ToolbarToggle
          ariaLabel="Insert image"
          command={handleToggleSelection(insertImage)}
          icon={<Image className="h-4 w-4" />}
          pressed={selectionState.image}
        />
        <ToolbarToggle
          ariaLabel="Insert table"
          command={handleToggleSelection(insertTable)}
          icon={<Grid2X2 className="h-4 w-4" />}
          pressed={selectionState.table}
        />

        <Separator orientation="vertical" />

        <ToolbarToggle
          ariaLabel="Toggle bullet list"
          command={handleToggleLine(makeUnorderedList)}
          icon={<List className="h-4 w-4" />}
          pressed={selectionState.bulletList}
        />
        <ToolbarToggle
          ariaLabel="Toggle numbered list"
          command={handleToggleLine(makeOrderedList)}
          icon={<ListOrdered className="h-4 w-4" />}
          pressed={selectionState.orderedList}
        />
        <ToolbarToggle
          ariaLabel="Toggle check list"
          command={handleToggleLine(makeTaskList)}
          icon={<ListTodo className="h-4 w-4" />}
          pressed={selectionState.task}
        />
        <ToolbarToggle
          ariaLabel="Toggle quote"
          command={handleToggleLine(makeBlockquote)}
          icon={<Quote className="h-4 w-4" />}
          pressed={selectionState.blockquote}
        />
        <ToolbarToggle
          ariaLabel="Insert code block"
          command={handleToggleSelection(insertFencedCode)}
          icon={<SquareCode className="h-4 w-4" />}
          pressed={selectionState.fencedCode}
        />
      </div>
    </div>
  );
}
