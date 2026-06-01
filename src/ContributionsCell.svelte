<script lang="ts">
  import Popover from "./Popover.svelte";
  import {
    CREDIT_CONTRIBUTION_ROLES,
    type CreditContributionRoleName,
  } from "./creditTaxonomy";
  import type { Author } from "./store";
  import store from "./store";

  let { author, idx }: { author: Author; idx: number } = $props();

  const actionButtonStyle =
    "rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100";

  function toggleContribution(roleName: CreditContributionRoleName) {
    const hasRole = author.contributions.includes(roleName);
    const next = hasRole
      ? author.contributions.filter((selected) => selected !== roleName)
      : [...author.contributions, roleName];

    store.updateAuthorProperty(idx, "contributions", next);
  }

  function clearContributions() {
    store.updateAuthorProperty(idx, "contributions", []);
  }
</script>

<div class="flex min-w-0 flex-col gap-1">
  <div
    class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:hidden"
  >
    Contributions (CRediT)
  </div>
  <Popover
    label={author.contributions.join(", ") || "Select contributions"}
    buttonClass={author.contributions.length > 0
      ? "w-full rounded-md border border-emerald-300 bg-emerald-50 px-2 py-2 text-left text-sm text-emerald-800 hover:bg-emerald-100 cursor-pointer"
      : "w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 cursor-pointer"}
    wrapperClass="w-full"
    let:close
  >
    <div
      class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      CRediT contributor roles
    </div>

    {#if author.contributions.length > 0}
      <div class="mb-2 flex flex-wrap gap-1">
        {#each author.contributions as contribution}
          <button
            class="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 cursor-pointer"
            onclick={() => toggleContribution(contribution)}
            >{contribution}</button
          >
        {/each}
      </div>
    {/if}

    <div class="max-h-56 space-y-1 overflow-y-auto pr-1">
      {#each CREDIT_CONTRIBUTION_ROLES as role}
        <div class="group relative">
          <button
            class={`w-full rounded border px-2 py-1 text-left text-xs ${
              author.contributions.includes(role.name)
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-pointer hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            }`}
            onclick={() => toggleContribution(role.name)}
            aria-label={`${role.name}: ${role.description}`}
          >
            <div class="font-semibold">
              {author.contributions.includes(role.name) ? "[x]" : "[ ]"}
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
        disabled={author.contributions.length === 0}
      >
        Clear
      </button>
      <button class={actionButtonStyle} onclick={() => close()}>Done</button>
    </div>
  </Popover>
</div>
