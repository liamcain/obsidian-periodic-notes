<script lang="ts">
  import { onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  import type { IPeriodicity, ISettings } from "./index";

  import GettingStartedBanner from "./GettingStartedBanner.svelte";
  import NoteFormatSetting from "./NoteFormatSetting.svelte";
  import NoteTemplateSetting from "./NoteTemplateSetting.svelte";
  import NoteFolderSetting from "./NoteFolderSetting.svelte";
  import { capitalize, getLegacyDailyNoteSettings } from "../utils";

  export let settings: ISettings;
  export let onUpdateSettings: (newSettings: ISettings) => void;

  let settingsStore = writable(settings);

  const unsubscribeFromSettings = settingsStore.subscribe(onUpdateSettings);

  function migrateDailyNoteSettings(): void {
    const dailyNoteSettings = getLegacyDailyNoteSettings();
    settingsStore.update((old) => ({
      ...old,
      ...{
        daily: { ...dailyNoteSettings, enabled: true },
        hasMigratedDailyNoteSettings: true,
      },
    }));
  }

  const periodicities: IPeriodicity[] = ["daily", "weekly", "monthly"];

  onDestroy(() => {
    unsubscribeFromSettings();
  });
</script>

{#if $settingsStore.showGettingStartedBanner}
  <GettingStartedBanner
    {migrateDailyNoteSettings}
    settings={settingsStore}
    handleTeardown={() => {
      $settingsStore.showGettingStartedBanner = false;
    }}
  />
{/if}
{#each periodicities as periodicity}
  <div class="setting-item setting-item-heading">
    <div class="setting-item-info">
      <div class="setting-item-name">
        <h3>
          {capitalize(periodicity)} Notes
        </h3>
      </div>
    </div>
    <div class="setting-item-control">
      <div
        class="checkbox-container"
        class:is-enabled={$settingsStore[periodicity].enabled}
        on:click={() => {
          $settingsStore[periodicity].enabled = !$settingsStore[periodicity]
            .enabled;
        }}
      />
    </div>
  </div>
  {#if $settingsStore[periodicity].enabled}
    <div in:slide out:slide>
      <NoteFormatSetting {periodicity} settings={settingsStore} />
      <NoteTemplateSetting {periodicity} settings={settingsStore} />
      <NoteFolderSetting {periodicity} settings={settingsStore} />
    </div>
  {/if}
{/each}
