import type moment from "moment";
import { App, Plugin } from "obsidian";

import { getCommands, openPeriodicNote, periodConfigs } from "./commands";
import { SETTINGS_UPDATED } from "./events";
import { PeriodicNoteCreateModal } from "./modal";
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

  private ribbonEls: HTMLElement[];

  async onload(): Promise<void> {
    this.ribbonEls = [];

    this.updateSettings = this.updateSettings.bind(this);

    await this.loadSettings();
    this.addSettingTab(new PeriodicNotesSettingsTab(this.app, this));

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  onLayoutReady(): void {
    // If the user has Calendar Weekly Notes settings, migrate them automatically,
    // since the functionality will be deprecated.
    if (this.isInitialLoad && hasLegacyWeeklyNoteSettings()) {
      this.migrateWeeklySettings();
      this.settings.weekly.enabled = true;
    }

    this.configureRibbonIcons();
    this.configureCommands();
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

  private configureRibbonIcons() {
    for (const ribbonEl of this.ribbonEls) {
      ribbonEl.detach();
    }

    const configuredPeriodicities = ["daily", "weekly", "monthly"].filter(
      (periodicity) => this.settings[periodicity].enabled
    );

    if (configuredPeriodicities.length > 1) {
      this.ribbonEls.push(
        this.addRibbonIcon(
          "calendar-with-checkmark",
          "Open periodic note",
          () => new PeriodicNoteCreateModal(this.app, this.settings).open()
        )
      );
    } else if (configuredPeriodicities.length === 1) {
      const periodicity = configuredPeriodicities[0] as IPeriodicity;
      const config = periodConfigs[periodicity];

      this.ribbonEls.push(
        this.addRibbonIcon(
          "calendar-with-checkmark",
          `Open ${config.relativeUnit}'s note`,
          () => openPeriodicNote(periodicity, window.moment(), false)
        )
      );
    }
  }

  private configureCommands() {
    // Remove disabled commands
    ["daily", "weekly", "monthly"]
      .filter((periodicity) => !this.settings[periodicity].enabled)
      .forEach((periodicity: IPeriodicity) => {
        getCommands(periodicity).forEach((command) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this.app as any).commands.removeCommand(
            `periodic-notes:${command.id}`
          )
        );
      });

    // register enabled commands
    ["daily", "weekly", "monthly"]
      .filter((periodicity) => this.settings[periodicity].enabled)
      .forEach((periodicity: IPeriodicity) => {
        getCommands(periodicity).forEach(this.addCommand.bind(this));
      });
  }

  async loadSettings(): Promise<void> {
    const settings = await this.loadData();

    if (!settings) {
      this.isInitialLoad = true;
    }

    this.settings = Object.assign(
      {},
      {
        showGettingStartedBanner: true,
        hasMigratedDailyNoteSettings: false,
        hasMigratedWeeklyNoteSettings: false,

        daily: { ...DEFAULT_SETTINGS },
        weekly: { ...DEFAULT_SETTINGS },
        monthly: { ...DEFAULT_SETTINGS },
      },
      settings || {}
    );
  }

  private onSettingsUpdate(): void {
    this.configureCommands();
    this.configureRibbonIcons();

    // Integrations (i.e. Calendar Plugin) can listen for changes to settings
    this.app.workspace.trigger(SETTINGS_UPDATED);
  }

  async updateSettings(val: ISettings): Promise<void> {
    this.settings = val;
    await this.saveData(this.settings);

    this.onSettingsUpdate();
  }
}
