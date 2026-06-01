import { writable } from "svelte/store";
export interface Author {
  name: string;
  email: string;
  affiliation: string | null | string[];
  orcid: string | null | string[];
  contributions: string[];
}

interface StoreData {
  authors: Author[];
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
  const authors = Array.isArray(store?.authors)
    ? store.authors.map((author: Partial<Author>) => ({
        name: author?.name ?? "New Author",
        email: author?.email ?? "",
        affiliation:
          typeof author?.affiliation === "string" ||
          Array.isArray(author?.affiliation)
            ? author.affiliation
            : "",
        orcid: author?.orcid ?? null,
        contributions: Array.isArray(author?.contributions)
          ? author.contributions
          : [],
      }))
    : [];

  return {
    ...store,
    authors,
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

  const updateValue = <A>(field: string, updateFunc: (old: A) => A) =>
    persistUpdate(
      (oldStore) =>
        ({
          ...oldStore,
          [field]: updateFunc(oldStore[field as keyof StoreData] as any),
        }) as StoreData,
    );
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
      updateValue<StoreData["authors"]>("authors", (authors) => [
        ...authors,
        {
          name: "New Author",
          email: "",
          affiliation: "",
          orcid: null,
          contributions: [],
        },
      ]),
    moveAuthor: (fromIdx: number, toIdx: number) =>
      updateValue<StoreData["authors"]>("authors", (authors) => {
        const newAuthors = [...authors];
        const [movedAuthor] = newAuthors.splice(fromIdx, 1);
        newAuthors.splice(toIdx, 0, movedAuthor);
        return newAuthors;
      }),
    removeAuthor: (idx: number) =>
      updateValue<StoreData["authors"]>("authors", (authors) =>
        authors.filter((_, i) => i !== idx),
      ),
    updateAuthorProperty: (
      idx: number,
      type: "name" | "email" | "affiliation" | "orcid",
      value: string | string[] | null,
    ) =>
      updateValue<StoreData["authors"]>("authors", (authors) =>
        authors.map((author, i) =>
          i === idx ? { ...author, [type]: value } : author,
        ),
      ),
  };
}

const store = createStore();

export default store;
