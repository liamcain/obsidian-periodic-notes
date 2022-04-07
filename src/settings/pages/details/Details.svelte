<script lang="ts">
  import type { App } from "obsidian";
  import type CalendarSetManager from "src/calendarSetManager";

  import { granularities } from "src/types";
  import PeriodicGroup from "./PeriodicGroup.svelte";

  export let app: App;
  export let manager: CalendarSetManager;
  export let selectedCalendarSet: string;
</script>

{#each granularities as granularity}
  <PeriodicGroup
    {app}
    {manager}
    {granularity}
    calendarSet={selectedCalendarSet}
  />
{/each}

<style>
</style>
