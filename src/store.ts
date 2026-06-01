import { writable } from "svelte/store";

interface StoreData {
  authors: { name: string; orcid: string | null; contributions: string[] }[];
}

const InitialStore: StoreData = {
  authors: [],
};

function serializeStore(store: StoreData) {
  return {
    ...store,
  };
}
function deserializeStore(store: any) {
  return {
    ...store,
  };
}

// install defaults if not present
function addDefaults(store: Partial<StoreData>): StoreData {
  // check if the base store objects work right
  const storeData = { ...InitialStore, ...store };
  return storeData as StoreData;
}

const storeName = "contrib-games-store";
function createStore() {
  const target =
    localStorage.getItem(storeName) || JSON.stringify(InitialStore);
  let storeData: StoreData = deserializeStore(addDefaults(JSON.parse(target)));

  // persist new store to storage
  localStorage.setItem(storeName, JSON.stringify(serializeStore(storeData)));
  // create store
  const { subscribe, update } = writable<StoreData>(storeData);
  let undoStack: StoreData[] = [];
  let redoStack: StoreData[] = [];
  // special logic to enable not capturing too many steps via dragging
  let pausePersistence = false;
  let lastStore: StoreData = storeData;
  const save = (store: StoreData) =>
    localStorage.setItem(storeName, JSON.stringify(serializeStore(store)));

  const persistUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      if (pausePersistence) {
        lastStore = oldStore;
        return updateFunc(oldStore);
      }
      undoStack.push(oldStore);
      redoStack = [];
      const newVal: StoreData = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });

  const simpleUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => updateFunc(oldStore));

  const saveUpdate = (updateFunc: (old: StoreData) => StoreData) =>
    update((oldStore) => {
      const newVal = updateFunc(oldStore);
      save(newVal);
      return newVal;
    });

  return {
    subscribe,
    undo: () =>
      saveUpdate((currentVal) => {
        if (undoStack.length === 0) return currentVal;
        redoStack.push(currentVal);
        return undoStack.pop()!;
      }),
    redo: () =>
      saveUpdate((currentVal) => {
        if (redoStack.length === 0) return currentVal;
        undoStack.push(currentVal);
        return redoStack.pop()!;
      }),
    pausePersistence: () =>
      simpleUpdate((currentVal) => {
        lastStore = currentVal;
        undoStack.push(currentVal);
        redoStack = [];
        pausePersistence = true;
        return currentVal;
      }),
    resumePersistence: () => {
      pausePersistence = false;
      persistUpdate(() => lastStore);
      undoStack.pop();
    },
    addAuthor: () =>
      persistUpdate((currentVal) => ({
        ...currentVal,
        authors: [
          ...currentVal.authors,
          { name: "New Author", orcid: null, contributions: [] },
        ],
      })),
  };
}

const store = createStore();

export default store;
