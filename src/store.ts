import { writable } from "svelte/store";
import {
  DEFAULT_CREDIT_TAXONOMY_ID,
  getCreditTaxonomy,
  getCreditTaxonomyRoleNames,
  LEGACY_CREDIT_TAXONOMY_ID,
  isKnownCreditTaxonomyId,
  normalizeCreditContributionRecord,
  type CreditContributionRecord,
  type CreditTaxonomyId,
} from "./creditTaxonomy";
export interface Author {
  name: string;
  email: string;
  affiliation: string | null | string[];
  orcid: string | null | string[];
  contributions: CreditContributionRecord;
}

interface StoreData {
  creditTaxonomyId: CreditTaxonomyId;
  authors: Author[];
}

const InitialStore: StoreData = {
  creditTaxonomyId: DEFAULT_CREDIT_TAXONOMY_ID,
  authors: [],
};

function serializeStore(store: StoreData) {
  return {
    ...store,
  };
}

function collectContributionNames(store: any): string[] {
  if (!Array.isArray(store?.authors)) {
    return [];
  }

  return store.authors.flatMap((author: any) =>
    Array.isArray(author?.contributions)
      ? author.contributions.map((entry: unknown) => {
          if (typeof entry === "string") {
            return entry;
          }

          if (
            entry &&
            typeof entry === "object" &&
            "name" in entry &&
            typeof entry.name === "string"
          ) {
            return entry.name;
          }

          return "";
        })
      : Object.values(author?.contributions ?? {}).flatMap((entries) =>
          Array.isArray(entries)
            ? entries.map((entry: unknown) => {
                if (typeof entry === "string") {
                  return entry;
                }

                if (
                  entry &&
                  typeof entry === "object" &&
                  "name" in entry &&
                  typeof entry.name === "string"
                ) {
                  return entry.name;
                }

                return "";
              })
            : [],
        ),
  );
}

function resolveCreditTaxonomyId(store: any): CreditTaxonomyId {
  const storedTaxonomyId =
    typeof store?.creditTaxonomyId === "string" ? store.creditTaxonomyId : null;

  if (isKnownCreditTaxonomyId(storedTaxonomyId)) {
    return storedTaxonomyId;
  }

  const contributionNames = collectContributionNames(store);
  const groundworksRoleNames = new Set(
    getCreditTaxonomyRoleNames(getCreditTaxonomy(DEFAULT_CREDIT_TAXONOMY_ID)),
  );
  const legacyRoleNames = new Set(
    getCreditTaxonomyRoleNames(getCreditTaxonomy(LEGACY_CREDIT_TAXONOMY_ID)),
  );

  const hasGroundworksOnlyRole = contributionNames.some(
    (role) =>
      role && !legacyRoleNames.has(role) && groundworksRoleNames.has(role),
  );
  const hasLegacyOnlyRole = contributionNames.some(
    (role) =>
      role && !groundworksRoleNames.has(role) && legacyRoleNames.has(role),
  );

  if (hasGroundworksOnlyRole && !hasLegacyOnlyRole) {
    return DEFAULT_CREDIT_TAXONOMY_ID;
  }

  if (hasLegacyOnlyRole && !hasGroundworksOnlyRole) {
    return LEGACY_CREDIT_TAXONOMY_ID;
  }

  return DEFAULT_CREDIT_TAXONOMY_ID;
}

function normalizeContributions(
  value: unknown,
  creditTaxonomyId: CreditTaxonomyId,
): CreditContributionRecord {
  return normalizeCreditContributionRecord(value, creditTaxonomyId);
}

function deserializeStore(store: any) {
  const creditTaxonomyId = resolveCreditTaxonomyId(store);
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
        contributions: normalizeContributions(
          author?.contributions,
          creditTaxonomyId,
        ),
      }))
    : [];

  return {
    ...store,
    creditTaxonomyId,
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

  const createEmptyAuthor = (): Author => ({
    name: "New Author",
    email: "",
    affiliation: "",
    orcid: null,
    contributions: {},
  });

  return {
    subscribe,
    setCreditTaxonomy: (creditTaxonomyId: CreditTaxonomyId) =>
      persistUpdate((currentVal) => ({
        ...currentVal,
        creditTaxonomyId,
      })),
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
        createEmptyAuthor(),
      ]),
    setAuthorsFromNames: (names: string[]) =>
      updateValue<StoreData["authors"]>("authors", (authors) =>
        names.map((name, idx) => ({ ...createEmptyAuthor(), name })),
      ),
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
      type: "name" | "email" | "affiliation" | "orcid" | "contributions",
      value: string | string[] | null | CreditContributionRecord,
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
