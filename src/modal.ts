import { App, Modal } from "obsidian";

import { openPeriodicNote, periodConfigs } from "./commands";
import type { IPeriodicity, ISettings } from "./settings";

export class PeriodicNoteCreateModal extends Modal {
  constructor(app: App, settings: ISettings) {
    super(app);

    this.contentEl.addClass("periodic-modal");
    this.contentEl.createEl("h2", { text: "Open Periodic Note" });

    ["daily", "weekly", "monthly"]
      .filter((periodicity) => settings[periodicity].enabled)
      .forEach((periodicity: IPeriodicity) => {
        const config = periodConfigs[periodicity];

        const noteExists = config.getNote(
          window.moment(),
          config.getAllNotes()
        );

        const template = settings[periodicity].template;

        this.contentEl.createDiv("setting-item", (rowEl) => {
          rowEl.createDiv("setting-item-info", (descEl) => {
            descEl.createDiv({
              text: `Create ${periodicity} note`,
              cls: "setting-item-name",
            });
            descEl.createDiv({
              cls: "setting-item-description",
              text: template
                ? `Using template from ${template}`
                : "No template found",
            });
          });

          rowEl.createDiv("setting-item-control", (controlEl) => {
            let button: HTMLButtonElement;
            if (noteExists) {
              button = controlEl.createEl("button", {
                text: `View ${config.relativeUnit}`,
                cls: "mod-cta",
              });
            } else {
              button = controlEl.createEl("button", {
                text: `Create ${config.relativeUnit}`,
              });
            }

            button.addEventListener("click", () => {
              openPeriodicNote(periodicity, window.moment(), false);
              this.close();
            });
          });
        });
      });
  }
}
