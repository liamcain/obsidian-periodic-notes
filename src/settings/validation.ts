function isValidFilename(filename: string) {
  const allowedChars = /^[a-z0-9_.@()-/\s[\]]+$/i;
  const startsWithDot = /^\./; // cannot start with dot (.)
  const forbiddenWindowsFilenames = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return (
    allowedChars.test(filename) &&
    !startsWithDot.test(filename) &&
    !forbiddenWindowsFilenames.test(filename)
  );
}

export function validateFormat(format: string): string {
  if (!format) {
    return "";
  }

  if (!isValidFilename(format)) {
    return "Format contains illegal characters";
  }
}

export function validateTemplate(template: string): string {
  if (!template) {
    return "";
  }

  const { metadataCache } = window.app;
  const file = metadataCache.getFirstLinkpathDest(template, "");
  if (!file) {
    return "Template file not found";
  }

  return "";
}

export function validateFolder(folder: string): string {
  if (!folder || folder === "/") {
    return "";
  }

  const { metadataCache } = window.app;
  const file = metadataCache.getFirstLinkpathDest(folder, "");
  if (!file) {
    return "Folder not found in vault";
  }

  return "";
}
