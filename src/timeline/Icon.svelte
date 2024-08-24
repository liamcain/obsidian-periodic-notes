<script lang="ts">
  import { setIcon } from "obsidian";
  import { onMount } from "svelte";
  export let icon: string;

  let iconEl: HTMLElement;

  onMount(() => {
    setIcon(iconEl, icon, 12);
  });
</script>

<span bind:this={iconEl} />
