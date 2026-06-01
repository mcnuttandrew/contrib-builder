<script lang="ts">
  import type { Author } from "./store";
  import ContributionsCell from "./ContributionsCell.svelte";
  import Popover from "./Popover.svelte";
  import store from "./store";
  let { author, idx }: { author: Author; idx: number } = $props();
  let isEditingOrcid = $state(false);
  let orcidDraft = $state("");

  function startEditOrcid() {
    if (typeof author.orcid !== "string") {
      return;
    }

    orcidDraft = author.orcid;
    isEditingOrcid = true;
  }

  function saveOrcidEdit() {
    const value = orcidDraft.trim();
    store.updateAuthorProperty(idx, "orcid", value || null);
    isEditingOrcid = false;
  }

  function cancelOrcidEdit() {
    isEditingOrcid = false;
  }

  const actionButtonStyle =
    "rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100";
  const multiOptionCellStyle =
    "w-full rounded-md border border-amber-300 bg-amber-50 px-2 py-2 text-left text-sm text-amber-800 hover:bg-amber-100";

  const inputStyle =
    "w-full rounded-md border border-slate-300 bg-slate-50 py-1 px-2";
</script>

<div
  class="grid gap-2 border-b border-slate-200 p-3 last:border-b-0 md:grid-cols-[minmax(12rem,1.25fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(14rem,1.4fr)_minmax(14rem,1.4fr)_auto] md:items-start md:gap-3"
>
  <div class="flex min-w-0 flex-col gap-1">
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"
    >
      Name
    </div>
    <input
      value={author.name}
      class={inputStyle}
      placeholder="Author name"
      onchange={(e) => {
        // @ts-ignore
        const value = e.target?.value;
        if (!value) {
          return;
        }
        store.updateAuthorProperty(idx, "name", value);
      }}
    />
    <input
      value={author.email}
      class={inputStyle}
      placeholder="email@example.com"
      onchange={(e) => {
        // @ts-ignore
        const value = e.target?.value;
        store.updateAuthorProperty(idx, "email", value?.trim() ?? "");
      }}
    />
    <div class="flex items-center justify-start gap-1">
      <button
        class={actionButtonStyle}
        onclick={() => store.moveAuthor(idx, idx - 1)}
        aria-label="Move author up"
      >
        Up
      </button>
      <button
        class={actionButtonStyle}
        onclick={() => store.moveAuthor(idx, idx + 1)}
        aria-label="Move author down"
      >
        Down
      </button>
      <button
        class="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
        onclick={() => store.removeAuthor(idx)}
      >
        Remove
      </button>
    </div>
  </div>

  <div class="flex min-w-0 flex-col gap-1">
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"
    >
      ORCID
    </div>
    {#if author.orcid && typeof author.orcid === "string"}
      {#if isEditingOrcid}
        <div
          class="flex flex-col gap-1 rounded-md border border-slate-300 bg-slate-50 p-2"
        >
          <input
            value={orcidDraft}
            class="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
            placeholder="0000-0000-0000-0000"
            onchange={(e) => {
              // @ts-ignore
              orcidDraft = e.target?.value ?? "";
            }}
          />
          <div class="flex items-center gap-1">
            <button class={actionButtonStyle} onclick={saveOrcidEdit}
              >Save</button
            >
            <button class={actionButtonStyle} onclick={cancelOrcidEdit}
              >Cancel</button
            >
          </div>
        </div>
      {:else}
        <div class="flex flex-col gap-1">
          <a
            href={"https://orcid.org/" + author.orcid}
            target="_blank"
            class="truncate text-sm font-medium text-blue-700 underline"
          >
            {author.orcid}
          </a>
          <div class="flex items-center gap-1">
            <button class={actionButtonStyle} onclick={startEditOrcid}
              >Edit</button
            >
            <button
              class={actionButtonStyle}
              onclick={() => store.updateAuthorProperty(idx, "orcid", null)}
            >
              Remove
            </button>
          </div>
        </div>
      {/if}
    {:else if author.orcid && Array.isArray(author.orcid)}
      <Popover
        label={`${author.orcid.length} ORCID options`}
        buttonClass={multiOptionCellStyle}
        wrapperClass="w-full"
        let:close
      >
        <div
          class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Select the correct ORCID
        </div>
        <div class="flex flex-col gap-1">
          {#each author.orcid as o, odx}
            <div
              class="flex items-center justify-between gap-1 rounded border border-slate-200 p-1"
            >
              <a
                href={"https://orcid.org/" + o}
                target="_blank"
                class="truncate font-mono text-xs text-blue-700 underline"
              >
                {o}
              </a>
              <div class="flex items-center gap-1">
                <button
                  class={actionButtonStyle}
                  onclick={() => {
                    const next = (author.orcid as string[]).filter(
                      (_, jdx) => jdx !== odx,
                    );
                    store.updateAuthorProperty(
                      idx,
                      "orcid",
                      next.length > 0 ? next : null,
                    );
                  }}
                >
                  Remove
                </button>
                <button
                  class={actionButtonStyle}
                  onclick={() => {
                    store.updateAuthorProperty(idx, "orcid", o);
                    close();
                  }}
                >
                  Use
                </button>
              </div>
            </div>
          {/each}
        </div>
      </Popover>
    {:else}
      <div
        class="rounded-md border border-dashed border-slate-300 bg-slate-50 p-2 text-sm text-slate-500"
      >
        None
      </div>
    {/if}
  </div>

  <div class="flex min-w-0 flex-col gap-1">
    <div
      class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"
    >
      Affiliation
    </div>
    {#if author.affiliation && Array.isArray(author.affiliation)}
      <Popover
        label={`${author.affiliation.length} affiliation options`}
        buttonClass={multiOptionCellStyle}
        wrapperClass="w-full"
        let:close
      >
        <div
          class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Select the correct affiliation
        </div>
        <div class="flex max-h-56 flex-col gap-1 overflow-y-auto">
          {#each author.affiliation as affiliation, adx}
            <div
              class="flex items-center justify-between gap-1 rounded border border-slate-200 p-1"
            >
              <div
                class="max-w-52 truncate text-xs text-slate-700"
                title={affiliation}
              >
                {affiliation}
              </div>
              <div class="flex items-center gap-1">
                <button
                  class={actionButtonStyle}
                  onclick={() => {
                    const next = (author.affiliation as string[]).filter(
                      (_, jdx) => jdx !== adx,
                    );
                    store.updateAuthorProperty(
                      idx,
                      "affiliation",
                      next.length > 0 ? next : "",
                    );
                  }}
                >
                  Remove
                </button>
                <button
                  class={actionButtonStyle}
                  onclick={() => {
                    store.updateAuthorProperty(idx, "affiliation", affiliation);
                    close();
                  }}
                >
                  Use
                </button>
              </div>
            </div>
          {/each}
        </div>
      </Popover>
    {/if}
    <input
      value={typeof author.affiliation === "string" ? author.affiliation : ""}
      class={inputStyle}
      placeholder="Organization"
      onchange={(e) => {
        // @ts-ignore
        const value = e.target?.value;
        store.updateAuthorProperty(idx, "affiliation", value ?? "");
      }}
    />
  </div>

  <ContributionsCell {author} {idx} />
</div>
