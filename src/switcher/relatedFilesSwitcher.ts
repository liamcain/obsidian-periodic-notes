import { setIcon, App, SuggestModal, TFile } from "obsidian";
import { DEFAULT_FORMAT } from "src/constants";
import type PeriodicNotesPlugin from "src/main";

import { NLDNavigator, type DateNavigationItem } from "./switcher";

const DEFAULT_INSTRUCTIONS = [
  { command: "*", purpose: "show all notes within this period" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

export class RelatedFilesSwitcher extends SuggestModal<DateNavigationItem> {
  private inputLabel: HTMLElement;
  private includeFinerGranularities: boolean;

  constructor(
    readonly app: App,
    readonly plugin: PeriodicNotesPlugin,
    readonly selectedItem: DateNavigationItem,
    readonly oldQuery: string
  ) {
    super(app);

    this.includeFinerGranularities = false;
    this.setInstructions(DEFAULT_INSTRUCTIONS);
    this.setPlaceholder(`Search notes related to ${selectedItem.label}...`);

    this.inputEl.parentElement?.prepend(
      createDiv("periodic-notes-switcher-input-container", (inputContainer) => {
        inputContainer.appendChild(this.inputEl);
        this.inputLabel = inputContainer.createDiv({
          cls: "related-notes-mode-indicator",
          text: "Expanded",
        });
        this.inputLabel.toggleVisibility(false);
      })
    );

    this.scope.register([], "Tab", (evt: KeyboardEvent) => {
      evt.preventDefault();
      this.close();
      const nav = new NLDNavigator(this.app, this.plugin);
      nav.open();

      nav.inputEl.value = oldQuery;
      nav.inputEl.dispatchEvent(new Event("input"));
    });

    this.scope.register(["Shift"], "8", (evt: KeyboardEvent) => {
      evt.preventDefault();
      this.includeFinerGranularities = !this.includeFinerGranularities;
      this.inputLabel.style.visibility = this.includeFinerGranularities
        ? "visible"
        : "hidden";
      this.inputEl.dispatchEvent(new Event("input"));
    });
  }

  private getDatePrefixedNotes(
    item: DateNavigationItem,
    query: string
  ): DateNavigationItem[] {
    return this.plugin
      .getPeriodicNotes(item.granularity, item.date, this.includeFinerGranularities)
      .filter((e) => e.matchData.exact === false)
      .filter((e) => e.filePath.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .map((e) => ({
        label: e.filePath,
        date: e.date,
        granularity: e.granularity,
        matchData: e.matchData,
      }));
  }

  getSuggestions(query: string): DateNavigationItem[] {
    return this.getDatePrefixedNotes(this.selectedItem, query);
  }

  renderSuggestion(value: DateNavigationItem, el: HTMLElement) {
    el.setText(value.label);
    el.createEl("div", {
      cls: "suggestion-note",
      text: value.date.format(DEFAULT_FORMAT[value.granularity]),
    });
    el.createEl("span", { cls: "suggestion-flair", prepend: true }, (el) => {
      setIcon(el, `calendar-${value.granularity}`, 16);
    });
  }

  async onChooseSuggestion(item: DateNavigationItem, evt: MouseEvent | KeyboardEvent) {
    const file = this.app.vault.getAbstractFileByPath(item.label);
    if (file && file instanceof TFile) {
      const inNewSplit = evt.shiftKey;
      const leaf = inNewSplit
        ? this.app.workspace.splitActiveLeaf()
        : this.app.workspace.getUnpinnedLeaf();
      await leaf.openFile(file, { active: true });
    }
  }
}
