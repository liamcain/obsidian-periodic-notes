<script type="ts">
  import type { App } from "obsidian";
  import {
    disableDailyNotesPlugin,
    hasLegacyDailyNoteSettings,
    isDailyNotesPluginEnabled,
  } from "src/settings/utils";
  import { slide } from "svelte/transition";

  export let app: App;
  export let handleTeardown: () => void;

  let hasDailyNotesEnabled: boolean;
  let hasDailyNoteSettings: boolean;

  $: {
    hasDailyNotesEnabled = isDailyNotesPluginEnabled(app);
    hasDailyNoteSettings = hasLegacyDailyNoteSettings(app);
  }
</script>

<div out:slide|local class="settings-banner">
  <h3>Getting Started</h3>

  {#if hasDailyNotesEnabled}
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">Daily Notes plugin enabled</div>
        <p class="setting-item-description">
          You are currently using the core Daily Notes plugin. You can migrate
          your existing settings for a seamless transition to Periodic Notes.
        </p>
        <p>
          If you have an custom hotkeys for daily notes, make sure to update
          them to use the corresponding "Periodic Notes" commands.
        </p>
      </div>
      <div class="setting-item-control">
        <button class="mod-cta" on:click={() => disableDailyNotesPlugin(app)}>
          Disable
        </button>
      </div>
    </div>
  {/if}

  {#if !hasDailyNoteSettings}
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
