<script lang="ts">
  import type { App } from "obsidian";

  import type CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import Breadcrumbs from "src/settings/components/Breadcrumbs.svelte";

  import Dashboard from "./dashboard/Dashboard.svelte";
  import Details from "./details/Details.svelte";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { ISettings } from "..";

  export let app: App;
  export let manager: CalendarSetManager;

  export let settings: ISettings;
  export let onUpdateSettings: (newSettings: ISettings) => void;

  let settingsStore = writable(settings);

  onMount(() => {
    settingsStore.subscribe(onUpdateSettings);
  });

  onDestroy(() => {
    router.reset();
  });
</script>

<Breadcrumbs />

{#if $router.length > 1}
  {#key $router[1]}
    <Details {app} {manager} selectedCalendarSet={$router[1]} />
  {/key}
{:else}
  <Dashboard settings={settingsStore} {manager} />
{/if}
