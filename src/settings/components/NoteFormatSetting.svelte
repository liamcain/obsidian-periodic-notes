<script lang="ts">
  import { onMount } from "svelte";

  import { DEFAULT_FORMAT } from "src/constants";
  import type { Granularity, PeriodicConfig } from "src/types";
  import { getBasename, validateFormat } from "../validation";
  import type { Readable } from "svelte/store";

  export let granularity: Granularity;
  export let config: Readable<PeriodicConfig>;

  const defaultFormat = DEFAULT_FORMAT[granularity];

  let inputEl: HTMLInputElement;
  let value: string = "";
  let error: string;

  let isTemplateNested: boolean;
  let basename: string;

  $: {
    value = $config.format || "";
    isTemplateNested = value.indexOf("/") !== -1;
    basename = getBasename(value);
  }

  onMount(() => {
    error = validateFormat(inputEl.value, granularity);
  });

  function clearError() {
    error = "";
  }

  function onChange() {
    error = validateFormat(inputEl.value, granularity);
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
      bind:value={$config.format}
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
