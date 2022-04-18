<script lang="ts">
  import { App, setIcon } from "obsidian";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  import CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import type { ISettings } from "src/settings/index";
  import Dropdown from "src/settings/components/Dropdown.svelte";
  import Footer from "src/settings/components/Footer.svelte";
  import SettingItem from "src/settings/components/SettingItem.svelte";
  import Toggle from "src/settings/components/Toggle.svelte";
  import {
    createNewCalendarSet,
    getLocaleOptions,
    getWeekStartOptions,
  } from "src/settings/utils";
  import {
    configureGlobalMomentLocale,
    type ILocalizationSettings,
  } from "src/settings/localization";

  import GettingStartedBanner from "./GettingStartedBanner.svelte";
  import CalendarSetMenuItem from "./CalendarSets/MenuItem.svelte";

  export let app: App;
  export let manager: CalendarSetManager;
  export let localization: Writable<ILocalizationSettings>;
  export let settings: Writable<ISettings>;

  let addEl: HTMLElement;

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

{#if $settings.showGettingStartedBanner}
  <GettingStartedBanner
    {app}
    handleTeardown={() => {
      $settings.showGettingStartedBanner = false;
    }}
  />
{/if}

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

<h3>Localization</h3>
<div class="setting-item-description">
  These settings are applied to your entire vault, meaning the values you
  specify here may impact other plugins as well.
</div>
<SettingItem
  name="Start week on"
  description="Choose what day of the week to start. Select 'locale default' to use the default specified by moment.js"
  type="dropdown"
  isHeading={false}
>
  <Dropdown
    slot="control"
    options={getWeekStartOptions()}
    value={$localization.weekStart}
    onChange={(e) => {
      const val = e.target.value;
      $localization.weekStart = val;
      app.vault.setConfig("weekStart", val);
    }}
  />
</SettingItem>

<SettingItem
  name="Locale"
  description="Override the locale used by the calendar and other plugins"
  type="dropdown"
  isHeading={false}
>
  <Dropdown
    slot="control"
    options={getLocaleOptions()}
    value={$localization.localeOverride}
    onChange={(e) => {
      const val = e.target.value;
      $localization.localeOverride = val;
      app.vault.setConfig("weekStart", val);
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
