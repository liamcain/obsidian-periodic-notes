import sortBy from "lodash/sortBy";
import { type Command, Notice, App, TFile } from "obsidian";
import type PeriodicNotesPlugin from "src";

import type { Granularity } from "./types";

interface IDisplayConfig {
  periodicity: string;
  relativeUnit: string;
  labelOpenPresent: string;
}

export const displayConfigs: Record<Granularity, IDisplayConfig> = {
  day: {
    periodicity: "daily",
    relativeUnit: "today",
    labelOpenPresent: "Open today's daily note",
  },
  week: {
    periodicity: "weekly",
    relativeUnit: "this week",
    labelOpenPresent: "Open this week's note",
  },
  month: {
    periodicity: "monthly",
    relativeUnit: "this month",
    labelOpenPresent: "Open this month's note",
  },
  quarter: {
    periodicity: "quarterly",
    relativeUnit: "this quarter",
    labelOpenPresent: "Open this quarter's note",
  },
  year: {
    periodicity: "yearly",
    relativeUnit: "this year",
    labelOpenPresent: "Open this years's note",
  },
};

async function openNextNote(
  app: App,
  plugin: PeriodicNotesPlugin,
  granularity: Granularity
): Promise<void> {
  const activeFile = app.workspace.getActiveFile();
  const config = displayConfigs[granularity];

  if (!activeFile) return;

  try {
    const allNotes = sortBy(Array.from(plugin.getCachedFiles().values()), [
      "canonicalDateStr",
    ]);
    const activeNoteIndex = allNotes.findIndex((m) => m.filePath === activeFile.path);

    const nextNoteMeta = allNotes[activeNoteIndex + 1];
    if (nextNoteMeta) {
      const file = app.vault.getAbstractFileByPath(nextNoteMeta.filePath);
      if (file && file instanceof TFile) {
        const leaf = app.workspace.getUnpinnedLeaf();
        await leaf.openFile(file, { active: true });
      }
    }
  } catch (err) {
    console.error(`failed to find your ${config.periodicity} notes folder`, err);
    new Notice(`Failed to find your ${config.periodicity} notes folder`);
  }
}

async function openPrevNote(
  app: App,
  plugin: PeriodicNotesPlugin,
  granularity: Granularity
): Promise<void> {
  const activeFile = app.workspace.getActiveFile();
  const config = displayConfigs[granularity];

  if (!activeFile) return;

  try {
    const allNotes = sortBy(Array.from(plugin.getCachedFiles().values()), [
      "canonicalDateStr",
    ]);
    const activeNoteIndex = allNotes.findIndex((m) => m.filePath === activeFile.path);

    const prevNoteMeta = allNotes[activeNoteIndex - 1];
    if (prevNoteMeta) {
      const file = app.vault.getAbstractFileByPath(prevNoteMeta.filePath);
      if (file && file instanceof TFile) {
        const leaf = app.workspace.getUnpinnedLeaf();
        await leaf.openFile(file, { active: true });
      }
    }
  } catch (err) {
    console.error(`failed to find your ${config.periodicity} notes folder`, err);
    new Notice(`Failed to find your ${config.periodicity} notes folder`);
  }
}

export function getCommands(
  app: App,
  plugin: PeriodicNotesPlugin,
  granularity: Granularity
): Command[] {
  const config = displayConfigs[granularity];

  return [
    {
      id: `open-${config.periodicity}-note`,
      name: config.labelOpenPresent,
      callback: () => plugin.openPeriodicNote(granularity, window.moment(), false),
    },

    {
      id: `next-${config.periodicity}-note`,
      name: `Open next ${config.periodicity} note`,
      checkCallback: (checking: boolean) => {
        const activeFile = app.workspace.getActiveFile();
        if (checking) {
          if (!activeFile) return false;
          const activeFileMeta = plugin.getFileMetadata(activeFile.path);
          return !!(activeFileMeta && activeFileMeta.granularity === granularity);
        }
        openNextNote(app, plugin, granularity);
      },
    },

    {
      id: `prev-${config.periodicity}-note`,
      name: `Open previous ${config.periodicity} note`,
      checkCallback: (checking: boolean) => {
        const activeFile = app.workspace.getActiveFile();
        if (checking) {
          if (!activeFile) return false;
          const activeFileMeta = plugin.getFileMetadata(activeFile.path);
          return !!(activeFileMeta && activeFileMeta.granularity === granularity);
        }
        openPrevNote(app, plugin, granularity);
      },
    },
  ];
}
