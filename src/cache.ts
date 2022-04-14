import memoize from "lodash/memoize";
import sortBy from "lodash/sortBy";
import type { Moment } from "moment";
import {
  App,
  Component,
  parseFrontMatterEntry,
  TAbstractFile,
  TFile,
  TFolder,
  type CachedMetadata,
} from "obsidian";

import { DEFAULT_FORMAT } from "./constants";
import type PeriodicNotesPlugin from "./main";
import { getLooselyMatchedDate } from "./parser";
import { getDateInput } from "./settings/validation";
import { granularities, type Granularity, type PeriodicConfig } from "./types";
import { applyPeriodicTemplateToFile, getPossibleFormats } from "./utils";

export type MatchType = "filename" | "frontmatter" | "date-prefixed";

export interface PeriodicNoteMatchMatchData {
  /* where was the date found */
  matchType: MatchType;
  /* XXX: keep ZK matches in the cache, should this be separate from formats with HH:mm in them? */
  /* just collect this for now, not 100% sure how it will be used. */
  exact: boolean;
  // other ideas of match data:
  // - filename without date (unparsed tokens)
  // - time?: string
}

function compareGranularity(a: Granularity, b: Granularity) {
  const idxA = granularities.indexOf(a);
  const idxB = granularities.indexOf(b);
  if (idxA === idxB) return 0;
  if (idxA < idxB) return -1;
  return 1;
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

export class PeriodicNotesCache extends Component {
  // Map the full filename to
  public cachedFiles: Map<string, Map<string, PeriodicNoteCachedMetadata>>;

  constructor(readonly app: App, readonly plugin: PeriodicNotesPlugin) {
    super();
    this.cachedFiles = new Map();

    this.app.workspace.onLayoutReady(() => {
      console.info("[Periodic Notes] initializing cache");
      this.initialize();
      this.registerEvent(this.app.vault.on("create", this.resolve, this));
      this.registerEvent(this.app.vault.on("rename", this.resolveRename, this));
      this.registerEvent(
        this.app.metadataCache.on("changed", this.resolveChangedMetadata, this)
      );
      this.registerEvent(
        this.app.workspace.on("periodic-notes:settings-updated", this.reset, this)
      );
    });
  }

  public reset(): void {
    console.info("[Periodic Notes] reseting cache");
    this.cachedFiles.clear();
    this.initialize();
  }

  public initialize(): void {
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

    for (const calendarSet of this.plugin.calendarSetManager.getCalendarSets()) {
      const activeGranularities = granularities.filter((g) => calendarSet[g]?.enabled);
      for (const granularity of activeGranularities) {
        const config = calendarSet[granularity] as PeriodicConfig;
        const rootFolder = this.app.vault.getAbstractFileByPath(
          config.folder || "/"
        ) as TFolder;

        // Scan for filename matches
        memoizedRecurseChildren(rootFolder, (file: TAbstractFile) => {
          if (file instanceof TFile) {
            this.resolve(file, "initialize");
            const metadata = app.metadataCache.getFileCache(file);
            if (metadata) {
              this.resolveChangedMetadata(file, "", metadata);
            }
          }
        });
      }
    }
  }

  private resolveChangedMetadata(
    file: TFile,
    _data: string,
    cache: CachedMetadata
  ): void {
    const manager = this.plugin.calendarSetManager;
    // Check if file matches any calendar set
    calendarsets: for (const calendarSet of manager.getCalendarSets()) {
      const activeGranularities = granularities.filter((g) => calendarSet[g]?.enabled);
      if (activeGranularities.length === 0) continue calendarsets;

      granularities: for (const granularity of activeGranularities) {
        const folder = calendarSet[granularity]?.folder || "";
        if (!file.path.startsWith(folder)) continue granularities;
        const frontmatterEntry = parseFrontMatterEntry(cache.frontmatter, granularity);
        if (!frontmatterEntry) continue granularities;

        const format = DEFAULT_FORMAT[granularity];
        let date: Moment;
        if (typeof frontmatterEntry === "string") {
          // e.g. `day: 2022-02-02`
          date = window.moment(frontmatterEntry, format, true);
          if (date.isValid()) {
            this.set(calendarSet.id, file.path, {
              calendarSet: calendarSet.id,
              filePath: file.path,
              date,
              granularity,
              canonicalDateStr: getCanonicalDateString(granularity, date),
              matchData: {
                exact: true,
                matchType: "frontmatter",
              },
            });
          } else {
            // TODO: custom format?
            // semester:
            //   start_date: X
            //   end_date: Y
            //
          }

          continue calendarsets;
        }
      }
    }
  }

  private resolveRename(file: TAbstractFile, oldPath: string): void {
    for (const [, cache] of this.cachedFiles) {
      if (file instanceof TFile) {
        cache.delete(oldPath);
        this.resolve(file, "rename");
      }
    }
  }

  private resolve(
    file: TFile,
    reason: "create" | "rename" | "initialize" = "create"
  ): void {
    const manager = this.plugin.calendarSetManager;

    // Check if file matches any calendar set
    calendarsets: for (const calendarSet of manager.getCalendarSets()) {
      const activeGranularities = granularities.filter((g) => calendarSet[g]?.enabled);
      if (activeGranularities.length === 0) continue calendarsets;

      // 'frontmatter' entries should supercede 'filename'
      const existingEntry = this.cachedFiles.get(calendarSet.id)?.get(file.path);
      if (existingEntry && existingEntry.matchData.matchType === "frontmatter") {
        continue calendarsets;
      }

      granularities: for (const granularity of activeGranularities) {
        const folder = calendarSet[granularity]?.folder || "";
        if (!file.path.startsWith(folder)) continue granularities;

        const formats = getPossibleFormats(calendarSet, granularity);
        const dateInputStr = getDateInput(file, formats[0], granularity);
        const date = window.moment(dateInputStr, formats, true);
        if (date.isValid()) {
          const metadata = {
            calendarSet: calendarSet.id,
            filePath: file.path,
            date,
            granularity,
            canonicalDateStr: getCanonicalDateString(granularity, date),
            matchData: {
              exact: true,
              matchType: "filename",
            },
          } as PeriodicNoteCachedMetadata;
          this.set(calendarSet.id, file.path, metadata);

          if (reason === "create" && file.stat.size === 0) {
            applyPeriodicTemplateToFile(app, file, calendarSet, metadata);
          }

          this.app.workspace.trigger("periodic-notes:resolve", granularity, file);
          continue calendarsets;
        }
      }

      const nonStrictDate = getLooselyMatchedDate(file.basename);
      if (nonStrictDate) {
        this.set(calendarSet.id, file.path, {
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
   * @param targetDate
   */
  public getPeriodicNote(
    calendarSet: string,
    granularity: Granularity,
    targetDate: Moment
  ): TFile | null {
    const metadata = this.cachedFiles.get(calendarSet);
    if (metadata) {
      for (const [filePath, cacheData] of metadata) {
        if (
          cacheData.granularity === granularity &&
          cacheData.matchData.exact === true &&
          cacheData.date.isSame(targetDate, granularity)
        ) {
          return this.app.vault.getAbstractFileByPath(filePath) as TFile;
        }
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
   * @param targetDate
   * @param includeFinerGranularities?
   */
  public getPeriodicNotes(
    calendarSet: string,
    granularity: Granularity,
    targetDate: Moment,
    includeFinerGranularities = false
  ): PeriodicNoteCachedMetadata[] {
    const matches: PeriodicNoteCachedMetadata[] = [];
    const metadata = this.cachedFiles.get(calendarSet);
    if (metadata) {
      for (const [, cacheData] of metadata) {
        if (
          (granularity === cacheData.granularity ||
            (includeFinerGranularities &&
              compareGranularity(cacheData.granularity, granularity) <= 0)) &&
          cacheData.date.isSame(targetDate, granularity)
        ) {
          matches.push(cacheData);
        }
      }
    }

    return matches;
  }

  private set(
    calendarSet: string,
    filePath: string,
    metadata: PeriodicNoteCachedMetadata
  ) {
    let cache = this.cachedFiles.get(calendarSet);
    if (!cache) {
      cache = new Map();
      this.cachedFiles.set(calendarSet, cache);
    }

    cache.set(filePath, metadata);
  }

  public isPeriodic(targetPath: string, granularity?: Granularity): boolean {
    for (const [, calendarSetCache] of this.cachedFiles) {
      const metadata = calendarSetCache.get(targetPath);
      if (!metadata) continue;

      if (!granularity) return true;
      if (granularity && granularity === metadata.granularity) {
        return true;
      }
    }

    return false;
  }

  public find(
    filePath: string | undefined,
    calendarSet?: string
  ): PeriodicNoteCachedMetadata | null {
    if (!filePath) return null;

    // If a calendar set is passed, only check there
    if (calendarSet) {
      const cache = this.cachedFiles.get(calendarSet);
      return cache?.get(filePath) ?? null;
    }

    // Otherwise, check all calendar sets, starting with the active one
    const activeCache = this.cachedFiles.get(
      this.plugin.calendarSetManager.getActiveId()
    );
    const metadata = activeCache?.get(filePath);
    if (metadata) {
      return metadata;
    }

    // ... all other caches
    for (const [, calendarSetCache] of this.cachedFiles) {
      const metadata = calendarSetCache.get(filePath);
      if (metadata) {
        return metadata;
      }
    }
    return null;
  }

  public findAdjacent(
    calendarSet: string,
    filePath: string,
    direction: "forwards" | "backwards"
  ): PeriodicNoteCachedMetadata | null {
    const currMetadata = this.find(filePath, calendarSet);
    if (!currMetadata) return null;

    const granularity = currMetadata.granularity;
    const cache = this.cachedFiles.get(calendarSet)?.values() ?? [];

    const sortedCache = sortBy(
      Array.from(cache).filter((m) => m.granularity === granularity),
      ["canonicalDateStr"]
    );
    const activeNoteIndex = sortedCache.findIndex((m) => m.filePath === filePath);

    const offset = direction === "forwards" ? 1 : -1;
    return sortedCache[activeNoteIndex + offset];
  }
}
