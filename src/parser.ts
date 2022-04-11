import type { Moment } from "moment";

import type { Granularity } from "./types";

interface ParseData {
  granularity: Granularity;
  date: Moment;
}

// TODO rename these to remove 'prefix'
const FULL_DATE_PREFIX = /(\d{4})[-.]?(0[1-9]|1[0-2])[-.]?(0[1-9]|[12][0-9]|3[01])/;
const MONTH_PREFIX = /(\d{4})[-.]?(0[1-9]|1[0-2])/;
// const WEEK_PREFIX = /(\d{4})[-. ]?W(\d{2})/;
const YEAR_PREFIX = /(\d{4})/;

export function getLooselyMatchedDate(inputStr: string): ParseData | null {
  // TODO: include 'unparsed characters' in match data
  // to show what _isn't_ a date/timestamp
  const fullDateExp = FULL_DATE_PREFIX.exec(inputStr);
  if (fullDateExp) {
    return {
      date: window.moment({
        day: Number(fullDateExp[3]),
        month: Number(fullDateExp[2]) - 1,
        year: Number(fullDateExp[1]),
      }),
      granularity: "day",
    };
  }

  const monthDateExp = MONTH_PREFIX.exec(inputStr);
  if (monthDateExp) {
    return {
      date: window.moment({
        day: 1,
        month: Number(monthDateExp[2]) - 1,
        year: Number(monthDateExp[1]),
      }),
      granularity: "month",
    };
  }

  // TODO: This should probably _always_ be ISO, but that could cause issues for
  // users not using ISO.

  // const weekDateExp = WEEK_PREFIX.exec(inputStr);
  // if (weekDateExp) {
  //   return {
  //     date: window.moment({
  //       week: Number(weekDateExp[2]),
  //       year: Number(weekDateExp[1]),
  //     }),
  //     granularity: "month",
  //   };
  // }

  const yearExp = YEAR_PREFIX.exec(inputStr);
  if (yearExp) {
    return {
      date: window.moment({
        day: 1,
        month: 0,
        year: Number(yearExp[1]),
      }),
      granularity: "year",
    };
  }

  return null;
}
