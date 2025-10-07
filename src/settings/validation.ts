import { App, normalizePath, TFile } from "obsidian";
import type { Granularity } from "src/types";

export function removeEscapedCharacters(format: string): string {
  const withoutBrackets = format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets

  return withoutBrackets.replace(/\\./g, "");
}

function pathWithoutExtension(file: TFile): string {
  const extLen = file.extension.length + 1;
  return file.path.slice(0, -extLen);
}

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

  if (granularity === "day") {
    const testFormattedDate = window.moment().format(format);
    const parsedDate = window.moment(testFormattedDate, format, true);

    if (!parsedDate.isValid()) {
      return "Failed to parse format";
    }
  }

  return "";
}

export function validateFormatComplexity(
  format: string,
  granularity: Granularity
): "valid" | "fragile-basename" | "loose-parsing" {
  const testDate = window.moment().startOf(granularity);
  const testFormattedDate = testDate.format(format);
  const parsedDate = window.moment(testFormattedDate, format, true);
  if (!parsedDate.isValid()) {
    return "loose-parsing";
  }

  // check that the proposed format produces a unique string at least through
  // the next 1000 periods ¯\_(ツ)_/¯
  var date = testDate.clone();
  var formattedDates = { [testFormattedDate]: testDate.clone() };
  for (let i = 0; i < 1000; i++) {
    date = date.add(1, granularity);
    const datef = date.format(format);
    if (datef in formattedDates) {
      console.log("found two periods that produce the same output from the given format string. date 1: %s, date 2: %s, format string: '%s', formatted date: '%s'", date.toISOString(), formattedDates[datef].toISOString(), format, datef);
      return "fragile-basename"
    }
    formattedDates[datef] = date.clone();
  }

  return "valid";
}

export function getDateInput(
  file: TFile,
  format: string,
  granularity: Granularity
): string {
  // pseudo-intelligently find files when the format is YYYY/MM/DD for example
  if (validateFormatComplexity(format, granularity) === "fragile-basename") {
    const fileName = pathWithoutExtension(file);
    const strippedFormat = removeEscapedCharacters(format);
    const nestingLvl = (strippedFormat.match(/\//g)?.length ?? 0) + 1;
    const pathParts = fileName.split("/");
    return pathParts.slice(-nestingLvl).join("/");
  }
  return file.basename;
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
