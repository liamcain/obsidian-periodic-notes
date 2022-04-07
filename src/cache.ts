import memoize from "lodash/memoize";
import type { Moment } from "moment";
import { App, Component, TAbstractFile, TFile, TFolder } from "obsidian";

import { granularities, type Granularity, type PeriodicConfig } from "./types";

import type PeriodicNotesPlugin from "./index";

type MatchType = "filename" | "frontmatter";

interface PeriodicNoteMatchMatchData {
  /* where was the date found */
  matchType: MatchType;
  /* XXX: keep ZK matches in the cache, should this be separate from formats with HH:mm in them? */
  /* just collect this for now, not 100% sure how it will be used. */
  exact: boolean;
}

export interface PeriodicNoteCachedMetadata {
  calendarSet: string;

  filePath: string;
  date: Moment;
  granularity: Granularity;
  canonicalDateStr: string;

  /* "how" the match was made */
  matchData: PeriodicNoteMatchMatchData;
}

function getCanonicalDateString(_granularity: Granularity, date: Moment): string {
  return date.toISOString();
}

const memoizedRecurseChildren = memoize(
  (rootFolder: TFolder, cb: (file: TAbstractFile) => void) => {
    for (const c of rootFolder.children) {
      if (c instanceof TFile) {
        cb(c);
      } else if (c instanceof TFolder) {
        memoizedRecurseChildren(c, cb);
      }
    }
  }
);

export class PeriodicNotesCache extends Component {
  // Map the full filename to
  public cachedFiles: Map<string, PeriodicNoteCachedMetadata>;

  constructor(readonly app: App, readonly plugin: PeriodicNotesPlugin) {
    super();
    this.cachedFiles = new Map();
  }

  public initialize(): void {
    console.info("[PERIODIC NOTES] initializing cache");
    this.registerEvent(this.app.metadataCache.on("resolve", this.resolve, this));

    for (const calendarSet of this.plugin.calendarSetManager.getCalendarSets()) {
      for (const granularity of granularities) {
        const config = calendarSet[granularity] as PeriodicConfig;
        const rootFolder = this.app.vault.getAbstractFileByPath(
          config.folder || "/"
        ) as TFolder;
        memoizedRecurseChildren(rootFolder, (file: TAbstractFile) => {
          if (file instanceof TFile) {
            this.resolve(file);
          }
        });
      }
    }
  }

  private resolve(file: TFile): void {
    // TODO: should I listen for create+rename instead? Rename would allow me to remove items from the cache
    const manager = this.plugin.calendarSetManager;

    // Check if file matches any calendar set
    for (const calendarSet of manager.getCalendarSets()) {
      for (const granularity of granularities) {
        const format = manager.getFormat(granularity);
        const date = window.moment(file.basename, format, true);
        if (date.isValid()) {
          this.cachedFiles.set(file.path, {
            calendarSet: calendarSet.id,
            filePath: file.path,
            date,
            granularity,
            canonicalDateStr: getCanonicalDateString(granularity, date),
            matchData: {
              exact: true,
              matchType: "filename",
            },
          });
          return;
        }
      }
    }
  }

  /**
   *
   * Get a periodic note from the cache
   *
   * @param calendarSet
   * @param granularity
   * @param date
   */
  public getPeriodicNote(
    calendarSet: string,
    granularity: Granularity,
    date: Moment
  ): TFile | null {
    for (const [filePath, cacheData] of this.cachedFiles) {
      if (cacheData.calendarSet !== calendarSet) continue;
      if (cacheData.granularity !== granularity) continue;
      if (!cacheData.date.isSame(date, granularity)) continue;

      /**
       * TODO handle the non-unique case.
       */

      return this.app.vault.getAbstractFileByPath(filePath) as TFile;
    }

    return null;
  }

  // XXX: is this good to expose?
  public get(filePath: string): PeriodicNoteCachedMetadata | null {
    return this.cachedFiles.get(filePath) ?? null;
  }

  public getCachedFiles(): Map<string, PeriodicNoteCachedMetadata> {
    return Object.freeze(this.cachedFiles);
  }
}
