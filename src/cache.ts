import memoize from "lodash/memoize";
import type { Moment } from "moment";
import { App, Component, TAbstractFile, TFile, TFolder } from "obsidian";

import { DEFAULT_FORMAT } from "./constants";
import type PeriodicNotesPlugin from "./main";
import { getLooselyMatchedDate } from "./parser";
import { granularities, type Granularity, type PeriodicConfig } from "./types";

export type MatchType = "filename" | "frontmatter" | "date-prefixed";

export interface PeriodicNoteMatchMatchData {
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
    if (!rootFolder) return;
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

    this.app.workspace.onLayoutReady(() => {
      console.info("[Periodic Notes] initializing cache");
      this.initialize();
      this.registerEvent(this.app.vault.on("create", this.resolve, this));
      this.registerEvent(this.app.vault.on("rename", this.resolveRename, this));
      this.registerEvent(
        this.app.workspace.on("periodic-notes:settings-updated", this.reset, this)
      );
    });
  }

  public reset(): void {
    this.cachedFiles.clear();
    this.initialize();
  }

  public initialize(): void {
    for (const calendarSet of this.plugin.calendarSetManager.getCalendarSets()) {
      const activeGranularities = granularities.filter((g) => calendarSet[g]?.enabled);
      for (const granularity of activeGranularities) {
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

  private resolveRename(file: TAbstractFile, oldPath: string): void {
    if (file instanceof TFile) {
      this.cachedFiles.delete(oldPath);
      this.resolve(file);
    }
  }

  private resolve(file: TFile): void {
    const manager = this.plugin.calendarSetManager;

    // Check if file matches any calendar set
    calendarsets: for (const calendarSet of manager.getCalendarSets()) {
      const activeGranularities = granularities.filter((g) => calendarSet[g]?.enabled);
      if (activeGranularities.length === 0) continue calendarsets;

      granularities: for (const granularity of activeGranularities) {
        const folder = calendarSet[granularity]?.folder ?? "/";
        if (!file.path.startsWith(folder)) continue granularities;

        const format = calendarSet[granularity]?.format || DEFAULT_FORMAT[granularity];
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

          console.log(
            "found periodic note",
            date.format(),
            granularity,
            file.path,
            calendarSet.id
          );
          this.app.workspace.trigger("periodic-notes:resolve", granularity, file);
          continue calendarsets;
        }
      }

      const nonStrictDate = getLooselyMatchedDate(file.basename);
      if (nonStrictDate) {
        this.cachedFiles.set(file.path, {
          calendarSet: calendarSet.id,
          filePath: file.path,
          date: nonStrictDate.date,
          granularity: nonStrictDate.granularity,
          canonicalDateStr: getCanonicalDateString(
            nonStrictDate.granularity,
            nonStrictDate.date
          ),
          matchData: {
            exact: false,
            matchType: "filename",
          },
        });

        this.app.workspace.trigger(
          "periodic-notes:resolve",
          nonStrictDate.granularity,
          file
        );
        continue;
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
      if (
        cacheData.calendarSet === calendarSet &&
        cacheData.granularity === granularity &&
        cacheData.matchData.exact === true &&
        cacheData.date.isSame(date, granularity)
      ) {
        return this.app.vault.getAbstractFileByPath(filePath) as TFile;
      }
    }

    return null;
  }

  /**
   *
   * Get all periodic notes from the cache
   *
   * @param calendarSet
   * @param granularity
   * @param date
   */
  public getPeriodicNotes(
    calendarSet: string,
    granularity: Granularity,
    date: Moment
  ): PeriodicNoteCachedMetadata[] {
    const matches: PeriodicNoteCachedMetadata[] = [];
    for (const [, cacheData] of this.cachedFiles) {
      if (
        cacheData.calendarSet === calendarSet &&
        cacheData.granularity === granularity &&
        cacheData.matchData.exact === true &&
        cacheData.date.isSame(date, granularity)
      ) {
        matches.push(cacheData);
      }
    }

    return matches;
  }

  // XXX: is this good to expose?
  public get(filePath: string): PeriodicNoteCachedMetadata | null {
    return this.cachedFiles.get(filePath) ?? null;
  }

  public getCachedFiles(): Map<string, PeriodicNoteCachedMetadata> {
    return Object.freeze(this.cachedFiles);
  }
}
