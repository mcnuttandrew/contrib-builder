<script lang="ts">
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import Author from "./Author.svelte";
  import { getCreditTaxonomy, type CreditTaxonomyId } from "./creditTaxonomy";
  import store from "./store";

  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));

  const headerActionButtonBase =
    "inline-flex min-h-0 items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50";
  const headerActionButtonMuted = `${headerActionButtonBase} bg-slate-200/70 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300`;
</script>

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

<style>
  .author-table-cols {
    grid-template-columns:
      minmax(12rem, 1.25fr) minmax(11rem, 1fr) minmax(11rem, 1fr)
      minmax(18rem, 2fr);
  }
</style>
