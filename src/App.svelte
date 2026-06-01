<script lang="ts">
  import {
    CREDIT_TAXONOMIES,
    getCreditTaxonomy,
    type CreditTaxonomyId,
  } from "./creditTaxonomy";
  import store from "./store";
  import Author from "./Author.svelte";
  import AuthorshipBlock from "./Authorship.svelte";
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import Modal from "./Modal.svelte";
  import templates from "./templates";
  import { parseAuthorNames } from "./utils/authorNames";

  let template = $state("IEEE" as keyof typeof templates);
  let showWelcomeModal = $state(true);
  let newPaperAuthorNames = $state("");
  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));

  const controlButtonBase =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50";
  const controlButtonPrimary = `${controlButtonBase} bg-slate-900 text-white hover:bg-slate-800`;
  const controlButtonAccent = `${controlButtonBase} bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50`;
  const controlButtonIndigo = `${controlButtonBase} bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50`;
  const controlButtonSubtle = `${controlButtonBase} bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-200`;
  const headerActionButtonBase =
    "inline-flex min-h-0 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50";
  const headerActionButtonMuted = `${headerActionButtonBase} bg-slate-200/70 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300`;

  function applyAuthorDump(names: string[]) {
    store.setAuthorsFromNames(names);
  }

  function closeWelcomeModal() {
    showWelcomeModal = false;
    newPaperAuthorNames = "";
  }

  function applyNewPaperAuthorsAndClose() {
    const names = parseAuthorNames(newPaperAuthorNames);
    if (names.length === 0) {
      return;
    }

    store.setAuthorsFromNames(names);
    closeWelcomeModal();
  }
</script>

<Modal open={showWelcomeModal} title="Welcome" onClose={closeWelcomeModal}>
  <div class="flex flex-col gap-4">
    <p class="text-sm text-slate-600">
      Start a new paper or continue where you left off.
    </p>

    <div class="flex flex-col gap-2">
      <label
        class="text-sm font-semibold text-slate-900"
        for="new-paper-authors"
      >
        Paste Author Names
      </label>
      <p class="text-xs text-slate-500">
        One or many names, separated by commas, semicolons, lines, or “and”.
      </p>
      <textarea
        id="new-paper-authors"
        class="min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        rows="4"
        placeholder="Paste names separated by lines, commas, semicolons, or 'and'"
        bind:value={newPaperAuthorNames}
      ></textarea>
    </div>
    <div class="flex gap-2 w-full">
      <button
        class={`${controlButtonBase} bg-slate-900 text-white hover:bg-slate-800`}
        onclick={applyNewPaperAuthorsAndClose}
      >
        Start New Paper
      </button>
      <button class={controlButtonAccent} onclick={closeWelcomeModal}>
        Keep Working on Old Paper
      </button>
    </div>
  </div>
</Modal>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4">
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
          Contribution Management
        </h1>
        <p class="text-sm text-slate-600">
          Manage authors, resolve identifiers, and generate contribution text for
          {activeTaxonomy.label}.
        </p>
      </div>
      <label class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Credit taxonomy
        <select
          class="min-w-56 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
          value={$store.creditTaxonomyId}
          onchange={(e) => {
            const target = e.currentTarget as HTMLSelectElement | null;
            if (!target) {
              return;
            }

            store.setCreditTaxonomy(target.value as CreditTaxonomyId);
          }}
        >
          {#each CREDIT_TAXONOMIES as taxonomy}
            <option value={taxonomy.id}>{taxonomy.label}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div
      class="hidden items-center gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid author-table-cols"
    >
      <div class="flex min-w-0 items-center justify-between gap-2">
        <div class="truncate">Name</div>

        <button
          class={`${headerActionButtonMuted} shrink-0`}
          onclick={() => store.addAuthor()}>Add Author</button
        >
      </div>
      <div class="flex min-w-0 items-center justify-between gap-2">
        <div class="truncate">ORCID</div>
        <button
          class={`${headerActionButtonBase} shrink-0`}
          onclick={() => {
            $store.authors.forEach((author, idx) => {
              getORCID(author.name).then((orcid) => {
                if (orcid) {
                  store.updateAuthorProperty(idx, "orcid", orcid);
                }
              });
            });
          }}>Get ORCIDs</button
        >
      </div>
      <div class="flex min-w-0 items-center justify-between gap-2">
        <div class="truncate">Affiliation</div>
        {#if $store.authors.some((author) => typeof author.orcid === "string")}
          <button
            class={`${headerActionButtonBase} shrink-0`}
            onclick={() => {
              $store.authors.forEach((author, idx) => {
                if (!author.orcid || Array.isArray(author.orcid)) {
                  return;
                }
                getAuthorInfoFromORCID(author.orcid).then((details) => {
                  if (!details) {
                    return;
                  }
                  if (details.name) {
                    store.updateAuthorProperty(idx, "name", details.name);
                  }
                  if (details.email) {
                    store.updateAuthorProperty(idx, "email", details.email);
                  }
                  if (details.affiliation) {
                    store.updateAuthorProperty(
                      idx,
                      "affiliation",
                      details.affiliation,
                    );
                  }
                });
              });
            }}>Fill From ORCIDs</button
          >
        {/if}
      </div>
      <div>Contributions ({activeTaxonomy.label})</div>
    </div>
    {#each $store.authors as author, idx}
      <Author {author} {idx} />
    {/each}
  </div>

  <AuthorshipBlock />
</div>

<style>
  .author-table-cols {
    grid-template-columns:
      minmax(12rem, 1.25fr) minmax(11rem, 1fr) minmax(11rem, 1fr)
      minmax(18rem, 2fr);
  }
</style>
