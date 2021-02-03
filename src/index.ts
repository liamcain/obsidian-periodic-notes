import type moment from "moment";
import { App, Plugin } from "obsidian";
import { IPeriodicNoteSettings } from "obsidian-daily-notes-interface";

import { getCommands } from "./commands";
import {
  DEFAULT_SETTINGS,
  IPeriodicity,
  ISettings,
  PeriodicNotesSettingsTab,
} from "./settings";
import {
  getLegacyDailyNoteSettings,
  getLegacyWeeklyNoteSettings,
  hasWeeklyNoteSettingsFromCalendar,
} from "./utils";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

export default class PeriodicNotesPlugin extends Plugin {
  public settings: ISettings;
  public isInitialLoad: boolean;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new PeriodicNotesSettingsTab(this.app, this));

    if (this.app.workspace.layoutReady) {
      this.onLayoutReady();
    } else {
      this.app.workspace.on("layout-ready", this.onLayoutReady.bind(this));
    }
  }

  private onLayoutReady() {
    // If the user has Calendar Weekly Notes settings, migrate them automatically,
    // since the functionality will be deprecated.
    if (this.isInitialLoad && hasWeeklyNoteSettingsFromCalendar()) {
      this.migrateWeeklySettings();
      this.settings.weekly.enabled = true;
    }
  }

  // public tryToMigrateDailyNoteSettings(): void {
  //   // If the user has Daily Notes settings, migrate them automatically,
  //   // since the functionality will be deprecated.
  //   if (!this.settings.daily.enabled && appHasDailyNotesPluginLoaded()) {
  //     this.migrateDailySettings();

  //     this.settings.daily.enabled = true;
  //   }
  // }

  public migrateDailySettings(): void {
    const dailyNotesSettings = getLegacyDailyNoteSettings();
    this.updateSettings("daily", dailyNotesSettings);
  }

  private migrateWeeklySettings(): void {
    const calendarSettings = getLegacyWeeklyNoteSettings();
    this.updateSettings("weekly", calendarSettings);
  }

  async loadSettings(): Promise<void> {
    const options = await this.loadData();

    if (!options) {
      this.isInitialLoad = true;
    }

    this.settings = options || {
      daily: { ...DEFAULT_SETTINGS },
      weekly: { ...DEFAULT_SETTINGS },
      monthly: { ...DEFAULT_SETTINGS },
    };
  }

  private onSettingsUpdate(): void {
    ["daily", "weekly", "monthly"]
      .filter((periodicity: IPeriodicity) => this.settings[periodicity].enabled)
      .forEach((periodicity: IPeriodicity) => {
        getCommands(periodicity).forEach(this.addCommand.bind(this));
      });
  }

  async updateSettings(
    key: IPeriodicity,
    settings: Partial<IPeriodicNoteSettings>
  ): Promise<void> {
    this.settings[key] = Object.assign({}, this.settings[key], settings);
    await this.saveData(this.settings);
    this.onSettingsUpdate();
  }
}
