import type { Moment } from "moment";
import { addIcon, Plugin, TFile } from "obsidian";
import { writable, type Writable } from "svelte/store";

import { PeriodicNotesCache, type PeriodicNoteCachedMetadata } from "./cache";
import CalendarSetManager, {
  DEFAULT_CALENDARSET_ID,
  isLegacySettings,
  migrateDailyNoteSettings,
  migrateLegacySettingsToCalendarSet,
} from "./calendarSetManager";
import { displayConfigs, getCommands } from "./commands";
import {
  calendarDayIcon,
  calendarMonthIcon,
  calendarWeekIcon,
  calendarQuarterIcon,
  calendarYearIcon,
} from "./icons";
import { showFileMenu } from "./modal";
import {
  type ISettings,
  PeriodicNotesSettingsTab,
  DEFAULT_SETTINGS,
  DEFAULT_PERIODIC_CONFIG,
} from "./settings";
import {
  configureGlobalMomentLocale,
  initializeLocaleConfigOnce,
} from "./settings/localization";
import {
  createNewCalendarSet,
  findStartupNoteConfig,
  hasLegacyDailyNoteSettings,
  setActiveSet,
} from "./settings/utils";
import { CalendarSetSuggestModal } from "./switcher/calendarSetSwitcher";
import { NLDNavigator } from "./switcher/switcher";
import TimelineManager from "./timeline/manager";
import type { Granularity } from "./types";
import {
  applyTemplateTransformations,
  getNoteCreationPath,
  getTemplateContents,
  isMetaPressed,
} from "./utils";

interface IOpenOpts {
  inNewSplit?: boolean;
  calendarSet?: string;
}

export default class PeriodicNotesPlugin extends Plugin {
  public settings: Writable<ISettings>;
  private ribbonEl: HTMLElement | null;

  private cache: PeriodicNotesCache;
  public calendarSetManager: CalendarSetManager;
  private timelineManager: TimelineManager;

  unload(): void {
    super.unload();
    this.timelineManager?.cleanup();
  }

  async onload(): Promise<void> {
    addIcon("calendar-day", calendarDayIcon);
    addIcon("calendar-week", calendarWeekIcon);
    addIcon("calendar-month", calendarMonthIcon);
    addIcon("calendar-quarter", calendarQuarterIcon);
    addIcon("calendar-year", calendarYearIcon);

    this.settings = writable<ISettings>();
    await this.loadSettings();
    this.register(this.settings.subscribe(this.onUpdateSettings.bind(this)));

    initializeLocaleConfigOnce(this.app);

    this.ribbonEl = null;
    this.calendarSetManager = new CalendarSetManager(this);
    this.cache = new PeriodicNotesCache(this.app, this);
    this.timelineManager = new TimelineManager(this, this.cache);

    this.openPeriodicNote = this.openPeriodicNote.bind(this);
    this.addSettingTab(new PeriodicNotesSettingsTab(this.app, this));
    
    this.configureRibbonIcons();
    this.configureCommands();

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

    this.addCommand({
      id: "switch-calendarset",
      name: "Switch active calendar set...",
      callback: () => {
        new CalendarSetSuggestModal(this.app, this).open();
      },
      hotkeys: [],
    });

    this.app.workspace.onLayoutReady(() => {
      const startupNoteConfig = findStartupNoteConfig(this.settings);
      if (startupNoteConfig) {
        this.openPeriodicNote(startupNoteConfig.granularity, window.moment(), {
          calendarSet: startupNoteConfig.calendarSet,
        });
      }
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
            this.openPeriodicNote(granularity, window.moment(), {
              inNewSplit: isMetaPressed(e),
            });
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

    if (!settings.calendarSets || settings.calendarSets.length === 0) {
      // check for migration
      if (isLegacySettings(settings)) {
        this.settings.update(
          createNewCalendarSet(
            DEFAULT_CALENDARSET_ID,
            migrateLegacySettingsToCalendarSet(settings)
          )
        );
      } else if (hasLegacyDailyNoteSettings(app)) {
        this.settings.update(
          createNewCalendarSet(DEFAULT_CALENDARSET_ID, migrateDailyNoteSettings(settings))
        );
      } else {
        // otherwise create new default calendar set
        this.settings.update(
          createNewCalendarSet(DEFAULT_CALENDARSET_ID, {
            day: {
              ...DEFAULT_PERIODIC_CONFIG,
              enabled: true,
            },
          })
        );
      }
      this.settings.update(setActiveSet(DEFAULT_CALENDARSET_ID));
    }
  }

  private async onUpdateSettings(newSettings: ISettings): Promise<void> {
    await this.saveData(newSettings);
    this.configureCommands();
    this.configureRibbonIcons();

    // Integrations (i.e. Calendar Plugin) can listen for changes to settings
    this.app.workspace.trigger("periodic-notes:settings-updated");
  }

  public async createPeriodicNote(
    granularity: Granularity,
    date: Moment
  ): Promise<TFile> {
    const config = this.calendarSetManager.getActiveConfig(granularity);
    const format = this.calendarSetManager.getFormat(granularity);
    const filename = date.format(format);
    const templateContents = await getTemplateContents(this.app, config.templatePath);
    const renderedContents = applyTemplateTransformations(
      filename,
      granularity,
      date,
      format,
      templateContents
    );
    const destPath = await getNoteCreationPath(this.app, filename, config);
    return this.app.vault.create(destPath, renderedContents);
  }

  public getPeriodicNote(granularity: Granularity, date: Moment): TFile | null {
    return this.cache.getPeriodicNote(
      this.calendarSetManager.getActiveId(),
      granularity,
      date
    );
  }

  // TODO: What API do I want for this?
  public getPeriodicNotes(
    granularity: Granularity,
    date: Moment,
    includeFinerGranularities = false
  ): PeriodicNoteCachedMetadata[] {
    return this.cache.getPeriodicNotes(
      this.calendarSetManager.getActiveId(),
      granularity,
      date,
      includeFinerGranularities
    );
  }

  public isPeriodic(filePath: string, granularity?: Granularity): boolean {
    return this.cache.isPeriodic(filePath, granularity);
  }

  public findAdjacent(
    calendarSet: string,
    filePath: string,
    direction: "forwards" | "backwards"
  ): PeriodicNoteCachedMetadata | null {
    return this.cache.findAdjacent(calendarSet, filePath, direction);
  }

  public findInCache(filePath: string): PeriodicNoteCachedMetadata | null {
    return this.cache.find(filePath);
  }

  public async openPeriodicNote(
    granularity: Granularity,
    date: Moment,
    opts?: IOpenOpts
  ): Promise<void> {
    const { inNewSplit = false, calendarSet } = opts ?? {};
    const { workspace } = this.app;
    let file = this.cache.getPeriodicNote(
      calendarSet ?? this.calendarSetManager.getActiveId(),
      granularity,
      date
    );
    if (!file) {
      file = await this.createPeriodicNote(granularity, date);
    }

    const leaf = inNewSplit ? workspace.splitActiveLeaf() : workspace.getUnpinnedLeaf();
    await leaf.openFile(file, { active: true });
  }
}
