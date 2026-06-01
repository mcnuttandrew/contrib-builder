<script lang="ts">
  import store from "./store";
  import Author from "./Author.svelte";
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import PasteAuthorNames from "./PasteAuthorNames.svelte";
  import templates from "./templates";

  let template = "IEEE" as keyof typeof templates;

  const controlButtonBase =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2";
  const controlButtonPrimary = `${controlButtonBase} bg-slate-900 text-white hover:bg-slate-800`;
  const controlButtonAccent = `${controlButtonBase} bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50`;
  const controlButtonIndigo = `${controlButtonBase} bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50`;
  const controlButtonSubtle = `${controlButtonBase} bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-200`;

  function applyAuthorDump(names: string[]) {
    store.setAuthorsFromNames(names);
  }
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4">
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
          Contribution Management
        </h1>
        <p class="text-sm text-slate-600">
          Manage authors, resolve identifiers, and generate contribution text.
        </p>
      </div>

      <div
        class="flex flex-nowrap gap-2 overflow-x-auto rounded-2xl bg-slate-50 p-2 ring-1 ring-inset ring-slate-200"
      >
        <PasteAuthorNames
          buttonClass={controlButtonPrimary}
          onApply={applyAuthorDump}
        />

        <button
          class={`${controlButtonSubtle} shrink-0`}
          on:click={() => store.addAuthor()}>Add Author</button
        >

        <button
          class={`${controlButtonAccent} shrink-0`}
          on:click={() => {
            $store.authors.forEach((author, idx) => {
              getORCID(author.name).then((orcid) => {
                if (orcid) {
                  store.updateAuthorProperty(idx, "orcid", orcid);
                }
              });
            });
          }}>Get ORCIDs</button
        >

        <button
          class={`${controlButtonIndigo} shrink-0`}
          on:click={() => {
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
      </div>
    </div>
  </div>

  <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div
      class="hidden items-center gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid author-table-cols"
    >
      <div>Name</div>
      <div>ORCID</div>
      <div>Email</div>
      <div>Affiliation</div>
    </div>
    {#each $store.authors as author, idx}
      <Author {author} {idx} />
    {/each}
  </div>

  <div
    class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold text-slate-900">Authorship Block</h2>
      <label class="text-sm text-slate-600" for="template">Template</label>
      <select
        id="template"
        class="rounded-md border border-slate-300 bg-slate-50 px-2 py-1"
        bind:value={template}
      >
        {#each Object.keys(templates) as t}
          <option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        {/each}
      </select>
    </div>
    <textarea
      class="authorship-output rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm"
      readonly
      value={templates[template]($store.authors)}
    ></textarea>
  </div>
</div>

<style>
  .author-table-cols {
    grid-template-columns:
      minmax(12rem, 1.25fr) minmax(11rem, 1fr) minmax(11rem, 1fr)
      minmax(14rem, 1.4fr) auto;
  }

  .authorship-output {
    resize: vertical;
    overflow: auto;
    min-height: 11rem;
    max-height: 65vh;
    width: 100%;
  }
</style>
