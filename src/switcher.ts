import type { Moment } from "moment";
import {
  type NLDatesPlugin,
  type NLDResult,
  setIcon,
  App,
  SuggestModal2,
} from "obsidian";
import type PeriodicNotesPlugin from "src";

import { FileOptionsSwitcher } from "./fileOptionsSwitcher";
import type { Granularity } from "./types";

interface DateNavigationItem {
  granularity: Granularity;
  nldResult: NLDResult;
  label: string;
}

const DEFAULT_INSTRUCTIONS = [
  { command: "↑↓", purpose: "to navigate" },
  { command: "↵", purpose: "to open" },
  { command: "ctrl ↵", purpose: "to open in a new pane" },
  { command: "esc", purpose: "to dismiss" },
];

export class NLDNavigator extends SuggestModal2<DateNavigationItem> {
  private nlDatesPlugin: NLDatesPlugin;
  private granularityLabel: HTMLElement;
  private mode: Granularity = "day";

  constructor(readonly app: App, readonly plugin: PeriodicNotesPlugin) {
    super(app);
    //     this.inputEl.parentElement.prepend(
    //       createDiv("periodic-notes-switcher-input-container", (inputContainer) => {
    //         inputContainer.appendChild(this.inputEl);
    //         this.granularityLabel = inputContainer.createDiv({
    //           cls: "mode-indicator",
    //           text: this.mode,
    //         });
    //       })
    //     );

    this.setInstructions(DEFAULT_INSTRUCTIONS);
    this.setPlaceholder("Type date to find related notes");

    this.nlDatesPlugin = app.plugins.getPlugin("nldates-obsidian") as NLDatesPlugin;

    this.scope.register(["Mod"], "Enter", (evt: KeyboardEvent) => {
      this.chooser.useSelectedItem(evt);
      return false;
    });

    //     this.scope.register([], "Tab", (evt: KeyboardEvent) => {
    //       evt.preventDefault();
    //       this.cycleGranularity();
    //     });

    this.scope.register([], "Tab", (evt: KeyboardEvent) => {
      evt.preventDefault();
      this.close();
      new FileOptionsSwitcher(this.app).open();
    });
  }

  /**
   * Return a list of suggested dates based on the parsed result
   * @param query string
   * @param parsedResult NLDResult
   * @returns Moment[]
   */
  getDaySuggestions(query: string, parsedResult: NLDResult) {
    const start = window.moment(parsedResult.moment);
    const dateArray: Moment[] = [];
    let end: Moment;

    if (query.includes("week")) {
      end = window.moment(start).endOf("week");
    } else if (query.includes("month")) {
      end = window.moment(start).endOf("month");
    } else {
      end = window.moment(start);
    }

    do {
      dateArray.push(window.moment(start.format("YYYY-MM-DD")));
      start.add(1, "day");
    } while (!start.isAfter(end, "day"));

    return dateArray;
  }

  //   cycleGranularity() {
  //     const granularities: IGranularity[] = ["day", "week", "month", "year"];
  //     const idx = granularities.indexOf(this.mode);
  //     this.setGranularity(granularities[(idx + 1) % granularities.length]);
  //   }

  setGranularity(granularity: Granularity) {
    this.mode = granularity;
    this.granularityLabel.setText(this.mode);
    this.chooser.setSuggestions(this.getSuggestions(this.inputEl.value));
  }

  private getDatePrefixedNotes(nldResult: NLDResult): DateNavigationItem[] {
    const zettelPrefix = nldResult.moment.format("YYYYMMDD");
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.basename.startsWith(zettelPrefix))
      .map((file) => ({
        dateUid: "",
        label: file.basename,
        nldResult,
        granularity: "day",
      }));
  }

  getSuggestions(query: string): DateNavigationItem[] {
    if (/\bweeks?\b/.test(query)) {
      this.setGranularity("week");
    } else if (/\bmonths?\b/.test(query)) {
      this.setGranularity("month");
    } else if (/\byears?\b/.test(query)) {
      this.setGranularity("year");
    }

    const dateInQuery = this.nlDatesPlugin.parseDate(query);
    if (dateInQuery.moment.isValid()) {
      return [
        {
          label: dateInQuery.moment.format("dddd, MMMM DD"),
          nldResult: dateInQuery,
          granularity: "day" as Granularity,
        },
        ...this.getDatePrefixedNotes(dateInQuery),
      ];
    }

    return this.getDateSuggestions(query);
  }

  getDateSuggestions(query: string): DateNavigationItem[] {
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
      ].filter((items) => items.label.toLowerCase().startsWith(query));
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
      ].filter((item) => item.label.toLowerCase().startsWith(query));
    }

    return [
      getSuggestion("Today", "day"),
      getSuggestion("Yesterday", "day"),
      getSuggestion("Tomorrow", "day"),
      getSuggestion("this week", "week"),
      getSuggestion("last week", "week"),
      getSuggestion("next week", "week"),
      getSuggestion("this month", "month"),
      getSuggestion("last month", "month"),
      getSuggestion("next month", "month"),
      getSuggestion("this year", "year"),
      getSuggestion("last year", "year"),
      getSuggestion("next year", "year"),
    ].filter((items) => items.label.toLowerCase().startsWith(query));
  }

  renderSuggestion(value: DateNavigationItem, el: HTMLElement) {
    const periodicNote = this.plugin.getPeriodicNote(
      value.granularity,
      value.nldResult.moment
    );

    if (!periodicNote) {
      el.setText(value.label);
      el.createEl("span", { cls: "suggestion-flair", prepend: true }, (el) => {
        setIcon(el, "add-note-glyph", 16);
      });
      el.createEl("div", {
        cls: "suggestion-note",
        text: value.nldResult.formattedString,
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
