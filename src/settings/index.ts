import { App, PluginSettingTab } from "obsidian";
import type { IPeriodicNoteSettings } from "obsidian-daily-notes-interface";
import type { SvelteComponent } from "svelte";

import type WeeklyNotesPlugin from "../index";
import SettingsTab from "./SettingsTab.svelte";

export type IPeriodicity =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface IPerioditySettings extends IPeriodicNoteSettings {
  enabled: boolean;
}

export interface ISettings {
  showGettingStartedBanner: boolean;
  hasMigratedDailyNoteSettings: boolean;
  hasMigratedWeeklyNoteSettings: boolean;

  daily: IPerioditySettings;
  weekly: IPerioditySettings;
  monthly: IPerioditySettings;
  quarterly: IPerioditySettings;
  yearly: IPerioditySettings;
}

export const DEFAULT_SETTINGS = Object.freeze({
  format: "",
  template: "",
  folder: "",
});

export class PeriodicNotesSettingsTab extends PluginSettingTab {
  public plugin: WeeklyNotesPlugin;

  private view: SvelteComponent;

  constructor(app: App, plugin: WeeklyNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    this.view = new SettingsTab({
      target: this.containerEl,
      props: {
        settings: this.plugin.settings,
        onUpdateSettings: this.plugin.updateSettings,
      },
    });
  }
}
