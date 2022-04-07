import { App, type NLDatesPlugin, Scope, SuggestModal, TFile } from "obsidian";

interface FileCommandItem {
  label: string;
}

const DEFAULT_INSTRUCTIONS = [
  { command: "↑↓", purpose: "to navigate" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

interface FileOptionsItem {
  label: string;
}

export class FileOptionsSwitcher extends SuggestModal<FileOptionsItem> {
  nlDatesPlugin: NLDatesPlugin;

  granularityLabel: HTMLElement;
  dailyNotes: Record<string, TFile>;
  scope: Scope;

  constructor(app: App) {
    super(app);

    this.setInstructions(DEFAULT_INSTRUCTIONS);
    this.setPlaceholder("Type date to find daily note");

    this.nlDatesPlugin = app.plugins.getPlugin("nldates-obsidian") as NLDatesPlugin;
  }

  getSuggestions(query: string): FileCommandItem[] {
    return [
      {
        label: "Delete file",
      },
    ].filter((item) => item.label.contains(query));
  }

  renderSuggestion(value: FileCommandItem, el: HTMLElement) {
    el.setText(value.label);
  }

  async onChooseSuggestion(_item: FileCommandItem, _evt: MouseEvent | KeyboardEvent) {
    // run command
  }
}
