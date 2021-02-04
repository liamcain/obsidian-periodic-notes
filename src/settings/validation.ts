import { normalizePath } from "obsidian";

function isValidFilename(filename: string) {
  const rg1 = /^[a-z0-9_.@()-/]+$/i;
  const rg2 = /^\./; // cannot start with dot (.)
  const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return rg1.test(filename) && !rg2.test(filename) && !rg3.test(filename);
}

export function validateFormat(format: string): string {
  if (!isValidFilename(format)) {
    return "Format contains illegal characters";
  }
}

export function validateTemplate(template: string): string {
  if (!template) {
    return "";
  }

  const { metadataCache } = window.app;
  const file = metadataCache.getFirstLinkpathDest(normalizePath(template), "");
  if (!file) {
    return "Template file not found";
  }

  return "";
}

export function validateFolder(folder: string): string {
  if (!folder) {
    return "";
  }

  const { metadataCache } = window.app;
  const file = metadataCache.getFirstLinkpathDest(normalizePath(folder), "");
  if (!file) {
    return "Folder not found in vault";
  }

  return "";
}
