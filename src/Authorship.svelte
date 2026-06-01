<script lang="ts">
  import templates from "./templates";
  import store from "./store";
  let template = $state("IEEE" as keyof typeof templates);

  const templateNames = Object.keys(templates) as Array<keyof typeof templates>;
</script>

<div
  class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full"
>
  <div class="flex flex-col gap-3">
    <div
      class="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
      role="tablist"
      aria-label="Authorship template"
    >
      {#each templateNames as t}
        <button
          type="button"
          role="tab"
          aria-selected={template === t}
          class={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
            template === t
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          }`}
          onclick={() => {
            template = t;
          }}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      {/each}
    </div>
  </div>
  <textarea
    class="authorship-output rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm"
    readonly
    value={templates[template]($store.authors)}
  ></textarea>
</div>

<style>
  .authorship-output {
    resize: vertical;
    overflow: auto;
    min-height: 11rem;
    max-height: 65vh;
    width: 100%;
  }
</style>
