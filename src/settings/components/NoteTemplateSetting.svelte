<script lang="ts">
  import type { App } from "obsidian";
  import { onMount } from "svelte";
  import type { Readable } from "svelte/store";
  import capitalize from "lodash/capitalize";

  import type { Granularity, PeriodicConfig } from "src/types";
  import { FileSuggest } from "src/ui/file-suggest";

  import { validateTemplate } from "../validation";
  import { displayConfigs } from "src/commands";

  export let app: App;
  export let granularity: Granularity;
  export let config: Readable<PeriodicConfig>;

  let error: string;
  let inputEl: HTMLInputElement;

  function validateOnBlur() {
    error = validateTemplate(app, inputEl.value);
  }

  function clearError() {
    error = "";
  }

  onMount(() => {
    error = validateTemplate(app, inputEl.value);
    new FileSuggest(app, inputEl);
  });
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">
      {capitalize(displayConfigs[granularity].periodicity)} Note Template
    </div>
    <div class="setting-item-description">
      Choose the file to use as a template
    </div>
    {#if error}
      <div class="has-error">{error}</div>
    {/if}
  </div>
  <div class="setting-item-control">
    <input
      class:has-error={!!error}
      type="text"
      spellcheck={false}
      placeholder="e.g. templates/template-file"
      bind:value={$config.templatePath}
      bind:this={inputEl}
      on:change={validateOnBlur}
      on:input={clearError}
    />
  </div>
</div>

<style>
  .setting-item-control input {
    flex-grow: 1;
  }
</style>
