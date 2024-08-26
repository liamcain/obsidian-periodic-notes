import PeriodicNotesPlugin from "./main"
import { Granularity } from "./types"


export default class PeriodicNotesAPI {
  static instance: PeriodicNotesAPI

  public static get(plugin: PeriodicNotesPlugin) {
    return {
      getGranularities() {
        return plugin.calendarSetManager.getActiveGranularities()
      },
      async createPeriodicNote(granularity: Granularity, openNote = false, date = window.moment()) {
        await plugin.createOrReturnPeriodicNote(
          granularity,
          date
        );

        if(openNote) {
          plugin.openPeriodicNote(granularity, date)
        }
      },
      getPeriodicNote(granularity: Granularity, date = window.moment()) {
        return plugin.getPeriodicNote(
          granularity,
          date
        );
      }
    }
  }
}
