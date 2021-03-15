import type { Moment } from "moment";
import { Command, MarkdownView, Notice, TFile } from "obsidian";
import {
  createDailyNote,
  createMonthlyNote,
  createWeeklyNote,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllWeeklyNotes,
  getDailyNote,
  getDateFromFile,
  getMonthlyNote,
  getWeeklyNote,
} from "obsidian-daily-notes-interface";

import type { IPeriodicity } from "src/settings";
import { orderedValues } from "src/utils";

interface IPeriodConfig {
  unitOfTime: "day" | "week" | "month";
  createNote: (date: Moment) => Promise<TFile>;
  getNote: (date: Moment, allFiles: Record<string, TFile>) => TFile;
  getAllNotes: () => Record<string, TFile>;
}

const periodConfigs: Record<IPeriodicity, IPeriodConfig> = {
  daily: {
    unitOfTime: "day",
    createNote: createDailyNote,
    getNote: getDailyNote,
    getAllNotes: getAllDailyNotes,
  },
  weekly: {
    unitOfTime: "week",
    createNote: createWeeklyNote,
    getNote: getWeeklyNote,
    getAllNotes: getAllWeeklyNotes,
  },
  monthly: {
    unitOfTime: "month",
    createNote: createMonthlyNote,
    getNote: getMonthlyNote,
    getAllNotes: getAllMonthlyNotes,
  },
};

export async function openPeriodicNote(
  periodicity: IPeriodicity,
  date: Moment,
  inNewSplit: boolean
): Promise<void> {
  const config = periodConfigs[periodicity];
  const startOfPeriod = date.clone().startOf(config.unitOfTime);

  let allNotes: Record<string, TFile>;
  try {
    allNotes = config.getAllNotes();
  } catch (err) {
    console.error(`failed to find your ${periodicity} notes folder`, err);
    new Notice(`Failed to find your ${periodicity} notes folder`);
    return;
  }

  let periodicNote = config.getNote(startOfPeriod, allNotes);
  if (!periodicNote) {
    periodicNote = await config.createNote(startOfPeriod);
  }
  await openFile(periodicNote, inNewSplit);
}

function getActiveFile(): TFile | null {
  const { workspace } = window.app;
  const activeView = workspace.getActiveViewOfType(MarkdownView);
  return activeView?.file;
}

async function openFile(file: TFile, inNewSplit: boolean): Promise<void> {
  const { workspace } = window.app;
  const leaf = inNewSplit
    ? workspace.splitActiveLeaf()
    : workspace.getUnpinnedLeaf();

  await leaf.openFile(file);
}

async function openNextNote(periodicity: IPeriodicity): Promise<void> {
  const config = periodConfigs[periodicity];
  const activeFile = getActiveFile();

  try {
    const allNotes = orderedValues(config.getAllNotes());
    const activeNoteIndex = allNotes.findIndex((file) => file === activeFile);

    const nextNote = allNotes[activeNoteIndex + 1];
    if (nextNote) {
      await openFile(nextNote, false);
    }
  } catch (err) {
    console.error(`failed to find your ${periodicity} notes folder`, err);
    new Notice(`Failed to find your ${periodicity} notes folder`);
  }
}

async function openPrevNote(periodicity: IPeriodicity): Promise<void> {
  const config = periodConfigs[periodicity];
  const activeFile = getActiveFile();

  try {
    const allNotes = orderedValues(config.getAllNotes());
    const activeNoteIndex = allNotes.findIndex((file) => file === activeFile);

    const prevNote = allNotes[activeNoteIndex - 1];
    if (prevNote) {
      await openFile(prevNote, false);
    }
  } catch (err) {
    console.error(`failed to find your ${periodicity} notes folder`, err);
    new Notice(`Failed to find your ${periodicity} notes folder`);
  }
}

export function getCommands(periodicity: IPeriodicity): Command[] {
  const config = periodConfigs[periodicity];

  return [
    {
      id: `open-${periodicity}-note`,
      name: `Open ${periodicity} note`,
      callback: () => openPeriodicNote(periodicity, window.moment(), false),
    },

    {
      id: `next-${periodicity}-note`,
      name: `Open next ${periodicity} note`,
      checkCallback: (checking: boolean) => {
        if (checking) {
          const activeFile = getActiveFile();
          return !!(
            activeFile && getDateFromFile(activeFile, config.unitOfTime)
          );
        }
        openNextNote(periodicity);
      },
    },

    {
      id: `prev-${periodicity}-note`,
      name: `Open previous ${periodicity} note`,
      checkCallback: (checking: boolean) => {
        if (checking) {
          const activeFile = getActiveFile();
          return !!(
            activeFile && getDateFromFile(activeFile, config.unitOfTime)
          );
        }
        openPrevNote(periodicity);
      },
    },
  ];
}
