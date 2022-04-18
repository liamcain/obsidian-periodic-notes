import "obsidian";
import type { ILocaleOverride, IWeekStartOption } from "./settings";

declare module "obsidian" {
  interface IWeeklyNoteOptions {
    weeklyNoteFormat: string;
    weeklyNoteFolder: string;
    weeklyNoteTemplate: string;
  }

  export class CalendarPlugin extends Plugin {
    options: IWeeklyNoteOptions;
  }

  export interface Workspace extends Events {
    on(
      name: "periodic-notes:settings-updated",
      callback: () => void,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ctx?: any
    ): EventRef;
    on(
      name: "periodic-notes:resolve",
      callback: () => void,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ctx?: any
    ): EventRef;
  }

  interface CommandManager {
    removeCommand(commandName: string): void;
  }

  interface MarkdownView {
    onMarkdownFold(): void;
  }

  interface MarkdownSubView {
    applyFoldInfo(foldInfo: FoldInfo): void;
    getFoldInfo(): FoldInfo | null;
  }

  interface Editor {
    cm: CodeMirror.Editor;
  }

  interface EditorSuggestManager {
    suggests: EditorSuggest<unknown>[];
  }

  interface VaultSettings {
    legacyEditor: boolean;
    foldHeading: boolean;
    foldIndent: boolean;
    rightToLeft: boolean;
    readableLineLength: boolean;
    tabSize: number;
    showFrontmatter: boolean;

    // XXX: Added from Periodic Notes
    localeOverride: ILocaleOverride;
    weekStart: IWeekStartOption;
  }

  interface FoldPosition {
    from: number;
    to: number;
  }

  interface FoldInfo {
    folds: FoldPosition[];
    lines: number;
  }

  export interface FoldManager {
    load(file: TFile): Promise<FoldInfo>;
    save(file: TFile, foldInfo: FoldInfo): Promise<void>;
  }

  interface Chooser<T> {
    useSelectedItem(evt: KeyboardEvent): void;
    setSuggestions(suggestions: T[]);
  }

  interface Vault {
    config: Record<string, unknown>;
    getConfig<T extends keyof VaultSettings>(setting: T): VaultSettings[T];
    setConfig<T extends keyof VaultSettings>(setting: T, value: any): void;
  }

  export interface PluginInstance {
    id: string;
  }

  export interface DailyNotesSettings {
    autorun?: boolean;
    format?: string;
    folder?: string;
    template?: string;
  }

  class DailyNotesPlugin implements PluginInstance {
    options?: DailyNotesSettings;
  }

  export interface ViewRegistry {
    viewByType: Record<string, (leaf: WorkspaceLeaf) => unknown>;
    isExtensionRegistered(extension: string): boolean;
  }

  export interface App {
    commands: CommandManager;
    foldManager: FoldManager;
    internalPlugins: InternalPlugins;
    plugins: CommunityPluginManager;
    viewRegistry: ViewRegistry;
  }

  type PluginId = "nldates-obsidian" | "calendar" | string;

  export interface CommunityPluginManager {
    getPlugin(id: PluginId): Plugin;
  }

  export interface InstalledPlugin {
    disable: (onUserDisable: boolean) => void;
    enabled: boolean;
    instance: PluginInstance;
  }

  export interface InternalPlugins {
    plugins: Record<string, InstalledPlugin>;
    getPluginById(id: string): InstalledPlugin;
  }

  interface NLDResult {
    formattedString: string;
    date: Date;
    moment: Moment;
  }

  interface NLDatesPlugin extends Plugin {
    parseDate(dateStr: string): NLDResult;
  }
}
