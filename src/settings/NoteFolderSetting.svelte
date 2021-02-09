<script lang="ts">
  import { onMount } from "svelte";
  import type { Writable } from "svelte/store";

  import type { ISettings } from "./index";
  import { FolderSuggest } from "../ui/file-suggest";
  import { validateFolder } from "./validation";

  export let settings: Writable<ISettings>;
  export let periodicity: string;

  let inputEl: HTMLInputElement;
  let value: string;
  let error: string;

  $: value = $settings[periodicity].folder || "";

  function onChange() {
    error = validateFolder(inputEl.value);
  }

  function clearError() {
    error = "";
  }

  onMount(() => {
    error = validateFolder(inputEl.value);
    new FolderSuggest(window.app, inputEl);
  });
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">Note Folder</div>
    <div class="setting-item-description">
      New {periodicity} notes will be placed here
    </div>
    {#if error}
      <div class="has-error">{error}</div>
    {/if}
  </div>
  <div class="setting-item-control">
    <input
      bind:value={$settings[periodicity].folder}
      bind:this={inputEl}
      class:has-error={!!error}
      type="text"
      spellcheck={false}
      placeholder="Example: folder 1/folder 2"
      on:change={onChange}
      on:input={clearError}
    />
  </div>
</div>
