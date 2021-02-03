import { IPeriodicNoteSettings } from "obsidian-daily-notes-interface";

export const wrapAround = (value: number, size: number): number => {
  return ((value % size) + size) % size;
};

export function orderedValues<T>(unordered: Record<string, T>): T[] {
  return Object.keys(unordered)
    .sort()
    .reduce((acc, key) => {
      acc.push(unordered[key]);
      return acc;
    }, []);
}

export function appHasCalendarPluginLoaded(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(<any>window).app.plugins.getPlugin("calendar");
}

export function getLegacyDailyNoteSettings(): IPeriodicNoteSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { internalPlugins } = <any>window.app;
  return internalPlugins.getPluginById("daily-notes")?.instance?.options;
}

export function getLegacyWeeklyNoteSettings(): IPeriodicNoteSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { plugins } = <any>window.app;

  const calendarSettings = plugins.getPlugin("calendar")?.options || {};

  return {
    format: calendarSettings.weeklyNoteFormat,
    folder: calendarSettings.weeklyNoteFolder?.trim(),
    template: calendarSettings.weeklyNoteTemplate?.trim(),
  };
}

export function hasWeeklyNoteSettingsFromCalendar(): boolean {
  if (!appHasCalendarPluginLoaded()) {
    return false;
  }

  const options =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>window.app).plugins.getPlugin("calendar")?.options || {};
  return !!(
    options.weeklyNoteFormat ||
    options.weeklyNoteFolder ||
    options.weeklyNoteTemplate
  );
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
