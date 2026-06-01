<script lang="ts">
  import store from "./store";
  import Author from "./Author.svelte";
  import { getAuthorInfoFromORCID, getORCID } from "./api";
  import templates from "./templates";

  let template = "ieee" as keyof typeof templates;
</script>

<div class="w-full bg-black text-white p-4">
  <h1 class="text-2xl font-bold">Contribution Management</h1>
</div>
<div class="flex flex-col gap-4 p-4">
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
