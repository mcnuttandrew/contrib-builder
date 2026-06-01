<script lang="ts">
  import store from "./store";
  import Author from "./Author.svelte";
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import templates from "./templates";

  let template = "ieee" as keyof typeof templates;
  let bulkAuthorNames = "";

  function parseAuthorNames(value: string): string[] {
    const cleanedLines = value
      .split(/\r?\n/)
      .map((line) =>
        line
          .trim()
          .replace(/^[-*]\s+/, "")
          .replace(/^\d+[.)-]?\s+/, ""),
      )
      .filter(Boolean);

    if (cleanedLines.length === 0) {
      return [];
    }

    const splitPattern = /\s*(?:[,;|]|\band\b)\s*/i;
    const names =
      cleanedLines.length === 1
        ? cleanedLines[0].split(splitPattern)
        : cleanedLines.flatMap((line) =>
            /[;|]|\band\b/i.test(line) ? line.split(splitPattern) : [line],
          );

    return names.map((name) => name.trim()).filter(Boolean);
  }

  function applyAuthorDump() {
    const names = parseAuthorNames(bulkAuthorNames);
    if (names.length === 0) {
      return;
    }

    store.setAuthorsFromNames(names);
  }
</script>

<div class="w-full bg-black text-white p-4">
  <h1 class="text-2xl font-bold">Contribution Management</h1>
</div>
<div class="flex flex-col gap-4 p-4">
  <div class="flex flex-col gap-2 border rounded p-3">
    <label class="text-sm font-semibold" for="bulk-author-names">
      Paste Author Names
    </label>
    <textarea
      id="bulk-author-names"
      class="border p-2 rounded"
      rows="4"
      placeholder="Paste names separated by lines, commas, semicolons, or 'and'"
      bind:value={bulkAuthorNames}
    ></textarea>
    <div class="flex gap-2">
      <button
        class="bg-blue-500 text-white p-2 rounded"
        on:click={applyAuthorDump}>Apply Names</button
      >
      <button
        class="bg-gray-500 text-white p-2 rounded"
        on:click={() => {
          bulkAuthorNames = "";
        }}>Clear</button
      >
    </div>
  </div>

  {#each $store.authors as author, idx}
    <Author {author} {idx} />
  {/each}
  <div>
    <button
      class="bg-blue-500 text-white p-2 rounded"
      on:click={() => store.addAuthor()}>Add Author</button
    >

    <button
      class="bg-blue-500 text-white p-2 rounded"
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
      class="bg-indigo-600 text-white p-2 rounded"
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

  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold">Authorship Block</h2>
      <label class="text-sm" for="template">Template</label>
      <select id="template" class="border p-1 rounded" bind:value={template}>
        <option value="ieee">IEEE</option>
        <option value="acm">ACM</option>
        <option value="cgf">CGF</option>
      </select>
    </div>
    <textarea
      class="authorship-output border p-2 rounded font-mono"
      readonly
      value={templates[template]($store.authors)}
    ></textarea>
  </div>
</div>

<style>
  .authorship-output {
    field-sizing: content;
    resize: none;
    overflow: hidden;
    min-height: 11rem;
    width: 100%;
  }
</style>
