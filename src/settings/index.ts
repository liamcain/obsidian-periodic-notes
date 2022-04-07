import { App, PluginSettingTab } from "obsidian";
import type { CalendarSet, PeriodicConfig } from "src/types";
import type { SvelteComponent } from "svelte";

import type WeeklyNotesPlugin from "../index";
import SettingsRouter from "./pages/Router.svelte";

export interface ISettings {
  showGettingStartedBanner: boolean;
  hasMigratedDailyNoteSettings: boolean;
  hasMigratedWeeklyNoteSettings: boolean;

  calendarSets: CalendarSet[];
}

export const DEFAULT_PERIODIC_CONFIG: PeriodicConfig = Object.freeze({
  enabled: false,
  format: "",
  templatePath: "",
  folder: "",
});

export class PeriodicNotesSettingsTab extends PluginSettingTab {
  private view: SvelteComponent;

  constructor(readonly app: App, readonly plugin: WeeklyNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    this.view = new SettingsRouter({
      target: this.containerEl,
      props: {
        app: this.app,
        manager: this.plugin.calendarSetManager,
        settings: this.plugin.settings,
        onUpdateSettings: this.plugin.onUpdateSettings,
      },
    });
  }

  hide() {
    super.hide();
    this.view.$destroy();
  }
}
