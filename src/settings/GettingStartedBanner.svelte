<script type="ts">
  import { slide } from "svelte/transition";
  import type { Writable } from "svelte/store";

  import type { ISettings } from "./index";
  import {
    hasLegacyDailyNoteSettings,
    hasLegacyWeeklyNoteSettings,
  } from "../utils";

  export let settings: Writable<ISettings>;
  export let handleTeardown: () => void;
  export let migrateDailyNoteSettings: () => void;

  let hasDailyNoteSettings: boolean;
  let hasWeeklyNoteSettings: boolean;

  $: {
    hasDailyNoteSettings = hasLegacyDailyNoteSettings();
    hasWeeklyNoteSettings = hasLegacyWeeklyNoteSettings();
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
            now disable the Daily Notes core plugin to avoid any confusion.
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
          <button disabled
            >Migrated
            <svg
              aria-hidden="true"
              focusable="false"
              class="check"
              data-icon="check"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              ><path
                fill="currentColor"
                d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
              /></svg
            >
          </button>
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
            <svg
              aria-hidden="true"
              focusable="false"
              class="check"
              data-icon="check"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              ><path
                fill="currentColor"
                d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
              /></svg
            >
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

  .check {
    margin-left: 6px;
    width: 12px;
    height: 12px;
  }
</style>
