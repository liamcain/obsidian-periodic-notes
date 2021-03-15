import type { Plugin } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  IPeriodicNoteSettings,
} from "obsidian-daily-notes-interface";

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

interface IWeeklyNoteOptions {
  weeklyNoteFormat: string;
  weeklyNoteFolder: string;
  weeklyNoteTemplate: string;
}

interface ICalendarPlugin extends Plugin {
  options: IWeeklyNoteOptions;
}

interface IDailyNotesPlugin extends Plugin {
  options: IPeriodicNoteSettings;
}

function getCalendarPlugin(): ICalendarPlugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (<any>window).app.plugins.getPlugin("calendar");
}

function getDailyNotesPlugin(): IDailyNotesPlugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { internalPlugins } = <any>window.app;
  return internalPlugins.getPluginById("daily-notes")?.instance;
}

export function hasCoreDailyNotesPluginEnabled(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { internalPlugins } = <any>window.app;
  return internalPlugins.getPluginById("daily-notes")?._loaded;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function hasLegacyDailyNoteSettings(): boolean {
  if (!appHasDailyNotesPluginLoaded()) {
    return false;
  }
  const options = getDailyNotesPlugin()?.options;
  return !!(options.format || options.folder || options.template);
}

export function getLegacyDailyNoteSettings(): IPeriodicNoteSettings {
  const options =
    getDailyNotesPlugin().options || ({} as IPeriodicNoteSettings);
  return {
    format: options.format,
    folder: options.folder?.trim(),
    template: options.template?.trim(),
  };
}

export function hasLegacyWeeklyNoteSettings(): boolean {
  const calendarPlugin = getCalendarPlugin();
  if (!calendarPlugin) {
    return false;
  }

  const options = calendarPlugin.options || ({} as IWeeklyNoteOptions);
  return !!(
    options.weeklyNoteFormat ||
    options.weeklyNoteFolder ||
    options.weeklyNoteTemplate
  );
}

export function getLegacyWeeklyNoteSettings(): IPeriodicNoteSettings {
  const options = getCalendarPlugin().options || ({} as IWeeklyNoteOptions);
  return {
    format: options.weeklyNoteFormat || "",
    folder: options.weeklyNoteFolder?.trim() || "",
    template: options.weeklyNoteTemplate?.trim() || "",
  };
}
