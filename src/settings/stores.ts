import { writable } from "svelte/store";

interface IRouter {
  path: string[];
  eState: Record<string, string | number | boolean>;
}

function createRouter() {
  const { subscribe, set, update } = writable<IRouter>({
    path: ["Periodic Notes"],
    eState: {},
  });
  return {
    subscribe,
    set,
    navigate: (path: string[], eState?: Record<string, string | number | boolean>) =>
      set({
        path,
        eState: eState ?? {},
      }),
    update,
    reset: () =>
      set({
        path: ["Periodic Notes"],
        eState: {},
      }),
  };
}

export const router = createRouter();
