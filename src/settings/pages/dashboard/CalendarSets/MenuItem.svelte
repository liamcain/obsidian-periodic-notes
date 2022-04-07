<script type="ts">
  import Checkmark from "src/settings/components/Checkmark.svelte";
  import type { CalendarSet } from "src/types";
  import { granularities } from "src/types";
  import { displayConfigs } from "src/commands";

  export let viewDetails: () => void;
  export let calendarSet: CalendarSet;
</script>

<div class="calendarset-container" on:click={viewDetails}>
  <h4 class="calendarset-name">{calendarSet.id}</h4>
  <div class="included-types">
    {#each granularities as granularity}
      {#if calendarSet[granularity]?.enabled}
        <div>
          <Checkmark />
          <span class="periodicity-text">
            {displayConfigs[granularity].periodicity} notes
          </span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .calendarset-container {
    background: var(--background-primary);
    border-radius: 16px;
    border: 1px solid var(--background-modifier-border);
    cursor: point;
    display: flex;
    flex-direction: column;
    padding: 24px;
    transition: 0.2s border ease-in;
    width: calc(50% - 24px);
  }

  .calendarset-container:hover {
    border: 1px solid var(--interactive-accent);
  }

  .calendarset-name {
    margin-top: 0;
  }

  .periodicity-text {
    margin-left: 0.2em;
  }
</style>
