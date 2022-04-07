import type PeriodicNotesPlugin from "src";
import { writable, type Readable } from "svelte/store";

import { DEFAULT_FORMAT } from "./constants";
import { DEFAULT_PERIODIC_CONFIG } from "./settings";
import {
  granularities,
  type CalendarSet,
  type Granularity,
  type PeriodicConfig,
} from "./types";

interface IPerioditySettings {
  enabled: boolean;
  folder?: string;
  format?: string;
  template?: string;
}

interface ILegacySettings {
  showGettingStartedBanner: boolean;
  hasMigratedDailyNoteSettings: boolean;
  hasMigratedWeeklyNoteSettings: boolean;

  daily: IPerioditySettings;
  weekly: IPerioditySettings;
  monthly: IPerioditySettings;
  quarterly: IPerioditySettings;
  yearly: IPerioditySettings;
}

function isLegacySettings(settings: unknown): settings is ILegacySettings {
  const maybeLegacySettings = settings as ILegacySettings;
  return !!(
    maybeLegacySettings.daily ||
    maybeLegacySettings.weekly ||
    maybeLegacySettings.monthly ||
    maybeLegacySettings.yearly ||
    maybeLegacySettings.quarterly
  );
}

function migrateLegacySettingsToCalendarSet(settings: ILegacySettings): CalendarSet {
  const migrateConfig = (settings: ILegacySettings["daily"]) => {
    return {
      enabled: settings.enabled,
      format: settings.format || "",
      folder: settings.folder || "",
      templatePath: settings.template,
    };
  };

  return {
    id: DEFAULT_CALENDARSET_ID,
    ctime: window.moment().format(),
    day: migrateConfig(settings.daily),
    week: migrateConfig(settings.weekly),
    month: migrateConfig(settings.monthly),
    quarter: migrateConfig(settings.quarterly),
    year: migrateConfig(settings.yearly),
  };
}

const defaultPeriodicSettings = granularities.reduce((acc, g) => {
  acc[g] = DEFAULT_PERIODIC_CONFIG;
  return acc;
}, {} as Record<Granularity, PeriodicConfig>);

const DEFAULT_CALENDARSET_ID = "Default";

function createWritableConfig(config: PeriodicConfig | undefined) {
  const { subscribe, set, update } = writable(config);
  return {
    subscribe,
    set,
    updateConfig: (newConfig: Partial<PeriodicConfig>) =>
      update((c) => ({ ...c, ...newConfig })),
  };
}

export default class CalendarSetManager {
  activeSet: string;

  constructor(readonly plugin: PeriodicNotesPlugin) {
    this.activeSet = DEFAULT_CALENDARSET_ID;
  }

  public createNewCalendarSet(id: string, settings?: Partial<CalendarSet>): CalendarSet {
    const calendarSet = {
      ...defaultPeriodicSettings,
      ...settings,
      id,
      ctime: window.moment().format(),
    };

    this.plugin.updateSettings((s) => ({
      calendarSets: [...s.calendarSets, calendarSet],
    }));

    return calendarSet;
  }

  public getFormat(granularity: Granularity): string {
    const settings = this.plugin.settings;
    const activeSet = settings.calendarSets.find((set) => set.id === this.activeSet);
    if (!activeSet) {
      throw new Error("No active calendar set found");
    }

    return activeSet[granularity]?.format ?? DEFAULT_FORMAT[granularity];
  }

  public getActiveConfig(granularity: Granularity): PeriodicConfig {
    const settings = this.plugin.settings;
    const activeSet = settings.calendarSets.find((set) => set.id === this.activeSet);
    if (!activeSet) {
      throw new Error("No active calendar set found");
    }

    return activeSet[granularity] ?? DEFAULT_PERIODIC_CONFIG;
  }

  public getConfig(
    calendarSet: string,
    granularity: Granularity
  ): Readable<PeriodicConfig> {
    const settings = this.plugin.settings;
    const activeSet = settings.calendarSets.find((set) => set.id === calendarSet);
    if (!activeSet) {
      throw new Error("No active calendar set found");
    }

    const store = createWritableConfig(activeSet[granularity]);
    store.subscribe(() => this.plugin.onUpdateSettings);
    return store;
  }

  public getCalendarSets(): CalendarSet[] {
    const settings = this.plugin.settings;
    if (!settings.calendarSets || settings.calendarSets.length === 0) {
      // check for migration
      if (isLegacySettings(settings)) {
        this.createNewCalendarSet(
          DEFAULT_CALENDARSET_ID,
          migrateLegacySettingsToCalendarSet(settings)
        );
      } else {
        // otherwise create new default calendar set
        this.createNewCalendarSet("Default");
      }
    }

    return this.plugin.settings.calendarSets;
  }

  public getInactiveGranularities(): Granularity[] {
    const settings = this.plugin.settings;
    const activeSet = settings.calendarSets.find((set) => set.id === this.activeSet);
    if (!activeSet) {
      throw new Error("No active calendar set found");
    }
    return granularities.filter((granularity) => !activeSet[granularity]?.enabled);
  }

  public getActiveGranularities(): Granularity[] {
    const settings = this.plugin.settings;
    const activeSet = settings.calendarSets.find((set) => set.id === this.activeSet);
    if (!activeSet) {
      throw new Error("No active calendar set found");
    }
    return granularities.filter((granularity) => activeSet[granularity]?.enabled);
  }
}
