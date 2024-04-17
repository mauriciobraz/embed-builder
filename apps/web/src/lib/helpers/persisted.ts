import { writable, get } from "svelte/store";

export function persisted<T>(key: string, data: T) {
  const store = writable(data);
  const { subscribe, set } = store;

  const isBrowser = typeof window !== "undefined";

  if (isBrowser && localStorage[key]) {
    set(JSON.parse(localStorage[key]));
  }

  return {
    subscribe,
    get: () => get(store),

    set: (value: T) => {
      if (isBrowser) localStorage[key] = JSON.stringify(value);
      set(value);
    },

    update: (callback: (store: T) => T) => {
      const updatedStore = callback(get(store));

      if (isBrowser) localStorage[key] = JSON.stringify(updatedStore);
      set(updatedStore);
    },
  };
}
