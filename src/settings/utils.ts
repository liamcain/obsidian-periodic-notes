import cloneDeep from "lodash/cloneDeep";
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
