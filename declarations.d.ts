declare module '@joplin/turndown' {
  export = TurndownService;
}

declare module '@joplin/turndown-plugin-gfm' {
  export function gfm(turndownService: TurndownService): void;
}

/* Copied from @types/turndown package */
declare class TurndownService {
  constructor(options?: TurndownService.Options);

  addRule(key: string, rule: TurndownService.Rule): this;
  keep(filter: TurndownService.Filter): this;
  remove(filter: TurndownService.Filter): this;
  use(plugins: TurndownService.Plugin | TurndownService.Plugin[]): this;
  escape(str: string): string;

  turndown(html: string | TurndownService.Node): string;

  options: TurndownService.Options;
  rules: TurndownService.Rules;
}

declare namespace TurndownService {
  interface Options {
    blankReplacement?: ReplacementFunction | undefined;
    br?: string | undefined;
    bulletListMarker?: '-' | '+' | '*' | undefined;
    codeBlockStyle?: 'indented' | 'fenced' | undefined;
    defaultReplacement?: ReplacementFunction | undefined;
    emDelimiter?: '_' | '*' | undefined;
    fence?: '```' | '~~~' | undefined;
    headingStyle?: 'setext' | 'atx' | undefined;
    hr?: string | undefined;
    keepReplacement?: ReplacementFunction | undefined;
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut' | undefined;

    linkStyle?: 'inlined' | 'referenced' | undefined;
    preformattedCode?: boolean;
    strongDelimiter?: '__' | '**' | undefined;
  }

  interface Rule {
    filter: Filter;
    replacement?: ReplacementFunction | undefined;
  }

  interface Rules {
    add(key: Filter, rule: Rule): void;
    array: Rule[];

    blankRule: ReplacementFunction;
    defaultRule: ReplacementFunction;
    forEach(callback: (rule: Rule, index: number) => any): void;

    forNode(node: Node): Rule;
    keep(filter: Filter): void;
    keepReplacement: ReplacementFunction;
    options: Options;
    remove(filter: Filter): void;
  }

  type Plugin = (service: TurndownService) => void;
  type Node = HTMLElement | Document | DocumentFragment;

  type Filter = TagName | TagName[] | FilterFunction;
  type FilterFunction = (node: HTMLElement, options: Options) => boolean;

  type ReplacementFunction = (
    content: string,
    node: Node,
    options: Options,
  ) => string;

  type TagName = keyof HTMLElementTagNameMap;
}
/* End of copy from @types/turndown package */
