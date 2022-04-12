<script lang="ts">
  import type { Moment } from "moment";
  import { fly } from "svelte/transition";

  import type {
    PeriodicNoteCachedMetadata,
    PeriodicNotesCache,
  } from "src/cache";
  import PeriodicNotesPlugin from "src/main";
  import { MarkdownView } from "obsidian";
  import { onMount } from "svelte";
  import type { Granularity } from "src/types";
  import { getRelativeDate } from "src/utils";
  import RelativeIcon from "./RelativeIcon.svelte";

  export let plugin: PeriodicNotesPlugin;
  export let cache: PeriodicNotesCache;
  export let view: MarkdownView;

  let showTimeline: boolean;
  let weekDays: Moment[];
  let today = window.moment();
  let periodicData: PeriodicNoteCachedMetadata | null;
  let relativeDataStr: string;

  let settings = plugin.settings;
  let showComplication = $settings.enableTimelineComplication;

  $: {
    periodicData = cache.find(view.file?.path);

    if (periodicData) {
      weekDays = generateWeekdays(today, periodicData.date);
      relativeDataStr = getRelativeDate(
        periodicData.granularity,
        periodicData.date
      );
    }
  }

  function generateWeekdays(_today: Moment, selectedDate: Moment) {
    let days: Moment[] = [];
    let startOfWeek = selectedDate.clone().startOf("week");
    let dayIter = startOfWeek.clone();
    for (let i = 0; i < 7; i++) {
      days.push(dayIter.clone());
      dayIter = dayIter.add(1, "day");
    }
    return days;
  }

  async function openPeriodicNoteInView(
    granularity: Granularity,
    date: Moment
  ) {
    let file = cache.getPeriodicNote(
      plugin.calendarSetManager.getActiveId(),
      granularity,
      date
    );
    if (!file) {
      file = await plugin.createPeriodicNote(granularity, date);
    }
    await view.leaf.openFile(file, { active: true });
  }

  function updateComplicationVisibility() {
    showComplication = $settings.enableTimelineComplication;
  }

  function toggleCalendarVisibility() {
    showTimeline = !showTimeline;
  }

  function updateView() {
    periodicData = cache.find(view.file?.path);

    if (periodicData) {
      weekDays = generateWeekdays(today, periodicData.date);
      relativeDataStr = getRelativeDate(
        periodicData.granularity,
        periodicData.date
      );
    }
  }

  onMount(() => {
    plugin.registerEvent(plugin.app.workspace.on("file-open", updateView));
    plugin.registerEvent(
      plugin.app.workspace.on("periodic-notes:resolve", updateView)
    );
    plugin.registerEvent(
      plugin.app.workspace.on(
        "periodic-notes:settings-updated",
        updateComplicationVisibility
      )
    );
  });
</script>

{#if showComplication && periodicData}
  <div class="timeline-container">
    <div class="leaf-periodic-button" on:click={toggleCalendarVisibility}>
      {#if periodicData.matchData.exact === false}
        <RelativeIcon />
      {/if}
      {relativeDataStr}
    </div>
    {#if showTimeline}
      <div class="timeline-view" in:fly={{ x: 8 }} out:fly={{ x: 8 }}>
        {#each weekDays as weekDay}
          <div
            class="timeline-weekday"
            class:is-selected={weekDay.isSame(periodicData.date, "day")}
            class:is-today={weekDay.isSame(today, "day")}
          >
            <div class="timeline-day-of-week">
              {weekDay.format("ddd")}
            </div>
            <div
              class="timeline-day"
              on:click={() => openPeriodicNoteInView("day", weekDay)}
            >
              {weekDay.format("DD")}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .timeline-container {
    align-items: flex-end;
    flex-direction: column;
    display: flex;
    gap: 12px;
    height: 56px;
    position: absolute;
    right: 26px;
    top: 56px;
    z-index: 1;

    :global(.native-scrollbars) & {
      right: 16px;
    }
  }

  .leaf-periodic-button {
    background: var(--background-secondary);
    border-radius: 6px;
    border: 1px solid transparent;
    box-shadow: 0 0 1px var(--background-modifier-box-shadow);
    color: var(--text-accent);
    cursor: pointer;
    font-size: 0.7em;
    font-weight: 600;
    letter-spacing: 0.4px;
    padding: 0.3em 0.9em;
    text-transform: uppercase;
    transition: 0.2s border-color ease-in;

    &:hover {
      border-color: var(--background-modifier-border);
    }
  }

  .timeline-view {
    display: flex;
    background-color: var(--background-primary);
    gap: 6px;
  }

  .timeline-weekday {
    display: flex;
    font-size: 0.7em;
    flex-direction: column;
    text-align: center;
  }

  .timeline-day {
    border: 1px solid transparent;
    border-radius: 50%;
    height: 28px;
    line-height: 26px;
    width: 28px;

    &:hover {
      border-color: var(--background-modifier-border);
    }

    .is-selected & {
      background-color: var(--background-secondary);
    }

    .is-today & {
      color: var(--text-accent);
      font-weight: 600;
    }
  }

  .timeline-day-of-week {
    color: var(--text-muted);
    font-size: 0.9em;
    font-weight: 600;
    letter-spacing: 0.2px;

    .is-selected & {
      color: var(--text-normal);
    }
  }
</style>
