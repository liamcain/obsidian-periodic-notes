<script lang="ts">
  import { App } from "obsidian";
  import { slide } from "svelte/transition";
  import capitalize from "lodash/capitalize";

  import { displayConfigs } from "src/commands";
  import NoteFormatSetting from "src/settings/components/NoteFormatSetting.svelte";
  import NoteTemplateSetting from "src/settings/components/NoteTemplateSetting.svelte";
  import NoteFolderSetting from "src/settings/components/NoteFolderSetting.svelte";
  import type { Granularity } from "src/types";
  import CalendarSetManager from "src/calendarSetManager";
  import Arrow from "src/settings/components/Arrow.svelte";

  export let app: App;
  export let calendarSet: string;
  export let granularity: Granularity;
  export let manager: CalendarSetManager;

  let displayConfig = displayConfigs[granularity];
  let config = manager.getConfig(calendarSet, granularity);
  let isExpanded = false;

  function toggleExpand() {
    isExpanded = !isExpanded;
  }
</script>

<div class="periodic-group">
  <div
    class="setting-item setting-item-heading periodic-group-heading"
    on:click={toggleExpand}
  >
    <div class="setting-item-info">
      <h3 class="setting-item-name periodic-group-title">
        <Arrow {isExpanded} />
        {capitalize(displayConfig.periodicity)} Notes
      </h3>
    </div>
    <div class="setting-item-control">
      <div
        class="checkbox-container"
        class:is-enabled={$config.enabled}
        on:click={() => ($config.enabled = !$config.enabled)}
      />
    </div>
  </div>
  {#if isExpanded}
    <div class="periodic-group-content" in:slide out:slide>
      <NoteFormatSetting {config} {granularity} />
      <NoteTemplateSetting {app} {config} {granularity} />
      <NoteFolderSetting {app} {config} {granularity} />
    </div>
  {/if}
</div>

<style>
  .periodic-group-title {
    display: flex;
  }

  .periodic-group {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 16px;
  }

  .periodic-group:not(:last-of-type) {
    margin-bottom: 24px;
  }

  .periodic-group-heading {
    cursor: pointer;
    padding: 24px;
  }

  .periodic-group-heading h3 {
    margin: 0;
  }

  .periodic-group-content {
    padding: 24px;
  }
</style>
