export const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
export const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
export const DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
export const DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";

export const DEFAULT_FORMAT = Object.freeze({
  day: DEFAULT_DAILY_NOTE_FORMAT,
  week: DEFAULT_WEEKLY_NOTE_FORMAT,
  month: DEFAULT_MONTHLY_NOTE_FORMAT,
  quarter: DEFAULT_QUARTERLY_NOTE_FORMAT,
  year: DEFAULT_YEARLY_NOTE_FORMAT,
});

export const HUMANIZE_FORMAT = Object.freeze({
  month: "MMMM YYYY",
  quarter: "YYYY Q[Q]",
  year: "YYYY",
});
