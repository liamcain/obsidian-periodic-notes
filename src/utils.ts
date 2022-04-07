import type { Moment } from "moment";
import {
  normalizePath,
  App,
  Notice,
  Platform,
  DailyNotesPlugin,
  type DailyNotesSettings,
} from "obsidian";

import type { PeriodicConfig } from "./types";

export const wrapAround = (value: number, size: number): number => {
  return ((value % size) + size) % size;
};

// function getCalendarPlugin(app: App): CalendarPlugin {
//   return app.plugins.getPlugin("calendar") as CalendarPlugin;
// }

function getDailyNotesPlugin(app: App): DailyNotesPlugin | null {
  const installedPlugin = app.internalPlugins.getPluginById("daily-notes");
  if (installedPlugin && installedPlugin.instance instanceof DailyNotesPlugin) {
    return installedPlugin.instance;
  }
  return null;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function hasLegacyDailyNoteSettings(app: App): boolean {
  const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
  if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
    return false;
  }

  const options = getDailyNotesPlugin(app)?.options;
  return !!(options?.format || options?.folder || options?.template);
}

export function getLegacyDailyNoteSettings(app: App): DailyNotesSettings {
  const dailyNotesInstalledPlugin = app.internalPlugins.plugins["daily-notes"];
  if (!dailyNotesInstalledPlugin) {
    return {
      folder: "",
      template: "",
      format: "",
    };
  }

  const dailyNotesPlugin = dailyNotesInstalledPlugin.instance as DailyNotesPlugin;
  const options = dailyNotesPlugin.options || {};
  return {
    format: options.format,
    folder: options.folder?.trim(),
    template: options.template?.trim(),
  };
}

// export function hasLegacyWeeklyNoteSettings(app: App): boolean {
//   const calendarPlugin = getCalendarPlugin(app);
//   if (!calendarPlugin) {
//     return false;
//   }

//   const options = calendarPlugin.options || ({} as IWeeklyNoteOptions);
//   return !!(
//     options.weeklyNoteFormat ||
//     options.weeklyNoteFolder ||
//     options.weeklyNoteTemplate
//   );
// }

// export function getLegacyWeeklyNoteSettings(app: App): IPeriodicNoteSettings {
//   const options = getCalendarPlugin(app).options || ({} as IWeeklyNoteOptions);
//   return {
//     format: options.weeklyNoteFormat || "",
//     folder: options.weeklyNoteFolder?.trim() || "",
//     template: options.weeklyNoteTemplate?.trim() || "",
//   };
// }

export function isMetaPressed(e: MouseEvent): boolean {
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

export async function getTemplateContents(
  app: App,
  periodicConfig: PeriodicConfig
): Promise<string> {
  const { metadataCache, vault } = app;
  const templatePath = normalizePath(periodicConfig.templatePath ?? "");
  if (templatePath === "/") {
    return Promise.resolve("");
  }

  try {
    const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
    return templateFile ? vault.cachedRead(templateFile) : "";
  } catch (err) {
    console.error(`Failed to read the daily note template '${templatePath}'`, err);
    new Notice("Failed to read the daily note template");
    return "";
  }
}

export async function getNoteCreationPath(
  app: App,
  filename: string,
  periodicConfig: PeriodicConfig
): Promise<string> {
  const directory = periodicConfig.folder;
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
