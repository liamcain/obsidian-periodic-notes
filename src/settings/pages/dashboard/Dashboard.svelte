<script lang="ts">
  import type { App } from "obsidian";
  import { onDestroy } from "svelte";
  import { writable } from "svelte/store";

  import CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import type { ISettings } from "src/settings/index";
  import { getLegacyDailyNoteSettings } from "src/utils";

  import GettingStartedBanner from "./GettingStartedBanner.svelte";
  import CalendarSetMenuItem from "./CalendarSets/MenuItem.svelte";
  import Footer from "../../components/Footer.svelte";

  export let app: App;
  export let manager: CalendarSetManager;
  export let settings: ISettings;
  export let onUpdateSettings: (newSettings: ISettings) => void;

  let settingsStore = writable(settings);

  const unsubscribeFromSettings = settingsStore.subscribe(onUpdateSettings);

  function migrateDailyNoteSettings(): void {
    const dailyNoteSettings = getLegacyDailyNoteSettings(app);
    settingsStore.update((old) => ({
      ...old,
      ...{
        daily: { ...dailyNoteSettings, enabled: true },
        hasMigratedDailyNoteSettings: true,
      },
    }));
  }

  onDestroy(() => {
    unsubscribeFromSettings();
  });
</script>

{#if $settingsStore.showGettingStartedBanner}
  <GettingStartedBanner
    {app}
    {migrateDailyNoteSettings}
    settings={settingsStore}
    handleTeardown={() => {
      $settingsStore.showGettingStartedBanner = false;
    }}
  />
{/if}

<h3 class="section-title">Calendar Sets</h3>
<div class="calendarset-container">
  {#each manager.getCalendarSets() as calendarSet}
    <CalendarSetMenuItem
      {calendarSet}
      viewDetails={() => router.navigate(["Periodic Notes", calendarSet.id])}
    />
  {/each}
</div>
<Footer />

<style>
  .calendarset-container {
    display: flex;
    flex-wrap: wrap;
  }

  .section-title {
    margin: 2em 0 0.8em;
  }
</style>
