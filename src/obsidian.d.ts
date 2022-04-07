import "obsidian";

declare module "obsidian" {
  interface IWeeklyNoteOptions {
    weeklyNoteFormat: string;
    weeklyNoteFolder: string;
    weeklyNoteTemplate: string;
  }

  export class CalendarPlugin extends Plugin {
    options: IWeeklyNoteOptions;
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

  interface Chooser {
    useSelectedItem(evt: KeyboardEvent): void;
  }

  export class SuggestModal<T> extends Modal implements ISuggestOwner<T> {
    chooser: Chooser;
  }

  interface Vault {
    config: Record<string, unknown>;
    getConfig<T extends keyof VaultSettings>(setting: T): VaultSettings[T];
  }

  export interface PluginInstance {
    id: string;
  }

  interface DailyNotesSettings {
    format?: string;
    folder?: string;
    template?: string;
  }

  class DailyNotesPlugin implements PluginInstance {
    options: DailyNotesSettings;
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

  export interface CommunityPluginManager {
    getPlugin(id: string): Plugin;
  }

  export interface InstalledPlugin {
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
