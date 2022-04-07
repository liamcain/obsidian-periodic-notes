import capitalize from "lodash/capitalize";
import { type NLDatesPlugin, type NLDResult, setIcon, App, SuggestModal } from "obsidian";
import type { MatchType } from "src/cache";
import { DEFAULT_FORMAT } from "src/constants";
import type PeriodicNotesPlugin from "src/main";
import { getRelativeDate, isIsoFormat, join } from "src/utils";

import type { Granularity } from "../types";
import { RelatedFilesSwitcher } from "./relatedFilesSwitcher";

export interface DateNavigationItem {
  granularity: Granularity;
  nldResult: NLDResult;
  label: string;
  matchData?: {
    exact: boolean;
    matchType: MatchType;
  };
}

const DEFAULT_INSTRUCTIONS = [
  { command: "↑↓", purpose: "to navigate" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

export class NLDNavigator extends SuggestModal<DateNavigationItem> {
  private nlDatesPlugin: NLDatesPlugin;

  constructor(readonly app: App, readonly plugin: PeriodicNotesPlugin) {
    super(app);
    // this.inputEl.parentElement.prepend(
    //   createDiv("periodic-notes-switcher-input-container", (inputContainer) => {
    //     inputContainer.appendChild(this.inputEl);
    //     this.granularityLabel = inputContainer.createDiv({
    //       cls: "mode-indicator",
    //       text: this.mode,
    //     });
    //   })
    // );

    this.setInstructions(DEFAULT_INSTRUCTIONS);
    this.setPlaceholder("Type date to find related notes");

    this.nlDatesPlugin = app.plugins.getPlugin("nldates-obsidian") as NLDatesPlugin;

    this.scope.register([], "Tab", (evt: KeyboardEvent) => {
      evt.preventDefault();
      this.close();
      new RelatedFilesSwitcher(
        this.app,
        this.plugin,
        this.getSelectedItem(),
        this.inputEl.value
      ).open();
    });
  }

  private getSelectedItem(): DateNavigationItem {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return (this as any).chooser.values[(this as any).chooser.selectedItem];
  }

  /** XXX: this is pretty messy currently. Not sure if I like the format yet */
  private getPeriodicNotesFromQuery(query: string, nldResult: NLDResult) {
    let granularity: Granularity = "day";

    const granularityExp = /\b(week|month|quarter|year)s?\b/.exec(query);
    if (granularityExp) {
      granularity = granularityExp[1] as Granularity;
    }

    let label = "";
    if (granularity === "week") {
      const format = this.plugin.calendarSetManager.getFormat("week");
      const weekNumber = isIsoFormat(format) ? "WW" : "ww";
      label = nldResult.moment.format(`GGGG [Week] ${weekNumber}`);
    } else if (granularity === "day") {
      label = `${getRelativeDate(
        granularity,
        nldResult.moment
      )}, ${nldResult.moment.format("MMMM DD")}`;
    } else {
      label = capitalize(query);
    }

    const suggestions = [
      {
        label,
        nldResult,
        granularity,
      },
    ];

    if (granularity !== "day") {
      suggestions.push({
        label: `${getRelativeDate(
          granularity,
          nldResult.moment
        )}, ${nldResult.moment.format("MMMM DD")}`,
        nldResult,
        granularity: "day",
      });
    }

    return suggestions;
  }

  getSuggestions(query: string): DateNavigationItem[] {
    const dateInQuery = this.nlDatesPlugin.parseDate(query);
    if (dateInQuery.moment.isValid()) {
      return this.getPeriodicNotesFromQuery(query, dateInQuery);
    }

    return this.getDateSuggestions(query);
  }

  getDateSuggestions(query: string): DateNavigationItem[] {
    const activeGranularities = this.plugin.calendarSetManager.getActiveGranularities();
    const getSuggestion = (dateStr: string, granularity: Granularity) => {
      const date = this.nlDatesPlugin.parseDate(dateStr);
      return {
        granularity,
        nldResult: date,
        label: dateStr,
      };
    };

    const relativeExpr = query.match(/(next|last|this)/i);
    if (relativeExpr) {
      const reference = relativeExpr[1];
      return [
        getSuggestion(`${reference} week`, "week"),
        getSuggestion(`${reference} month`, "month"),
        getSuggestion(`${reference} year`, "year"),
        getSuggestion(`${reference} Sunday`, "day"),
        getSuggestion(`${reference} Monday`, "day"),
        getSuggestion(`${reference} Tuesday`, "day"),
        getSuggestion(`${reference} Wednesday`, "day"),
        getSuggestion(`${reference} Thursday`, "day"),
        getSuggestion(`${reference} Friday`, "day"),
        getSuggestion(`${reference} Saturday`, "day"),
      ]
        .filter((items) => activeGranularities.includes(items.granularity))
        .filter((items) => items.label.toLowerCase().startsWith(query));
    }

    const relativeDate = query.match(/^in ([+-]?\d+)/i) || query.match(/^([+-]?\d+)/i);
    if (relativeDate) {
      const timeDelta = relativeDate[1];
      return [
        getSuggestion(`in ${timeDelta} days`, "day"),
        getSuggestion(`in ${timeDelta} weeks`, "day"),
        getSuggestion(`in ${timeDelta} months`, "day"),
        getSuggestion(`${timeDelta} days ago`, "day"),
        getSuggestion(`${timeDelta} weeks ago`, "day"),
        getSuggestion(`${timeDelta} months ago`, "month"),
      ]
        .filter((items) => activeGranularities.includes(items.granularity))
        .filter((item) => item.label.toLowerCase().startsWith(query));
    }

    return [
      getSuggestion("Today", "day"),
      getSuggestion("Yesterday", "day"),
      getSuggestion("Tomorrow", "day"),
      getSuggestion("This week", "week"),
      getSuggestion("Last week", "week"),
      getSuggestion("Next week", "week"),
      getSuggestion("This month", "month"),
      getSuggestion("Last month", "month"),
      getSuggestion("Next month", "month"),
      getSuggestion("This year", "year"),
      getSuggestion("Last year", "year"),
      getSuggestion("Next year", "year"),
    ]
      .filter((items) => activeGranularities.includes(items.granularity))
      .filter((items) => items.label.toLowerCase().startsWith(query));
  }

  renderSuggestion(value: DateNavigationItem, el: HTMLElement) {
    const numRelatedNotes = this.plugin
      .getPeriodicNotes(value.granularity, value.nldResult.moment)
      .filter((e) => e.matchData.exact === false).length;

    const periodicNote = this.plugin.getPeriodicNote(
      value.granularity,
      value.nldResult.moment
    );
    console.log(
      "periodic note for value",
      value.label,
      periodicNote,
      this.plugin.calendarSetManager.getActiveSet()
    );

    if (!periodicNote) {
      const config = this.plugin.calendarSetManager.getActiveConfig(value.granularity);
      const format = config.format || DEFAULT_FORMAT[value.granularity];
      const folder = config.folder || "/";
      el.setText(value.label);
      el.createEl("span", { cls: "suggestion-flair", prepend: true }, (el) => {
        setIcon(el, "add-note-glyph", 16);
      });
      if (numRelatedNotes > 0) {
        el.createEl("span", { cls: "suggestion-badge", text: `+${numRelatedNotes}` });
      }
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
    if (numRelatedNotes > 0) {
      el.createEl("span", { cls: "suggestion-badge", text: `+${numRelatedNotes}` });
    }
  }

  async onChooseSuggestion(item: DateNavigationItem, _evt: MouseEvent | KeyboardEvent) {
    this.plugin.openPeriodicNote(item.granularity, item.nldResult.moment, false);
  }
}
