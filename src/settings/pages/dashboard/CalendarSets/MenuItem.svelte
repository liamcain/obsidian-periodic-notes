<script type="ts">
  import { App, Menu, setIcon } from "obsidian";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import capitalize from "lodash/capitalize";

  import Checkmark from "src/settings/components/Checkmark.svelte";
  import type { CalendarSet } from "src/types";
  import { granularities } from "src/types";
  import { displayConfigs } from "src/commands";
  import CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import type { ISettings } from "src/settings";
  import {
    createNewCalendarSet,
    deleteCalendarSet,
    setActiveSet,
  } from "src/settings/utils";

  export let app: App;
  export let viewDetails: () => void;
  export let calendarSet: CalendarSet;
  export let manager: CalendarSetManager;
  export let settings: Writable<ISettings>;

  let optionsEl: HTMLDivElement;
  let showEmptyState =
    granularities.filter((g) => calendarSet[g]?.enabled).length === 0;

  function deleteItem() {
    settings.update(deleteCalendarSet(calendarSet.id));
  }

  function setAsActive() {
    settings.update(setActiveSet(calendarSet.id));
  }

  function toggleOptionsMenu(evt: MouseEvent) {
    const menu = new Menu(app);

    if ($settings.activeCalendarSet !== calendarSet.id) {
      menu
        .addItem((item) =>
          item
            .setTitle("Set as active")
            .setIcon("check-circle-2")
            .onClick(setAsActive)
        )
        .addSeparator();
    }
    menu
      .addItem((item) =>
        item
          .setTitle("Duplicate calendar set")
          .setIcon("copy")
          .onClick(() => {
            const newCalendarSet = `${calendarSet.id} copy`;
            settings.update(createNewCalendarSet(newCalendarSet, calendarSet));
            router.navigate(["Periodic Notes", newCalendarSet], {
              shouldRename: true,
            });
          })
      )
      .addItem((item) =>
        item
          .setTitle("Delete calendar set")
          .setIcon("x")
          .setDisabled(manager.getCalendarSets().length === 1)
          .onClick(deleteItem)
      )
      .showAtMouseEvent(evt);
  }

  onMount(() => {
    setIcon(optionsEl, "more-vertical", 18);
  });
</script>

<div
  class="calendarset-container"
  class:active={calendarSet.id === $settings.activeCalendarSet}
  on:click={viewDetails}
>
  <div class="calendarset-titlebar">
    <h4 class="calendarset-name">{calendarSet.id}</h4>
    <div
      class="view-action"
      bind:this={optionsEl}
      on:click|stopPropagation={toggleOptionsMenu}
    />
  </div>
  <div class="included-types">
    {#each granularities as granularity}
      {#if calendarSet[granularity]?.enabled}
        <div class="included-type">
          <Checkmark />
          <span class="periodicity-text">
            {capitalize(displayConfigs[granularity].periodicity)} notes
          </span>
          {#if calendarSet[granularity]?.openAtStartup}
            <span class="badge">Opens at startup </span>
          {/if}
        </div>
      {/if}
    {/each}
    {#if showEmptyState}
      <div class="calendarset-empty-state">Not configured</div>
    {/if}
  </div>
</div>

<style type="scss">
  .calendarset-container {
    background: var(--background-primary-alt);
    border-radius: 16px;
    border: 1px solid var(--background-modifier-border);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 24px 28px;
    transition: 0.2s border-color ease-in;

    &.active {
      background: var(--text-selection);
      box-shadow: inset 0 0 0 1px var(--text-accent);

      &:hover {
        border-color: var(--interactive-accent);
        box-shadow: inset 0 0 0 1px var(--text-accent-hover);
      }
    }

    &:hover {
      border-color: var(--interactive-accent);
    }
  }

  .calendarset-titlebar {
    align-items: center;
    display: flex;
    justify-content: space-between;

    .view-action {
      margin-right: 0;
      padding: 2px;
    }
  }

  .calendarset-name {
    font-weight: 600;
    letter-spacing: 0.25px;
    margin: 0;
  }

  .periodicity-text {
    margin-left: 0.4em;
  }

  .badge {
    background: var(--interactive-accent);
    border-radius: 6px;
    color: var(--text-on-accent);
    font-size: 70%;
    margin-left: 0.8em;
    padding: 0.1em 0.5em;
    line-height: 20px;
  }

  .included-types {
    margin-top: 24px;
  }

  .included-type {
    display: flex;
    align-items: baseline;
    margin-top: 6px;

    &:first-of-type {
      margin-top: 0;
    }
  }

  .calendarset-empty-state {
    color: var(--text-faint);
    font-style: italic;
  }
</style>
