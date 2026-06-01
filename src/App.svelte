<script lang="ts">
  import store from "./store";
  import Author from "./Author.svelte";
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import { parseAuthorNames } from "./utils/authorNames";
  import templates from "./templates";

  let template = "IEEE" as keyof typeof templates;
  let bulkAuthorNames = "";

  function applyAuthorDump() {
    const names = parseAuthorNames(bulkAuthorNames);
    if (names.length === 0) {
      return;
    }

    store.setAuthorsFromNames(names);
  }
</script>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4">
  <div
    class="rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-sm"
  >
    <h1 class="text-2xl font-semibold tracking-tight">
      Contribution Management
    </h1>
  </div>

  <div
    class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <label class="text-sm font-semibold text-slate-700" for="bulk-author-names">
      Paste Author Names
    </label>
    <textarea
      id="bulk-author-names"
      class="min-h-28 rounded-md border border-slate-300 bg-slate-50 p-3 text-slate-800"
      rows="4"
      placeholder="Paste names separated by lines, commas, semicolons, or 'and'"
      bind:value={bulkAuthorNames}
    ></textarea>
    <div class="flex gap-2">
      <button
        class="rounded-md bg-blue-600 px-3 py-2 text-white"
        on:click={applyAuthorDump}>Apply Names</button
      >
      <button
        class="rounded-md bg-slate-200 px-3 py-2 text-slate-800"
        on:click={() => {
          bulkAuthorNames = "";
        }}>Clear</button
      >
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

  <div class="flex flex-wrap gap-2">
    <button
      class="rounded-md bg-blue-600 px-3 py-2 text-white"
      on:click={() => store.addAuthor()}>Add Author</button
    >

    <button
      class="rounded-md bg-sky-600 px-3 py-2 text-white"
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
      class="rounded-md bg-indigo-600 px-3 py-2 text-white"
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
