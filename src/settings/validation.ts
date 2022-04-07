import { App, normalizePath } from "obsidian";
import type { Granularity } from "src/types";

export function getBasename(format: string): string {
  const isTemplateNested = format.indexOf("/") !== -1;
  return isTemplateNested ? format.split("/").pop() ?? "" : format;
}

function isValidFilename(filename: string): boolean {
  const illegalRe = /[?<>\\:*|"]/g;
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

  return (
    !illegalRe.test(filename) &&
    !controlRe.test(filename) &&
    !reservedRe.test(filename) &&
    !windowsReservedRe.test(filename)
  );
}

export function validateFormat(format: string, granularity: Granularity): string {
  if (!format) {
    return "";
  }

  if (!isValidFilename(format)) {
    return "Format contains illegal characters";
  }

  if (
    granularity === "day" &&
    !["m", "d", "y"].every(
      (requiredChar) =>
        getBasename(format)
          .replace(/\[[^\]]*\]/g, "") // remove everything within brackets
          .toLowerCase()
          .indexOf(requiredChar) !== -1
    )
  ) {
    return "Filename must be unique";
  }
}

export function validateTemplate(app: App, template: string): string {
  if (!template) {
    return "";
  }

  const file = app.metadataCache.getFirstLinkpathDest(template, "");
  if (!file) {
    return "Template file not found";
  }

  return "";
}

export function validateFolder(app: App, folder: string): string {
  if (!folder || folder === "/") {
    return "";
  }

  if (!app.vault.getAbstractFileByPath(normalizePath(folder))) {
    return "Folder not found in vault";
  }

  return "";
}
