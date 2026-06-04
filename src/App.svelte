<script lang="ts">
  import {
    CREDIT_TAXONOMIES,
    getCreditTaxonomy,
    type CreditTaxonomyId,
  } from "./creditTaxonomy";
  import store from "./store";
  import AuthorTableView from "./AuthorTableView.svelte";
  import AuthorshipBlock from "./Authorship.svelte";
  import ContributionMatrixView from "./ContributionMatrixView.svelte";
  import Modal from "./Modal.svelte";
  import { parseAuthorNames } from "./utils/authorNames";

  let showWelcomeModal = $state(true);
  let newPaperAuthorNames = $state("");
  let contributionView = $state("table" as "table" | "matrix");
  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));

  const controlButtonBase =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50";
  const controlButtonAccent = `${controlButtonBase} bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50`;

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
    <div
      class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
          Contribution Management
        </h1>
        <p class="text-sm text-slate-600">
          Manage authors, resolve identifiers, and generate contribution text
          for
          {activeTaxonomy.label}.
        </p>
      </div>
      <label
        class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
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

    <div
      class="mt-3 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1"
    >
      <button
        type="button"
        class={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
          contributionView === "table"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        onclick={() => {
          contributionView = "table";
        }}
      >
        Table View
      </button>
      <button
        type="button"
        class={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
          contributionView === "matrix"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        onclick={() => {
          contributionView = "matrix";
        }}
      >
        Matrix View
      </button>
    </div>
  </div>

  {#if contributionView === "table"}
    <AuthorTableView />
  {:else}
    <ContributionMatrixView />
  {/if}

  <AuthorshipBlock />
</div>
