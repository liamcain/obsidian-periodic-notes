import { MarkdownView } from "obsidian";
import { PeriodicNotesCache } from "src/cache";
import PeriodicNotesPlugin from "src/main";
import type { SvelteComponent } from "svelte";

import Timeline from "./Timeline.svelte";

export default class TimelineManager {
  private btnComponents: SvelteComponent[];

  constructor(readonly plugin: PeriodicNotesPlugin, readonly cache: PeriodicNotesCache) {
    this.btnComponents = [];

    this.plugin.app.workspace.onLayoutReady(() => {
      plugin.registerEvent(
        plugin.app.workspace.on("layout-change", this.onLayoutChange, this)
      );
      this.onLayoutChange();
    });
  }

  public cleanup() {
    for (const existingEl of this.btnComponents) {
      existingEl.$destroy();
    }
  }

  private onLayoutChange(): void {
    const openViews: MarkdownView[] = [];
    this.plugin.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        openViews.push(leaf.view);
      }
    });

    // Clean up timelines on closed leaves
    for (const existingEl of this.btnComponents) {
      if (
        !openViews
          .map((view) => view.containerEl)
          .includes(existingEl.$$.root as HTMLElement)
      ) {
        existingEl.$destroy();
      }
    }

    // Add to any view that doesn't already have one
    for (const view of openViews) {
      const btn = this.btnComponents.find((btn) => btn.$$.root === view.containerEl);
      if (!btn) {
        this.btnComponents.push(
          new Timeline({
            target: view.containerEl,
            props: {
              plugin: this.plugin,
              cache: this.cache,
              view,
            },
          })
        );
      }
    }
  }
}
