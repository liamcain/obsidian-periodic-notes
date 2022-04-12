import type { Moment } from "moment";
import { normalizePath, App, Notice, Platform, TFile } from "obsidian";

import type { PeriodicNoteCachedMetadata } from "./cache";
import { DEFAULT_FORMAT, HUMANIZE_FORMAT } from "./constants";
import { DEFAULT_PERIODIC_CONFIG } from "./settings";
import { removeEscapedCharacters } from "./settings/validation";
import { type CalendarSet, type Granularity, type PeriodicConfig } from "./types";

export function isMetaPressed(e: MouseEvent | KeyboardEvent): boolean {
  return Platform.isMacOS ? e.metaKey : e.ctrlKey;
}

export function applyTemplateTransformations(
  filename: string,
  date: Moment,
  format: string,
  rawTemplateContents: string
): string {
  return rawTemplateContents
    .replace(/{{\s*date\s*}}/gi, filename)
    .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
    .replace(/{{\s*title\s*}}/gi, filename)
    .replace(
      /{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi,
      (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
        const now = window.moment();
        const currentDate = date.clone().set({
          hour: now.get("hour"),
          minute: now.get("minute"),
          second: now.get("second"),
        });
        if (calc) {
          currentDate.add(parseInt(timeDelta, 10), unit);
        }

        if (momentFormat) {
          return currentDate.format(momentFormat.substring(1).trim());
        }
        return currentDate.format(format);
      }
    )
    .replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format))
    .replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format));
}

export function getFormat(calendarSet: CalendarSet, granularity: Granularity): string {
  return calendarSet[granularity]?.format || DEFAULT_FORMAT[granularity];
}

export function getFolder(calendarSet: CalendarSet, granularity: Granularity): string {
  return calendarSet[granularity]?.folder || "/";
}

export function getConfig(
  calendarSet: CalendarSet,
  granularity: Granularity
): PeriodicConfig {
  return calendarSet[granularity] ?? DEFAULT_PERIODIC_CONFIG;
}

export async function applyPeriodicTemplateToFile(
  app: App,
  file: TFile,
  calendarSet: CalendarSet,
  metadata: PeriodicNoteCachedMetadata
) {
  const format = getFormat(calendarSet, metadata.granularity);
  const templateContents = await getTemplateContents(
    app,
    calendarSet[metadata.granularity]?.templatePath
  );
  const renderedContents = applyTemplateTransformations(
    file.basename,
    metadata.date,
    format,
    templateContents
  );
  return app.vault.modify(file, renderedContents);
}

export async function getTemplateContents(
  app: App,
  templatePath: string | undefined
): Promise<string> {
  const { metadataCache, vault } = app;
  const normalizedTemplatePath = normalizePath(templatePath ?? "");
  if (templatePath === "/") {
    return Promise.resolve("");
  }

  try {
    const templateFile = metadataCache.getFirstLinkpathDest(normalizedTemplatePath, "");
    return templateFile ? vault.cachedRead(templateFile) : "";
  } catch (err) {
    console.error(
      `Failed to read the daily note template '${normalizedTemplatePath}'`,
      err
    );
    new Notice("Failed to read the daily note template");
    return "";
  }
}

export async function getNoteCreationPath(
  app: App,
  filename: string,
  periodicConfig: PeriodicConfig
): Promise<string> {
  const directory = periodicConfig.folder ?? "";
  const filenameWithExt = !filename.endsWith(".md") ? `${filename}.md` : filename;

  const path = normalizePath(join(directory, filenameWithExt));
  await ensureFolderExists(app, path);
  return path;
}

// Credit: @creationix/path.js
export function join(...partSegments: string[]): string {
  // Split the inputs into a list of path commands.
  let parts: string[] = [];
  for (let i = 0, l = partSegments.length; i < l; i++) {
    parts = parts.concat(partSegments[i].split("/"));
  }
  // Interpret the path commands to get the new resolved path.
  const newParts = [];
  for (let i = 0, l = parts.length; i < l; i++) {
    const part = parts[i];
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === ".") continue;
    // Push new path segments.
    else newParts.push(part);
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === "") newParts.unshift("");
  // Turn back into a single string path.
  return newParts.join("/");
}

export function basename(fullPath: string): string {
  let base = fullPath.substring(fullPath.lastIndexOf("/") + 1);
  if (base.lastIndexOf(".") != -1) base = base.substring(0, base.lastIndexOf("."));
  return base;
}

async function ensureFolderExists(app: App, path: string): Promise<void> {
  const dirs = path.replace(/\\/g, "/").split("/");
  dirs.pop(); // remove basename

  if (dirs.length) {
    const dir = join(...dirs);
    if (!app.vault.getAbstractFileByPath(dir)) {
      await app.vault.createFolder(dir);
    }
  }
}

export function getRelativeDate(granularity: Granularity, date: Moment) {
  const today = window.moment().startOf("day");
  if (granularity == "week") {
    const thisWeek = window.moment().startOf(granularity);
    const fromNow = window.moment(date).diff(thisWeek, "week");
    if (fromNow === 0) {
      return "This week";
    } else if (fromNow === -1) {
      return "Last week";
    } else if (fromNow === 1) {
      return "Next week";
    }
    return window.moment.duration(fromNow, granularity).humanize(true);
  } else if (granularity === "day") {
    const fromNow = window.moment(date).from(today);
    return window.moment(date).calendar(null, {
      lastWeek: "[Last] dddd",
      lastDay: "[Yesterday]",
      sameDay: "[Today]",
      nextDay: "[Tomorrow]",
      nextWeek: "dddd",
      sameElse: function () {
        return "[" + fromNow + "]";
      },
    });
  } else {
    return date.format(HUMANIZE_FORMAT[granularity]);
  }
}

export function isIsoFormat(format: string): boolean {
  const cleanFormat = removeEscapedCharacters(format);
  return /w{1,2}/.test(cleanFormat);
}
