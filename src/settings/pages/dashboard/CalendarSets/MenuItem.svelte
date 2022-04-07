<script type="ts">
  import capitalize from "lodash/capitalize";

  import Checkmark from "src/settings/components/Checkmark.svelte";
  import type { CalendarSet } from "src/types";
  import { granularities } from "src/types";
  import { displayConfigs } from "src/commands";
  import CalendarSetManager from "src/calendarSetManager";

  export let viewDetails: () => void;
  export let calendarSet: CalendarSet;
  export let manager: CalendarSetManager;

  let active = manager.getActiveSet() === calendarSet.id;
  let showEmptyState =
    granularities.filter((g) => calendarSet[g]?.enabled).length === 0;
</script>

<div class="calendarset-container" class:active on:click={viewDetails}>
  <h4 class="calendarset-name">{calendarSet.id}</h4>
  <div class="included-types">
    {#each granularities as granularity}
      {#if calendarSet[granularity]?.enabled}
        <div class="included-type">
          <Checkmark />
          <span class="periodicity-text">
            {capitalize(displayConfigs[granularity].periodicity)} notes
          </span>
        </div>
      {/if}
    {/each}
    {#if showEmptyState}
      <div class="calendarset-empty-state">Not configured</div>
    {/if}
  </div>
</div>

<style type="scss">
  .calendarset-container {
    background: var(--background-primary-alt);
    border-radius: 16px;
    border: 1px solid var(--background-modifier-border);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 24px 28px;
    transition: 0.2s border-color ease-in;

    &.active {
      background: var(--text-selection);
      box-shadow: inset 0 0 0 1px var(--text-accent);

      &:hover {
        border-color: var(--interactive-accent);
        box-shadow: inset 0 0 0 1px var(--text-accent-hover);
      }
    }

    &:hover {
      border-color: var(--interactive-accent);
    }
  }

  .calendarset-name {
    font-weight: 600;
    letter-spacing: 0.25px;
    margin-top: 0;
  }

  .periodicity-text {
    margin-left: 0.4em;
  }

  .included-type {
    margin-top: 6px;

    &:first-of-type {
      margin-top: 0;
    }
  }

  .calendarset-empty-state {
    color: var(--text-faint);
    font-style: italic;
  }
</style>
