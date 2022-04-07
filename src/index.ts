import type { Moment } from "moment";
import { addIcon, Plugin, TFile } from "obsidian";
import { writable, type Writable } from "svelte/store";

import { PeriodicNotesCache, type PeriodicNoteCachedMetadata } from "./cache";
import CalendarSetManager from "./calendarSetManager";
import { displayConfigs, getCommands } from "./commands";
import {
  calendarDayIcon,
  calendarMonthIcon,
  calendarWeekIcon,
  calendarQuarterIcon,
  calendarYearIcon,
} from "./icons";
import { showFileMenu } from "./modal";
import { type ISettings, PeriodicNotesSettingsTab, DEFAULT_SETTINGS } from "./settings";
import { NLDNavigator } from "./switcher/switcher";
import TimelineManager from "./timeline/manager";
import type { Granularity } from "./types";
import {
  applyTemplateTransformations,
  getNoteCreationPath,
  getTemplateContents,
  isMetaPressed,
} from "./utils";

export default class PeriodicNotesPlugin extends Plugin {
  public settings: Writable<ISettings>;
  private ribbonEl: HTMLElement | null;

  private cache: PeriodicNotesCache;
  public calendarSetManager: CalendarSetManager;
  private timelineManager: TimelineManager;

  async onload(): Promise<void> {
    this.settings = writable<ISettings>();
    await this.loadSettings();
    this.settings.subscribe(this.onUpdateSettings.bind(this));

    this.ribbonEl = null;
    this.cache = new PeriodicNotesCache(this.app, this);
    this.calendarSetManager = new CalendarSetManager(this);
    this.timelineManager = new TimelineManager(this, this.cache);

    this.openPeriodicNote = this.openPeriodicNote.bind(this);
    this.addSettingTab(new PeriodicNotesSettingsTab(this.app, this));

    addIcon("calendar-day", calendarDayIcon);
    addIcon("calendar-week", calendarWeekIcon);
    addIcon("calendar-month", calendarMonthIcon);
    addIcon("calendar-quarter", calendarQuarterIcon);
    addIcon("calendar-year", calendarYearIcon);

    this.addCommand({
      id: "show-date-switcher",
      name: "Show date switcher...",
      checkCallback: (checking: boolean) => {
        if (!this.app.plugins.getPlugin("nldates-obsidian")) {
          return false;
        }
        if (checking) {
          return !!this.app.workspace.activeLeaf;
        }
        new NLDNavigator(this.app, this).open();
      },
      hotkeys: [],
    });

    this.app.workspace.onLayoutReady(() => {
      // If the user has Calendar Weekly Notes settings, migrate them automatically,
      // since the functionality will be deprecated.
      // if (hasLegacyWeeklyNoteSettings(this.app)) {
      //   this.migrateWeeklySettings();
      //   this.settings.weekly.enabled = true;
      // }
      this.cache.initialize();

      this.configureRibbonIcons();
      this.configureCommands();
    });
  }

  private configureRibbonIcons() {
    this.ribbonEl?.detach();

    const configuredGranularities = this.calendarSetManager.getActiveGranularities();
    if (configuredGranularities.length) {
      const granularity = configuredGranularities[0];
      const config = displayConfigs[granularity];
      this.ribbonEl = this.addRibbonIcon(
        `calendar-${granularity}`,
        config.labelOpenPresent,
        (e: MouseEvent) => {
          if (e.type !== "auxclick") {
            this.openPeriodicNote(granularity, window.moment(), isMetaPressed(e));
          }
        }
      );
      this.ribbonEl.addEventListener("contextmenu", (e: MouseEvent) => {
        e.preventDefault();
        showFileMenu(this.app, this, {
          x: e.pageX,
          y: e.pageY,
        });
      });
    }
  }

  private configureCommands() {
    // Remove disabled commands
    this.calendarSetManager
      .getInactiveGranularities()
      .forEach((granularity: Granularity) => {
        getCommands(this.app, this, granularity).forEach((command) =>
          this.app.commands.removeCommand(`periodic-notes:${command.id}`)
        );
      });

    // register enabled commands
    this.calendarSetManager
      .getActiveGranularities()
      .forEach((granularity: Granularity) => {
        getCommands(this.app, this, granularity).forEach(this.addCommand.bind(this));
      });
  }

  async loadSettings(): Promise<void> {
    const savedSettings = await this.loadData();
    const settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings || {});
    this.settings.set(settings);
  }

  private async onUpdateSettings(newSettings: ISettings): Promise<void> {
    // this.settings = newSettings;
    await this.saveData(newSettings);
    this.configureCommands();
    this.configureRibbonIcons();

    // Integrations (i.e. Calendar Plugin) can listen for changes to settings
    this.app.workspace.trigger("periodic-notes:settings-updated");
  }

  // public updateSettings(tx: (old: ISettings) => Partial<ISettings>): void {
  //   const changedSettings = tx(this.settings);
  //   const newSettings = Object.assign({}, this.settings, changedSettings);

  //   this.onUpdateSettings(newSettings);
  // }

  public async createPeriodicNote(
    granularity: Granularity,
    date: Moment
  ): Promise<TFile> {
    const config = this.calendarSetManager.getActiveConfig(granularity);
    const format = this.calendarSetManager.getFormat(granularity);
    const filename = date.format(format);
    const templateContents = await getTemplateContents(this.app, config);
    const renderedContents = applyTemplateTransformations(
      filename,
      date,
      format,
      templateContents
    );
    const destPath = await getNoteCreationPath(this.app, filename, config);
    return this.app.vault.create(destPath, renderedContents);
  }

  public getPeriodicNote(granularity: Granularity, date: Moment): TFile | null {
    return this.cache.getPeriodicNote(
      this.calendarSetManager.activeSet,
      granularity,
      date
    );
  }

  public getFileMetadata(filePath: string): PeriodicNoteCachedMetadata | null {
    return this.cache.get(filePath);
  }

  public async openPeriodicNote(
    granularity: Granularity,
    date: Moment,
    inNewSplit: boolean
  ): Promise<void> {
    const { workspace } = this.app;
    let file = this.cache.getPeriodicNote(
      this.calendarSetManager.activeSet,
      granularity,
      date
    );
    if (!file) {
      file = await this.createPeriodicNote(granularity, date);
    }

    const leaf = inNewSplit ? workspace.splitActiveLeaf() : workspace.getUnpinnedLeaf();
    await leaf.openFile(file, { active: true });
  }

  public getCachedFiles(): Map<string, PeriodicNoteCachedMetadata> {
    return this.cache.getCachedFiles();
  }
}
