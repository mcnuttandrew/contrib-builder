<script lang="ts">
  import type { Author } from "./store";
  import store from "./store";
  let { author, idx }: { author: Author; idx: number } = $props();
  const buttonStyle = "ml-2 text-sm text-gray-500 cursor-pointer";
</script>

<div class="flex border items-center">
  <input
    value={author.name}
    class="border p-2"
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

  {#if author.orcid && typeof author.orcid === "string"}
    <a
      href={"https://orcid.org/" + author.orcid}
      target="_blank"
      class={buttonStyle}
    >
      (ORCID: {author.orcid})
    </a>
  {:else if author.orcid && Array.isArray(author.orcid)}
    <div class={"flex flex-col"}>
      ORCIDs:
      {#each author.orcid as o, odx}
        <div class={"flex items-center justify-between"}>
          <a
            href={"https://orcid.org/" + o}
            target="_blank"
            class={`${buttonStyle} font-mono underline`}
          >
            {o}
          </a>
          <button
            class={buttonStyle}
            onclick={() => {
              store.updateAuthorProperty(
                idx,
                "orcid",
                (author.orcid as string[]).filter((_, jdx) => jdx !== odx),
              );
            }}
          >
            ❌
          </button>
          <button
            class={buttonStyle}
            onclick={() => store.updateAuthorProperty(idx, "orcid", o)}
          >
            ✔️
          </button>
        </div>
      {/each}
      {#if author.orcid.length >= 2}
        <div class="text-sm text-gray-500">
          Multiple ORCIDs found. Please select the correct one
        </div>
      {/if}
    </div>
  {/if}
  {#if author.affiliation && Array.isArray(author.affiliation)}
    <div class={"flex flex-col"}>
      Affiliations:
      {#each author.affiliation as affiliation, adx}
        <div class={"flex items-center justify-between"}>
          <div class={`${buttonStyle} max-w-md truncate`} title={affiliation}>
            {affiliation}
          </div>
          <button
            class={buttonStyle}
            onclick={() => {
              store.updateAuthorProperty(
                idx,
                "affiliation",
                (author.affiliation as string[]).filter(
                  (_, jdx) => jdx !== adx,
                ),
              );
            }}
          >
            ❌
          </button>
          <button
            class={buttonStyle}
            onclick={() =>
              store.updateAuthorProperty(idx, "affiliation", affiliation)}
          >
            ✔️
          </button>
        </div>
      {/each}
      {#if author.affiliation.length >= 2}
        <div class="text-sm text-gray-500">
          Multiple affiliations found. Please select the correct one
        </div>
      {/if}
    </div>
  {/if}
  <input
    value={author.email}
    class="border p-2"
    placeholder="email@example.com"
    onchange={(e) => {
      // @ts-ignore
      const value = e.target?.value;
      store.updateAuthorProperty(idx, "email", value?.trim() ?? "");
    }}
  />
  <input
    value={typeof author.affiliation === "string" ? author.affiliation : ""}
    class="border p-2 flex-1"
    onchange={(e) => {
      // @ts-ignore
      const value = e.target?.value;
      store.updateAuthorProperty(idx, "affiliation", value ?? "");
    }}
  />
  <div>
    <button class={buttonStyle} onclick={() => store.moveAuthor(idx, idx - 1)}>
      ↑
    </button>
    <button class={buttonStyle} onclick={() => store.moveAuthor(idx, idx + 1)}>
      ↓
    </button>
    <button class={buttonStyle} onclick={() => store.removeAuthor(idx)}>
      Remove
    </button>
  </div>
</div>
