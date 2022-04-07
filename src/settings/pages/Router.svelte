<script lang="ts">
  import type { App } from "obsidian";

  import type CalendarSetManager from "src/calendarSetManager";
  import { router } from "src/settings/stores";
  import Breadcrumbs from "src/settings/components/Breadcrumbs.svelte";

  import Dashboard from "./dashboard/Dashboard.svelte";
  import Details from "./details/Details.svelte";
  import { onDestroy } from "svelte";
  import type { Writable } from "svelte/store";
  import type { ISettings } from "..";

  export let app: App;
  export let manager: CalendarSetManager;

  export let settings: Writable<ISettings>;

  onDestroy(() => {
    router.reset();
  });
</script>

<Breadcrumbs />

{#if $router.path.length > 1}
  {#key $router.path[1]}
    <Details {app} {settings} {manager} selectedCalendarSet={$router.path[1]} />
  {/key}
{:else}
  <Dashboard {app} {settings} {manager} />
{/if}
