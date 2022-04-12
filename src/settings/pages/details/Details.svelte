<script lang="ts">
  import type { App } from "obsidian";
  import { Menu, setIcon } from "obsidian";
  import type CalendarSetManager from "src/calendarSetManager";
  import type { ISettings } from "src/settings";
  import { router } from "src/settings/stores";
  import {
    createNewCalendarSet,
    deleteCalendarSet,
    setActiveSet,
  } from "src/settings/utils";

  import { granularities } from "src/types";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import PeriodicGroup from "./PeriodicGroup.svelte";

  export let app: App;
  export let settings: Writable<ISettings>;
  export let manager: CalendarSetManager;
  export let selectedCalendarSet: string;

  let nameEl: HTMLDivElement;
  let optionsEl: HTMLDivElement;
  let calendarsetName = selectedCalendarSet;
  let isActive = selectedCalendarSet === manager.getActiveId();
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

    if (!isActive) {
      menu
        .addItem((item) =>
          item
            .setTitle("Set as active")
            .setIcon("check-circle-2")
            .onClick(() => {
              settings.update(setActiveSet(selectedCalendarSet));
              isActive = true;
            })
        )
        .addSeparator();
    }
    menu
      .addItem((item) =>
        item
          .setTitle("Duplicate calendar set")
          .setIcon("copy")
          .onClick(() => {
            const calendarSet = manager
              .getCalendarSets()
              .find((c) => c.id === selectedCalendarSet);
            const newCalendarSet = `${selectedCalendarSet} copy`;
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
          .onClick(() => {
            deleteCalendarSet(selectedCalendarSet)($settings);
            router.navigate(["Periodic Notes"]);
          })
      )
      .showAtMouseEvent(evt);
  }

  function focusEditableEl(el: HTMLDivElement) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  onMount(() => {
    setIcon(optionsEl, "more-vertical", 18);
    document.getElementsByClassName("vertical-tab-content")[0].scroll(0, 0);

    if ($router.eState["shouldRename"]) {
      focusEditableEl(nameEl);
    }
  });
</script>

<div class="calendarset-titlebar">
  <div
    class="calendarset-title"
    contenteditable="true"
    bind:innerHTML={calendarsetName}
    bind:this={nameEl}
    on:blur={tryToRename}
    on:keypress={submitOnEnter}
  />
  <div class="calendarset-toolbar">
    {#if isActive}
      <div class="active-calendarset-badge">Active</div>
    {/if}
    <div
      class="view-action"
      bind:this={optionsEl}
      on:click={toggleOptionsMenu}
    />
  </div>
</div>
{#if errorMsg}
  <div class="calendarset-error">{errorMsg}</div>
{/if}

<div class="calendarset-groups">
  {#each granularities as granularity}
    <PeriodicGroup
      {app}
      {granularity}
      {settings}
      calendarSetId={selectedCalendarSet}
    />
  {/each}
</div>

<style lang="scss">
  .calendarset-titlebar {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .calendarset-title {
    font-size: 1.6em;
    min-width: 100px;
  }

  .calendarset-error {
    color: var(--text-error);
  }

  .calendarset-groups {
    margin-top: 2em;
  }

  .calendarset-toolbar {
    align-items: center;
    display: flex;
    gap: 8px;

    .view-action {
      padding: 2px;
    }
  }

  .active-calendarset-badge {
    background-color: var(--background-primary);
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border);
    color: var(--text-accent);
    font-size: 0.6em;
    font-weight: 600;
    letter-spacing: 0.25px;
    padding: 0.2em 0.8em;
    text-transform: uppercase;
  }
</style>
