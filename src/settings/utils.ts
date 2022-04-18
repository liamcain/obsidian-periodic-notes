import cloneDeep from "lodash/cloneDeep";
import { App, DailyNotesPlugin, type DailyNotesSettings } from "obsidian";
import {
  granularities,
  type CalendarSet,
  type Granularity,
  type PeriodicConfig,
} from "src/types";
import { get, type Updater, type Writable } from "svelte/store";

import { DEFAULT_PERIODIC_CONFIG, type ISettings } from ".";

const defaultPeriodicSettings = granularities.reduce((acc, g) => {
  acc[g] = { ...DEFAULT_PERIODIC_CONFIG };
  return acc;
}, {} as Record<Granularity, PeriodicConfig>);

type DeleteFunc = (calendarSetId: string) => Updater<ISettings>;
export const deleteCalendarSet: DeleteFunc = (calendarSetId: string) => {
  return (settings: ISettings) => {
    const calendarSet = settings.calendarSets.find((c) => c.id === calendarSetId);
    if (calendarSet) {
      settings.calendarSets.remove(calendarSet);
    }

    if (calendarSetId === settings.activeCalendarSet) {
      const fallbackCalendarSet = settings.calendarSets[0].id;
      settings.activeCalendarSet = fallbackCalendarSet;
    }

    return settings;
  };
};

type CreateFunc = (
  calendarSetId: string,
  refSettings?: Partial<CalendarSet>
) => Updater<ISettings>;
export const createNewCalendarSet: CreateFunc = (
  id: string,
  refSettings?: Partial<CalendarSet>
) => {
  return (settings: ISettings) => {
    settings.calendarSets.push({
      ...cloneDeep(defaultPeriodicSettings),
      ...cloneDeep(refSettings),
      id,
      ctime: window.moment().format(),
    });
    return settings;
  };
};

type UpdateActiveFunc = (
  calendarSetId: string,
  refSettings?: Partial<CalendarSet>
) => Updater<ISettings>;
export const setActiveSet: UpdateActiveFunc = (id: string) => {
  return (settings: ISettings) => {
    settings.activeCalendarSet = id;
    return settings;
  };
};

export const clearStartupNote: Updater<ISettings> = (settings: ISettings) => {
  for (const calendarSet of settings.calendarSets) {
    for (const granularity of granularities) {
      const config = calendarSet[granularity];
      if (config && config.openAtStartup) {
        config.openAtStartup = false;
      }
    }
  }
  return settings;
};

interface StartupNoteConfig {
  calendarSet: string;
  granularity: Granularity;
}

type FindStartupNoteConfigFunc = (
  settings: Writable<ISettings>
) => StartupNoteConfig | null;
export const findStartupNoteConfig: FindStartupNoteConfigFunc = (
  settings: Writable<ISettings>
) => {
  const calendarSets = get(settings).calendarSets;
  for (const calendarSet of calendarSets) {
    for (const granularity of granularities) {
      const config = calendarSet[granularity];
      if (config && config.openAtStartup) {
        return {
          calendarSet: calendarSet.id,
          granularity,
        };
      }
    }
  }

  return null;
};

export const wrapAround = (value: number, size: number): number => {
  return ((value % size) + size) % size;
};

export function isDailyNotesPluginEnabled(app: App): boolean {
  return app.internalPlugins.getPluginById("daily-notes").enabled;
}

function getDailyNotesPlugin(app: App): DailyNotesPlugin | null {
  const installedPlugin = app.internalPlugins.getPluginById("daily-notes");
  if (installedPlugin) {
    return installedPlugin.instance as DailyNotesPlugin;
  }
  return null;
}

export function hasLegacyDailyNoteSettings(app: App): boolean {
  const options = getDailyNotesPlugin(app)?.options || {};
  return !!(options.format || options.folder || options.template);
}

export function getLegacyDailyNoteSettings(app: App): DailyNotesSettings {
  const dailyNotesInstalledPlugin = app.internalPlugins.plugins["daily-notes"];
  if (!dailyNotesInstalledPlugin) {
    return {
      folder: "",
      template: "",
      format: "",
    };
  }

  const options = {
    format: "",
    folder: "",
    template: "",
    ...getDailyNotesPlugin(app)?.options,
  };
  return {
    format: options.format,
    folder: options.folder?.trim(),
    template: options.template?.trim(),
  };
}

export function disableDailyNotesPlugin(app: App): void {
  app.internalPlugins.getPluginById("daily-notes").disable(true);
}

export function getLocaleOptions() {
  const sysLocale = navigator.language?.toLowerCase();
  return [
    { label: `Same as system (${sysLocale})`, value: "system-default" },
    ...window.moment.locales().map((locale) => ({
      label: locale,
      value: locale,
    })),
  ];
}

export function getWeekStartOptions() {
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const localizedWeekdays = window.moment.weekdays();
  const localeWeekStartNum = window._bundledLocaleWeekSpec.dow;
  const localeWeekStart = localizedWeekdays[localeWeekStartNum];
  return [
    { label: `Locale default (${localeWeekStart})`, value: "locale" },
    ...localizedWeekdays.map((day, i) => ({ value: weekdays[i], label: day })),
  ];
}
