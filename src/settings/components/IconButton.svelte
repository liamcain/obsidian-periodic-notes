<script lang="ts">
  import { setIcon } from "obsidian";
  import { onMount } from "svelte";

  export let iconType: string;
  export let size: number;

  let iconEl: HTMLElement;

  onMount(() => {
    setIcon(iconEl, iconType, size);
  });
</script>

<div class="clickable-icon" bind:this={iconEl} />
