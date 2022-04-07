import { writable } from "svelte/store";

function createRouter() {
  const { subscribe, set, update } = writable<string[]>(["Periodic Notes"]);
  return {
    subscribe,
    set,
    navigate: set,
    update,
    reset: () => set(["Periodic Notes"]),
  };
}

export const router = createRouter();
