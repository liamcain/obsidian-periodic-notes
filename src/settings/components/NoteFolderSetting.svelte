<script lang="ts">
  import type { App } from "obsidian";
  import { onMount } from "svelte";

  import { FolderSuggest } from "src/ui/file-suggest";
  import type { Granularity, PeriodicConfig } from "src/types";

  import { validateFolder } from "../validation";
  import type { Readable } from "svelte/store";
  import { displayConfigs } from "src/commands";

  export let config: Readable<PeriodicConfig>;
  export let app: App;
  export let granularity: Granularity;

  let inputEl: HTMLInputElement;
  let error: string;

  function onChange() {
    error = validateFolder(app, inputEl.value);
  }

  function clearError() {
    error = "";
  }

  onMount(() => {
    error = validateFolder(app, inputEl.value);
    new FolderSuggest(app, inputEl);
  });
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Note Folder</div>
    <div class="setting-item-description">
      New {displayConfigs[granularity].periodicity} notes will be placed here
    </div>
    {#if error}
      <div class="has-error">{error}</div>
    {/if}
  </div>
  <div class="setting-item-control">
    <input
      bind:value={$config.folder}
      bind:this={inputEl}
      class:has-error={!!error}
      type="text"
      spellcheck={false}
      placeholder="e.g. folder 1/folder 2"
      on:change={onChange}
      on:input={clearError}
    />
  </div>
</div>

<style>
  .setting-item-control input {
    flex-grow: 1;
  }
</style>
