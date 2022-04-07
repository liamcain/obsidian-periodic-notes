<script lang="ts">
  import { App, setIcon } from "obsidian";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  import CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import type { ISettings } from "src/settings/index";
  // import { getLegacyDailyNoteSettings } from "src/utils";

  // import GettingStartedBanner from "./GettingStartedBanner.svelte";
  import CalendarSetMenuItem from "./CalendarSets/MenuItem.svelte";
  import Footer from "src/settings/components/Footer.svelte";
  import SettingItem from "src/settings/components/SettingItem.svelte";
  import Toggle from "src/settings/components/Toggle.svelte";
  import { createNewCalendarSet } from "src/settings/utils";

  export let app: App;
  export let manager: CalendarSetManager;
  export let settings: Writable<ISettings>;
  // export let onUpdateSettings: (newSettings: ISettings) => void;

  let addEl: HTMLElement;

  // function migrateDailyNoteSettings(): void {
  //   const dailyNoteSettings = getLegacyDailyNoteSettings(app);
  //   settingsStore.update((old) => ({
  //     ...old,
  //     ...{
  //       daily: { ...dailyNoteSettings, enabled: true },
  //       hasMigratedDailyNoteSettings: true,
  //     },
  //   }));
  // }

  function addCalendarset(): void {
    let iter = 1;
    const calSets = $settings.calendarSets;
    while (calSets.find((set) => set.id === `Calendar set ${iter}`)) {
      iter++;
    }
    const id = `Calendar set ${iter}`;
    settings.update(createNewCalendarSet(id));
    router.navigate(["Periodic Notes", id], {
      shouldRename: true,
    });
  }

  onMount(() => {
    setIcon(addEl, "plus", 16);
  });
</script>

<!-- {#if $settingsStore.showGettingStartedBanner}
  <GettingStartedBanner
    {app}
    {migrateDailyNoteSettings}
    settings={settingsStore}
    handleTeardown={() => {
      $settingsStore.showGettingStartedBanner = false;
    }}
  />
{/if} -->

<div class="section-nav">
  <h3 class="section-title">Calendar Sets</h3>
  <div class="clickable-icon" bind:this={addEl} on:click={addCalendarset} />
</div>
<div class="calendarset-container">
  {#each $settings.calendarSets as calendarSet}
    <CalendarSetMenuItem
      {app}
      {calendarSet}
      {manager}
      {settings}
      viewDetails={() => router.navigate(["Periodic Notes", calendarSet.id])}
    />
  {/each}
</div>

<SettingItem
  name="Show “Timeline” complication on periodic notes"
  description="Adds a collapsible timeline to the top-right of all periodic notes"
  type="toggle"
  isHeading={false}
>
  <Toggle
    slot="control"
    isEnabled={$settings.enableTimelineComplication}
    onChange={(val) => {
      $settings.enableTimelineComplication = val;
    }}
  />
</SettingItem>

<Footer />

<style>
  .calendarset-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    padding-bottom: 1.4em;
  }

  .section-title {
    margin: 0;
  }

  .section-nav {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 2em 0 0.8em;
  }
</style>
