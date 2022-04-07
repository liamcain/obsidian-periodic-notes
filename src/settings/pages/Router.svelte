<script lang="ts">
  import type { App } from "obsidian";

  import type CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import Breadcrumbs from "src/settings/components/Breadcrumbs.svelte";

  import Dashboard from "./dashboard/Dashboard.svelte";
  import Details from "./details/Details.svelte";
  import type { ISettings } from "../index";
  import { onDestroy } from "svelte";

  export let app: App;
  export let manager: CalendarSetManager;
  export let settings: ISettings;
  export let onUpdateSettings: (newSettings: ISettings) => void;

  onDestroy(() => {
    router.reset();
  });
</script>

<Breadcrumbs />

{#if $router.length > 1}
  <Details {app} {manager} selectedCalendarSet={$router[1]} />
{:else}
  <Dashboard {app} {manager} {settings} {onUpdateSettings} />
{/if}
