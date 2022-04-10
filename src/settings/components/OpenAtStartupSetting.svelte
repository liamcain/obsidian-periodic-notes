<script lang="ts">
  import type { Writable } from "svelte/store";

  import type { Granularity, PeriodicConfig } from "src/types";
  import { displayConfigs } from "src/commands";

  import SettingItem from "./SettingItem.svelte";
  import Toggle from "./Toggle.svelte";
  import type { ISettings } from "..";
  import { clearStartupNote } from "../utils";

  export let config: Writable<PeriodicConfig>;
  export let settings: Writable<ISettings>;
  export let granularity: Granularity;
</script>

<SettingItem
  name="Open on startup"
  description={`Opens your ${displayConfigs[granularity].periodicity} note automatically whenever you open this vault`}
  type="toggle"
  isHeading={false}
>
  <Toggle
    slot="control"
    isEnabled={$config.openAtStartup}
    onChange={(val) => {
      settings.update(clearStartupNote);
      $config.openAtStartup = val;
    }}
  />
</SettingItem>
