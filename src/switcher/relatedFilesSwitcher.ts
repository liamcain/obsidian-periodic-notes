import { setIcon, App, SuggestModal } from "obsidian";
import { DEFAULT_FORMAT } from "src/constants";
import type PeriodicNotesPlugin from "src/main";
import { join } from "src/utils";

import { NLDNavigator, type DateNavigationItem } from "./switcher";

const DEFAULT_INSTRUCTIONS = [
  { command: "↑↓", purpose: "to navigate" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

export class RelatedFilesSwitcher extends SuggestModal<DateNavigationItem> {
  constructor(
    readonly app: App,
    readonly plugin: PeriodicNotesPlugin,
    readonly selectedItem: DateNavigationItem,
    readonly oldQuery: string
  ) {
    super(app);

    this.setInstructions(DEFAULT_INSTRUCTIONS);
    this.setPlaceholder(`Search notes related to ${selectedItem.label}...`);

    this.scope.register([], "Tab", (evt: KeyboardEvent) => {
      evt.preventDefault();
      this.close();
      const nav = new NLDNavigator(this.app, this.plugin);
      nav.open();

      nav.inputEl.value = oldQuery;
      nav.inputEl.dispatchEvent(new Event("input"));
    });
  }

  private getDatePrefixedNotes(
    item: DateNavigationItem,
    query: string
  ): DateNavigationItem[] {
    return this.plugin
      .getPeriodicNotes(item.granularity, item.nldResult.moment)
      .filter((e) => e.matchData.exact === false)
      .filter((e) => e.filePath.includes(query))
      .map((e) => ({
        label: e.filePath,
        nldResult: item.nldResult, // XXX Fix this
        granularity: e.granularity,
        matchData: e.matchData,
      }));
  }

  getSuggestions(query: string): DateNavigationItem[] {
    return this.getDatePrefixedNotes(this.selectedItem, query);
  }

  renderSuggestion(value: DateNavigationItem, el: HTMLElement) {
    if (value.matchData?.matchType === "date-prefixed") {
      el.setText(value.label);
      el.createEl("div", {
        cls: "suggestion-note",
        text: "Related note",
      });
      return;
    }

    // XXX: we shouldn't be looking this up
    const periodicNote = this.plugin.getPeriodicNote(
      value.granularity,
      value.nldResult.moment
    );

    if (!periodicNote) {
      const config = this.plugin.calendarSetManager.getActiveConfig(value.granularity);
      const format = config.format || DEFAULT_FORMAT[value.granularity];
      const folder = config.folder || "/";
      el.setText(value.label);
      el.createEl("span", { cls: "suggestion-flair", prepend: true }, (el) => {
        setIcon(el, "add-note-glyph", 16);
      });
      el.createEl("div", {
        cls: "suggestion-note",
        text: join(folder, value.nldResult.moment.format(format)),
      });
      return;
    }

    const curPath = this.app.workspace.getActiveFile()?.path ?? "";
    const filePath = this.app.metadataCache.fileToLinktext(periodicNote, curPath, true);

    el.setText(value.label);
    el.createEl("div", { cls: "suggestion-note", text: filePath });
    el.createEl("span", { cls: "suggestion-flair", prepend: true }, (el) => {
      setIcon(el, `calendar-${value.granularity}`, 16);
    });
  }

  async onChooseSuggestion(item: DateNavigationItem, _evt: MouseEvent | KeyboardEvent) {
    this.plugin.openPeriodicNote(item.granularity, item.nldResult.moment, false);
  }
}
