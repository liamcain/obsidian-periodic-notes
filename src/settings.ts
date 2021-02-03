import { App, PluginSettingTab, Setting } from "obsidian";
import {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  IPeriodicNoteSettings,
} from "obsidian-daily-notes-interface";

import type WeeklyNotesPlugin from "./index";
import { FileSuggest, FolderSuggest } from "./ui/file-suggest";
import { capitalize } from "./utils";

export type IPeriodicity = "daily" | "weekly" | "monthly";

interface IPerioditySettings extends IPeriodicNoteSettings {
  enabled: boolean;
}

export interface ISettings {
  daily: IPerioditySettings;
  weekly: IPerioditySettings;
  monthly: IPerioditySettings;
}

const DEFAULT_FORMATS = {
  daily: DEFAULT_DAILY_NOTE_FORMAT,
  weekly: DEFAULT_WEEKLY_NOTE_FORMAT,
  monthly: DEFAULT_MONTHLY_NOTE_FORMAT,
};

const SECTION_DESCRIPTIONS = {
  daily:
    "Compatible with the Daily Notes plugin. Provides additional customization.",
  weekly: "Compatible with the Calendar plugin.",
  monthly: " ",
};

export const DEFAULT_SETTINGS = Object.freeze({
  format: "",
  template: "",
  folder: "",
});

export class PeriodicNotesSettingsTab extends PluginSettingTab {
  public plugin: WeeklyNotesPlugin;

  private isWeeklyNotesSettingsMigrated: boolean;

  constructor(app: App, plugin: WeeklyNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.isWeeklyNotesSettingsMigrated = false;
  }

  display(): void {
    this.containerEl.empty();

    if (this.plugin.isInitialLoad) {
      this.addGettingStartedBanner();
    }

    const periodicities: IPeriodicity[] = ["daily", "weekly", "monthly"];

    periodicities.forEach((periodicity) => {
      const enabled = this.plugin.settings[periodicity].enabled;
      new Setting(this.containerEl)
        .setName(`${capitalize(periodicity)} Notes`)
        .setDesc(SECTION_DESCRIPTIONS[periodicity])
        .addToggle((toggle) => {
          toggle.setValue(enabled);
          toggle.onChange((value) => {
            this.plugin.settings[periodicity].enabled = value;
            this.display();
          });
        })
        .setHeading();

      if (enabled) {
        this.addNoteFormatSetting(periodicity);
        this.addNoteTemplateSetting(periodicity);
        this.addNoteFolderSetting(periodicity);
      }
    });
  }

  addGettingStartedBanner(): void {
    this.containerEl.createDiv("settings-banner", (banner) => {
      banner.createEl("h3", {
        text: "Getting Started",
      });

      banner.createDiv("setting-item", (item) => {
        item.createDiv("setting-item-info", (section) => {
          section.createEl("h4", {
            text: "Daily Notes plugin is enabled",
          });
          section.createEl("p", {
            cls: "setting-item-description",
            text:
              "You are currently using the core Daily Notes plugin. You can migrate those settings over to Periodic Notes to enjoy the same functionality as well as some notable improvements.",
          });
        });

        item.createDiv("setting-item-control", (itemControl) => {
          const migrateButton = itemControl.createEl("button", {
            cls: this.isWeeklyNotesSettingsMigrated ? "" : "mod-cta",
            text: this.isWeeklyNotesSettingsMigrated ? "Migrated" : "Migrate",
          });
          migrateButton.addEventListener("click", () => {
            this.plugin.migrateDailySettings();
            this.plugin.settings.daily.enabled = true;
            this.isWeeklyNotesSettingsMigrated = true;

            this.display();
          });
        });
      });

      banner.createDiv("setting-item", (item) => {
        item.createDiv("setting-item-info", (section) => {
          section.createEl("h4", {
            text: "Weekly Note settings migrated",
          });
          section.createEl("p", {
            cls: "setting-item-description",
            text:
              "Your existing weekly-note settings from the Calendar plugin have been migrated over automatically.",
          });
        });
        item.createDiv("setting-item-control", (itemControl) => {
          itemControl.createEl("button", {
            attr: { disabled: "disabled" },
            text: "Migrated",
          });
        });
      });

      const dismissButton = banner.createEl("button", { text: "Dismiss" });
      dismissButton.addEventListener("click", () => {
        this.plugin.isInitialLoad = false;
        dismissButton.parentElement.detach();
      });
    });
  }

  addNoteFormatSetting(periodicity: IPeriodicity): Setting {
    return new Setting(this.containerEl)
      .setName("Note format")
      .setDesc("For more syntax help, refer to format reference")
      .addText((textfield) => {
        textfield.setValue(this.plugin.settings[periodicity].format);
        textfield.setPlaceholder(DEFAULT_FORMATS[periodicity]);
        textfield.onChange(async (value) => {
          this.plugin.updateSettings(periodicity, { format: value });
        });
        textfield.inputEl.addEventListener("blur", () => {});
      });
  }

  addNoteTemplateSetting(periodicity: IPeriodicity): Setting {
    return new Setting(this.containerEl)
      .setName(`${capitalize(periodicity)} note template`)
      .setDesc(
        "Choose the file you want to use as the template for your Weekly notes"
      )
      .addText((textfield) => {
        textfield.setValue(this.plugin.settings[periodicity].template);
        textfield.setPlaceholder("Example: folder/note");
        textfield.onChange(async (value) => {
          this.plugin.updateSettings(periodicity, { template: value });
        });
        new FileSuggest(this.app, textfield.inputEl);
      });
  }

  addNoteFolderSetting(periodicity: IPeriodicity): Setting {
    return new Setting(this.containerEl)
      .setName(`${capitalize(periodicity)} note folder`)
      .setDesc(`New ${periodicity} notes will be placed here`)
      .addText((textfield) => {
        textfield.setValue(this.plugin.settings[periodicity].folder);
        textfield.setPlaceholder("Example: folder 1/folder 2");
        textfield.onChange(async (value) => {
          this.plugin.updateSettings(periodicity, { folder: value });
        });
        new FolderSuggest(this.app, textfield.inputEl);
      });
  }
}
