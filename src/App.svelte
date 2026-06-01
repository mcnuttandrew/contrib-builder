<script>
  import store from "./store";
  import Author from "./Author.svelte";
  import { getORCID } from "./api";
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
  </div>
</div>
