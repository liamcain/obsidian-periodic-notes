<script type="ts">
  import type { App } from "obsidian";
  import { slide } from "svelte/transition";
  import type { Writable } from "svelte/store";

  import type { ISettings } from "src/settings";
  import {
    hasLegacyDailyNoteSettings,
    // hasLegacyWeeklyNoteSettings,
  } from "src/utils";
  import Checkmark from "src/settings/components/Checkmark.svelte";

  export let app: App;
  export let settings: Writable<ISettings>;
  export let handleTeardown: () => void;
  export let migrateDailyNoteSettings: () => void;

  let hasDailyNoteSettings: boolean;
  let hasWeeklyNoteSettings: boolean;

  $: {
    hasDailyNoteSettings = hasLegacyDailyNoteSettings(app);
    // hasWeeklyNoteSettings = hasLegacyWeeklyNoteSettings();
  }
</script>

<div out:slide class="settings-banner">
  <h3>Getting Started</h3>

  {#if hasDailyNoteSettings}
    <div class="setting-item">
      <div class="setting-item-info">
        <h4>Daily Notes plugin is enabled</h4>
        {#if $settings.hasMigratedDailyNoteSettings}
          <p class="setting-item-description">
            You have successfully migrated your daily notes settings. You can
            now disable the Daily Notes core plugin to avoid any confusion.<br
            />If you have an custom hotkeys for daily notes, make sure to update
            them to use the new "Periodic Notes" commands.
          </p>
        {:else}
          <p class="setting-item-description">
            You are currently using the core Daily Notes plugin. You can migrate
            those settings over to Periodic Notes to enjoy the same
            functionality as well as some notable improvements
          </p>
        {/if}
      </div>
      <div class="setting-item-control">
        {#if $settings.hasMigratedDailyNoteSettings}
          <button disabled>Migrated <Checkmark /></button>
        {:else}
          <button class="mod-cta" on:click={migrateDailyNoteSettings}
            >Migrate</button
          >
        {/if}
      </div>
    </div>
  {/if}

  {#if hasWeeklyNoteSettings}
    <div class="setting-item">
      <div class="setting-item-info">
        <h4>Weekly Note settings migrated</h4>
        <p class="setting-item-description">
          Your existing weekly-note settings from the Calendar plugin have been
          migrated over automatically. The functionality will be removed from
          the Calendar plugin in the future.
        </p>
      </div>
      <div class="setting-item-control">
        {#if $settings.hasMigratedWeeklyNoteSettings}
          <button disabled
            >Migrated
            <Checkmark />
          </button>
        {:else}
          <button class="mod-cta">Migrate</button>
        {/if}
      </div>
    </div>
  {/if}

  {#if !hasDailyNoteSettings && !hasWeeklyNoteSettings}
    <p>
      With this plugin, you can quickly create and navigate to daily, weekly,
      and monthly notes. Enable them below to get started.
    </p>
  {/if}

  <button on:click={handleTeardown}>Dismiss</button>
</div>

<style>
  button {
    display: flex;
    align-items: center;
  }
</style>
