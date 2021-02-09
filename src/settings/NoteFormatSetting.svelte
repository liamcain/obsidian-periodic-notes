<script lang="ts">
  import {
    DEFAULT_DAILY_NOTE_FORMAT,
    DEFAULT_MONTHLY_NOTE_FORMAT,
    DEFAULT_WEEKLY_NOTE_FORMAT,
  } from "obsidian-daily-notes-interface";
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  import type { IPeriodicity, ISettings } from "./index";

  import { getBasename, validateFormat } from "./validation";

  export let settings: Writable<ISettings>;
  export let periodicity: IPeriodicity;

  const DEFAULT_FORMATS = {
    daily: DEFAULT_DAILY_NOTE_FORMAT,
    weekly: DEFAULT_WEEKLY_NOTE_FORMAT,
    monthly: DEFAULT_MONTHLY_NOTE_FORMAT,
  };
  const defaultFormat = DEFAULT_FORMATS[periodicity];

  let inputEl: HTMLInputElement;
  let value: string;
  let error: string;

  let isTemplateNested: boolean;
  let basename: string;

  $: {
    value = $settings[periodicity].format || "";

    isTemplateNested = value.indexOf("/") !== -1;
    basename = getBasename(value);
  }

  onMount(() => {
    error = validateFormat(inputEl.value, periodicity);
  });

  function clearError() {
    error = "";
  }

  function onChange() {
    error = validateFormat(inputEl.value, periodicity);
  }
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Format</div>
    <div class="setting-item-description">
      <a href="https://momentjs.com/docs/#/displaying/format/"
        >Syntax Reference</a
      >
      <div>
        Your current syntax looks like this: <b class="u-pop"
          >{window.moment().format(value || defaultFormat)}
        </b>
      </div>
      {#if isTemplateNested}
        <div>
          New files will be created at <strong>{value}</strong><br />
          Format: <strong>{basename}</strong>
        </div>
      {/if}
    </div>
    {#if error}
      <div class="has-error">{error}</div>
    {/if}
  </div>
  <div class="setting-item-control">
    <input
      bind:value={$settings[periodicity].format}
      bind:this={inputEl}
      class:has-error={!!error}
      type="text"
      spellcheck={false}
      placeholder={defaultFormat}
      on:change={onChange}
      on:input={clearError}
    />
  </div>
</div>
