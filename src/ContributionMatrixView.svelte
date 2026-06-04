<script lang="ts">
  import {
    getCreditContributionLevel,
    getCreditTaxonomy,
    setCreditContributionLevel,
    type CreditContributionLevel,
    type CreditContributionRoleName,
    type CreditTaxonomyId,
  } from "./creditTaxonomy";
  import type { Author } from "./store";
  import store from "./store";

  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));

  function nextContributionLevel(
    current: CreditContributionLevel | "none",
  ): CreditContributionLevel | "none" {
    const order = ["none", "high", "low"] as const;
    const currentIndex = order.indexOf(current);
    const nextIndex = (currentIndex + 1) % order.length;
    return order[nextIndex];
  }

  function getCellLevel(
    author: Author,
    roleName: CreditContributionRoleName,
  ): CreditContributionLevel | "none" {
    return getCreditContributionLevel(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
      roleName,
    );
  }

  function cycleContribution(
    authorIdx: number,
    roleName: CreditContributionRoleName,
  ) {
    const author = $store.authors[authorIdx];
    if (!author) {
      return;
    }

    const currentLevel = getCellLevel(author, roleName);
    const nextLevel = nextContributionLevel(currentLevel);

    store.updateAuthorProperty(
      authorIdx,
      "contributions",
      setCreditContributionLevel(
        author.contributions,
        activeTaxonomy.id as CreditTaxonomyId,
        roleName,
        nextLevel,
      ),
    );
  }

  function getCellButtonClass(level: CreditContributionLevel | "none"): string {
    if (level === "high") {
      return "border-emerald-500 bg-emerald-100 text-emerald-900 hover:bg-emerald-200";
    }

    if (level === "low") {
      return "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200";
    }

    return "border-slate-300 bg-white text-slate-500 hover:bg-slate-100";
  }

  function getCellLabel(level: CreditContributionLevel | "none"): string {
    if (level === "high") {
      return "H";
    }

    if (level === "low") {
      return "L";
    }

    return "";
  }
</script>

<div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
  <div class="mb-2 text-xs text-slate-500">
    Click a cell to cycle contribution level: none -> high -> low -> none.
  </div>

  <div class="overflow-auto">
    <table class="min-w-full border-collapse text-xs">
      <thead>
        <tr class="bg-slate-100">
          <th
            class="sticky left-0 z-10 min-w-72 border border-slate-200 bg-slate-100 p-2 text-left font-semibold text-slate-700"
          >
            Contribution Type
          </th>
          {#each $store.authors as author, idx}
            <th
              class="min-w-36 border border-slate-200 p-2 text-center font-semibold text-slate-700"
            >
              <div
                class="line-clamp-2"
                title={author.name.trim() || `Author ${idx + 1}`}
              >
                {author.name.trim() || `Author ${idx + 1}`}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each activeTaxonomy.roles as role}
          <tr>
            <th
              class="sticky left-0 z-10 min-w-72 border border-slate-200 bg-white px-2 py-1 text-left align-top"
              scope="row"
            >
              <div class="font-semibold text-slate-800">{role.name}</div>
              <div class="text-[10px] leading-relaxed text-slate-500">
                {role.description}
              </div>
            </th>
            {#each $store.authors as author, idx}
              {@const level = getCellLevel(author, role.name)}
              <td class="border border-slate-200 p-1 text-center">
                <button
                  class={`h-8 w-full rounded border text-sm font-semibold transition-colors cursor-pointer ${getCellButtonClass(level)}`}
                  onclick={() => cycleContribution(idx, role.name)}
                  aria-label={`${role.name} contribution for ${author.name || `author ${idx + 1}`}: ${level}`}
                >
                  {getCellLabel(level)}
                </button>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
