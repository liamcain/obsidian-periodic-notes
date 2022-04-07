import type { Moment } from "moment";
import { type NLDatesPlugin, setIcon, App, SuggestModal } from "obsidian";
import type { MatchType } from "src/cache";
import { DEFAULT_FORMAT } from "src/constants";
import type PeriodicNotesPlugin from "src/main";
import { getRelativeDate, isIsoFormat, join } from "src/utils";

import type { Granularity } from "../types";
import { RelatedFilesSwitcher } from "./relatedFilesSwitcher";

export interface DateNavigationItem {
  granularity: Granularity;
  date: Moment;
  label: string;
  matchData?: {
    exact: boolean;
    matchType: MatchType;
  };
}

const DEFAULT_INSTRUCTIONS = [
  { command: "⇥", purpose: "show related files" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

export class NLDNavigator extends SuggestModal<DateNavigationItem> {
  private nlDatesPlugin: NLDatesPlugin;

  constructor(readonly app: App, readonly plugin: PeriodicNotesPlugin) {
    super(app);

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
  private getPeriodicNotesFromQuery(query: string, date: Moment) {
    let granularity: Granularity = "day";

    const granularityExp = /\b(week|month|quarter|year)s?\b/.exec(query);
    if (granularityExp) {
      granularity = granularityExp[1] as Granularity;
    }

    let label = "";
    if (granularity === "week") {
      const format = this.plugin.calendarSetManager.getFormat("week");
      const weekNumber = isIsoFormat(format) ? "WW" : "ww";
      label = date.format(`GGGG [Week] ${weekNumber}`);
    } else if (granularity === "day") {
      label = `${getRelativeDate(granularity, date)}, ${date.format("MMMM DD")}`;
    } else {
      label = query;
    }

    const suggestions = [
      {
        label,
        date,
        granularity,
      },
    ];

    if (granularity !== "day") {
      suggestions.push({
        label: `${getRelativeDate(granularity, date)}, ${date.format("MMMM DD")}`,
        date,
        granularity: "day",
      });
    }

    return suggestions;
  }

  getSuggestions(query: string): DateNavigationItem[] {
    const dateInQuery = this.nlDatesPlugin.parseDate(query);
    if (dateInQuery.moment.isValid()) {
      return this.getPeriodicNotesFromQuery(query, dateInQuery.moment);
    }

    return this.getDateSuggestions(query);
  }

  getDateSuggestions(query: string): DateNavigationItem[] {
    const activeGranularities = this.plugin.calendarSetManager.getActiveGranularities();
    const getSuggestion = (dateStr: string, granularity: Granularity) => {
      const date = this.nlDatesPlugin.parseDate(dateStr);
      return {
        granularity,
        date: date.moment,
        label: dateStr,
      };
    };

    const relativeExpr = query.match(/(next|last|this)/i);
    if (relativeExpr) {
      const reference = relativeExpr[1];
      return [
        getSuggestion(`${reference} week`, "week"),
        getSuggestion(`${reference} month`, "month"),
        // getSuggestion(`${reference} quarter`, "quarter"),
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
        getSuggestion(`in ${timeDelta} weeks`, "week"),
        getSuggestion(`in ${timeDelta} months`, "month"),
        getSuggestion(`in ${timeDelta} years`, "day"),
        getSuggestion(`in ${timeDelta} years`, "year"),
        getSuggestion(`${timeDelta} days ago`, "day"),
        getSuggestion(`${timeDelta} weeks ago`, "day"),
        getSuggestion(`${timeDelta} weeks ago`, "week"),
        getSuggestion(`${timeDelta} months ago`, "month"),
        getSuggestion(`${timeDelta} years ago`, "day"),
        getSuggestion(`${timeDelta} years ago`, "year"),
      ]
        .filter((items) => activeGranularities.includes(items.granularity))
        .filter((item) => item.label.toLowerCase().startsWith(query));
    }

    return [
      getSuggestion("today", "day"),
      getSuggestion("yesterday", "day"),
      getSuggestion("tomorrow", "day"),
      getSuggestion("this week", "week"),
      getSuggestion("last week", "week"),
      getSuggestion("next week", "week"),
      getSuggestion("this month", "month"),
      getSuggestion("last month", "month"),
      getSuggestion("next month", "month"),
      // TODO - requires adding new parser to NLDates
      // getSuggestion("this quarter", "quarter"),
      // getSuggestion("last quarter", "quarter"),
      // getSuggestion("next quarter", "quarter"),
      getSuggestion("this year", "year"),
      getSuggestion("last year", "year"),
      getSuggestion("next year", "year"),
    ]
      .filter((items) => activeGranularities.includes(items.granularity))
      .filter((items) => items.label.toLowerCase().startsWith(query));
  }

  renderSuggestion(value: DateNavigationItem, el: HTMLElement) {
    const numRelatedNotes = this.plugin
      .getPeriodicNotes(value.granularity, value.date)
      .filter((e) => e.matchData.exact === false).length;

    const periodicNote = this.plugin.getPeriodicNote(value.granularity, value.date);

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
        text: join(folder, value.date.format(format)),
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
    this.plugin.openPeriodicNote(item.granularity, item.date, false);
  }
}
