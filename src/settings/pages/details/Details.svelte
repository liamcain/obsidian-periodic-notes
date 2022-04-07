<script lang="ts">
  import cloneDeep from "lodash/cloneDeep";
  import type { App } from "obsidian";
  import { Menu, setIcon } from "obsidian";
  import type CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";

  import { granularities } from "src/types";
  import { onMount } from "svelte";
  import PeriodicGroup from "./PeriodicGroup.svelte";

  export let app: App;
  export let manager: CalendarSetManager;
  export let selectedCalendarSet: string;

  let optionsEl: HTMLDivElement;
  let calendarsetName = selectedCalendarSet;
  let errorMsg = "";

  function tryToRename(e: FocusEvent) {
    const proposedName = (e.target as HTMLDivElement).innerHTML.trim();
    try {
      manager.renameCalendarset(selectedCalendarSet, proposedName);

      router.navigate(["Periodic Notes", proposedName]);
    } catch (err) {
      errorMsg = err.toString();
      (e.target as HTMLDivElement).focus();
    }
  }

  function submitOnEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLDivElement).blur();
    }
  }

  function toggleOptionsMenu(evt: MouseEvent) {
    const menu = new Menu(app);
    menu
      .addItem((item) =>
        item
          .setTitle("Set as active")
          .setIcon("x")
          .onClick(() => {
            manager.setActiveSet(selectedCalendarSet);
          })
      )
      .addSeparator()
      .addItem((item) =>
        item
          .setTitle("Duplicate calendar set")
          .setIcon("copy")
          .onClick(() => {
            const calendarSet = manager
              .getCalendarSets()
              .find((c) => c.id === selectedCalendarSet);
            const newCalendarSet = `${selectedCalendarSet} copy`;
            manager.createNewCalendarSet(
              newCalendarSet,
              cloneDeep(calendarSet)
            );
            router.navigate(["Periodic Notes", newCalendarSet]);
          })
      )
      .addItem((item) =>
        item
          .setTitle("Delete calendar set")
          .setIcon("x")
          .onClick(() => {
            manager.deleteCalendarSet(selectedCalendarSet);
            router.navigate(["Periodic Notes"]);
          })
      )
      .showAtMouseEvent(evt);
  }

  onMount(() => {
    setIcon(optionsEl, "more-vertical", 18);
    document.getElementsByClassName("vertical-tab-content")[0].scroll(0, 0);
  });
</script>

<div class="calendarset-titlebar">
  <div
    class="calendarset-title"
    contenteditable="true"
    bind:innerHTML={calendarsetName}
    on:blur={tryToRename}
    on:keypress={submitOnEnter}
  />
  <div class="view-action" bind:this={optionsEl} on:click={toggleOptionsMenu} />
</div>
{#if errorMsg}
  <div class="calendarset-error">{errorMsg}</div>
{/if}

<div class="calendarset-groups">
  {#each granularities as granularity}
    <PeriodicGroup
      {app}
      {manager}
      {granularity}
      calendarSet={selectedCalendarSet}
    />
  {/each}
</div>

<style>
  .calendarset-titlebar {
    display: flex;
    justify-content: space-between;
  }

  .calendarset-title {
    font-size: 1.6em;
  }

  .calendarset-error {
    color: var(--text-error);
  }

  .calendarset-groups {
    margin-top: 2em;
  }
</style>
