import type moment from "moment";
import { App, Plugin } from "obsidian";

import { getCommands } from "./commands";
import {
  DEFAULT_SETTINGS,
  IPeriodicity,
  ISettings,
  PeriodicNotesSettingsTab,
} from "./settings";
import {
  getLegacyWeeklyNoteSettings,
  hasLegacyWeeklyNoteSettings,
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
    this.updateSettings = this.updateSettings.bind(this);

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
    if (this.isInitialLoad && hasLegacyWeeklyNoteSettings()) {
      this.migrateWeeklySettings();
      this.settings.weekly.enabled = true;
    }
  }

  private migrateWeeklySettings(): void {
    const calendarSettings = getLegacyWeeklyNoteSettings();
    this.updateSettings({
      ...this.settings,
      ...{
        weekly: { ...calendarSettings, enabled: true },
        hasMigratedWeeklyNoteSettings: true,
      },
    });
  }

  async loadSettings(): Promise<void> {
    const settings = await this.loadData();

    if (!settings) {
      this.isInitialLoad = true;
    }

    this.settings = settings || {
      showGettingStartedBanner: true,
      hasMigratedDailyNoteSettings: false,
      hasMigratedWeeklyNoteSettings: false,

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

  //   async updateSettings(
  //     key: IPeriodicity,
  //     settings: Partial<IPeriodicNoteSettings>
  //   ): Promise<void> {
  //     this.settings[key] = Object.assign({}, this.settings[key], settings);
  //     await this.saveData(this.settings);
  //     this.onSettingsUpdate();
  //   }
  // }

  async updateSettings(val: ISettings): Promise<void> {
    this.settings = val;
    await this.saveData(this.settings);

    this.onSettingsUpdate();
  }
}
