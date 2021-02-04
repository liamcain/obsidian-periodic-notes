<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  import type { ISettings } from "./index";
  import { FileSuggest } from "../ui/file-suggest";
  import { capitalize } from "../utils";
  import { validateTemplate } from "./validation";

  export let settings: Writable<ISettings>;
  export let periodicity: string;

  let value: string;
  let error: string;
  let inputEl: HTMLInputElement;

  $: value = $settings[periodicity].template;

  function validateOnBlur(localValue: string) {
    error = validateTemplate(localValue);
  }

  function clearError() {
    console.log("clear error");
    error = "";
  }

  onMount(() => {
    new FileSuggest(window.app, inputEl);
  });
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">{capitalize(periodicity)} Note Template</div>
    <div class="setting-item-description">
      Choose the file to use as a template
    </div>
    {#if error}
      <div class="has-error">{error}</div>
    {/if}
  </div>
  <div class="setting-item-control">
    <input
      bind:this={inputEl}
      bind:value={$settings[periodicity].template}
      class:has-error={!!error}
      type="text"
      spellcheck={false}
      placeholder="Example: folder/note"
      on:blur={() => validateOnBlur(value)}
      on:input={clearError}
    />
  </div>
</div>
