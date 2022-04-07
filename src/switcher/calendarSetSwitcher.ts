import { App, type FuzzyMatch, FuzzySuggestModal } from "obsidian";
import PeriodicNotesPlugin from "src/main";
import type { CalendarSet } from "src/types";

export class CalendarSetSuggestModal extends FuzzySuggestModal<CalendarSet> {
  constructor(app: App, readonly plugin: PeriodicNotesPlugin) {
    super(app);
  }

  getItemText(item: CalendarSet): string {
    return item.toString();
  }

  getItems(): CalendarSet[] {
    return this.plugin.calendarSetManager.getCalendarSets();
  }

  renderSuggestion(calendarSet: FuzzyMatch<CalendarSet>, el: HTMLElement) {
    el.createDiv({ text: calendarSet.item.id });
  }

  async onChooseItem(item: CalendarSet, _evt: MouseEvent | KeyboardEvent): Promise<void> {
    this.plugin.calendarSetManager.setActiveSet(item.id);
  }
}
