import { App, PopoverSuggest, TAbstractFile, TFile, TFolder } from "obsidian";

export class FileSuggest extends PopoverSuggest<TFile> {
  constructor(readonly app: App, readonly inputEl: HTMLInputElement) {
    super(app);
  }

  getSuggestions(inputStr: string): TFile[] {
    const abstractFiles = this.app.vault.getAllLoadedFiles();
    const files: TFile[] = [];
    const lowerCaseInputStr = inputStr.toLowerCase();

    abstractFiles.forEach((file: TAbstractFile) => {
      if (
        file instanceof TFile &&
        file.extension === "md" &&
        file.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        files.push(file);
      }
    });

    return files;
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TFile): void {
    this.inputEl.value = file.path;
    this.inputEl.trigger("input");
    this.close();
  }
}

export class FolderSuggest extends PopoverSuggest<TFolder> {
  constructor(readonly app: App, readonly inputEl: HTMLInputElement) {
    super(app);
  }

  getSuggestions(inputStr: string): TFolder[] {
    const abstractFiles = this.app.vault.getAllLoadedFiles();
    const folders: TFolder[] = [];
    const lowerCaseInputStr = inputStr.toLowerCase();

    abstractFiles.forEach((folder: TAbstractFile) => {
      if (
        folder instanceof TFolder &&
        folder.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        folders.push(folder);
      }
    });

    return folders;
  }

  renderSuggestion(file: TFolder, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TFolder): void {
    this.inputEl.value = file.path;
    this.inputEl.trigger("input");
    this.close();
  }
}
