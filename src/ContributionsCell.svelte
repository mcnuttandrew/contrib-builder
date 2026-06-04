<script lang="ts">
  import Popover from "./Popover.svelte";
  import {
    type CreditContributionLevel,
    type CreditTaxonomyId,
    getCreditTaxonomy,
    getCreditContributions,
    getCreditContributionEntries,
    getCreditContributionLevel,
    setCreditContributionLevel,
    setCreditContributions,
    type CreditContributionRoleName,
  } from "./creditTaxonomy";
  import type { Author } from "./store";
  import store from "./store";

  let { author, idx }: { author: Author; idx: number } = $props();

  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));
  const activeContributionEntries = $derived(
    getCreditContributionEntries(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
    ),
  );
  const activeContributions = $derived(
    getCreditContributions(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
    ),
  );
  const contributionSummary = $derived(
    activeContributionEntries
      .map((entry) => `${entry.name} (${entry.level === "high" ? "H" : "L"})`)
      .join(", "),
  );

  const actionButtonStyle =
    "rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100";

  function getNextContributionLevel(
    current: CreditContributionLevel | "none",
  ): CreditContributionLevel | "none" {
    if (current === "none") {
      return "low";
    }

    if (current === "low") {
      return "high";
    }

    return "none";
  }

  function cycleContribution(roleName: CreditContributionRoleName) {
    const currentLevel = getCreditContributionLevel(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
      roleName,
    );
    const nextLevel = getNextContributionLevel(currentLevel);

    store.updateAuthorProperty(
      idx,
      "contributions",
      setCreditContributionLevel(
        author.contributions,
        activeTaxonomy.id as CreditTaxonomyId,
        roleName,
        nextLevel,
      ),
    );
  }

  function clearContributions() {
    store.updateAuthorProperty(
      idx,
      "contributions",
      setCreditContributions(
        author.contributions,
        activeTaxonomy.id as CreditTaxonomyId,
        [],
      ),
    );
  }

  function getLevelDisplay(roleName: CreditContributionRoleName): string {
    const level = getCreditContributionLevel(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
      roleName,
    );

    if (level === "high") {
      return "[H]";
    }

    if (level === "low") {
      return "[L]";
    }

    return "[ ]";
  }

  function getRoleButtonClass(roleName: CreditContributionRoleName): string {
    const level = getCreditContributionLevel(
      author.contributions,
      activeTaxonomy.id as CreditTaxonomyId,
      roleName,
    );

    if (level === "high") {
      return "border-emerald-400 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 cursor-pointer";
    }

    if (level === "low") {
      return "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 cursor-pointer";
    }

    return "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer";
  }
</script>

<div class="flex min-w-0 flex-col gap-1">
  <div
    class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"
  >
    Contributions ({activeTaxonomy.label})
  </div>
  <Popover
    label={contributionSummary ||
      `Select ${activeTaxonomy.label} contributions`}
    buttonClass={activeContributions.length > 0
      ? "w-full rounded-md border border-emerald-300 bg-emerald-50 px-2 py-2 text-left text-sm text-emerald-800 hover:bg-emerald-100 cursor-pointer"
      : "w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 cursor-pointer"}
    wrapperClass="w-full"
    let:close
  >
    <div
      class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {activeTaxonomy.label} contributor roles
    </div>

    {#if activeContributions.length > 0}
      <div class="mb-2 flex flex-wrap gap-1">
        {#each activeContributionEntries as contribution}
          <button
            class={contribution.level === "high"
              ? "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 cursor-pointer"
              : "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 cursor-pointer"}
            onclick={() => cycleContribution(contribution.name)}
            >{contribution.name} ({contribution.level === "high"
              ? "H"
              : "L"})</button
          >
        {/each}
      </div>
    {/if}

    <div class="mb-2 text-[11px] text-slate-500">
      Click each role to cycle: no contribution -> low -> high -> no
      contribution.
    </div>

    <div class="max-h-56 space-y-1 overflow-y-auto pr-1">
      {#each activeTaxonomy.roles as role}
        <div class="group relative">
          <button
            class={`w-full rounded border px-2 py-1 text-left text-xs ${getRoleButtonClass(role.name)}`}
            onclick={() => cycleContribution(role.name)}
            aria-label={`${role.name}: ${role.description}`}
          >
            <div class="font-semibold">
              {getLevelDisplay(role.name)}
              {role.name}
            </div>
            <div class="mt-0.5 text-[11px] leading-relaxed opacity-80">
              {role.description}
            </div>
          </button>

          <!-- <div
            class="pointer-events-none absolute left-2 right-2 top-full z-20 mt-1 hidden rounded-md border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-lg group-hover:block group-focus-within:block"
            role="tooltip"
          >
            {role.description}
          </div> -->
        </div>
      {/each}
    </div>

    <div class="mt-2 flex items-center gap-1">
      <button
        class={actionButtonStyle}
        onclick={clearContributions}
        disabled={activeContributions.length === 0}
      >
        Clear
      </button>
      <button class={actionButtonStyle} onclick={() => close()}>Done</button>
    </div>
  </Popover>
</div>
