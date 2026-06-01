<script lang="ts">
  import Popover from "./Popover.svelte";
  import { parseAuthorNames } from "./utils/authorNames";

  let {
    onApply,
    buttonClass = "",
  }: {
    onApply: (names: string[]) => void;
    buttonClass?: string;
  } = $props();

  let bulkAuthorNames = $state("");
  const controlButtonBase =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2";
  const primaryActionButton = `${controlButtonBase} bg-slate-900 text-white hover:bg-slate-800`;
  const secondaryActionButton = `${controlButtonBase} bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50`;

  function applyAuthorDump(close: () => void) {
    const names = parseAuthorNames(bulkAuthorNames);
    if (names.length === 0) {
      return;
    }

    onApply(names);
    bulkAuthorNames = "";
    close();
  }

  function clearAndClose(close: () => void) {
    bulkAuthorNames = "";
    close();
  }
</script>

<Popover label="Paste Author Names" {buttonClass} let:close>
  <div class="flex flex-col gap-3 p-1">
    <div>
      <label
        class="text-sm font-semibold text-slate-900"
        for="bulk-author-names"
      >
        Paste Author Names
      </label>
      <p class="text-xs text-slate-500">
        One or many names, separated by commas, semicolons, lines, or “and”.
      </p>
    </div>
    <textarea
      id="bulk-author-names"
      class="min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
      rows="4"
      placeholder="Paste names separated by lines, commas, semicolons, or 'and'"
      bind:value={bulkAuthorNames}
    ></textarea>
    <div class="flex gap-2">
      <button
        class={primaryActionButton}
        onclick={() => applyAuthorDump(close)}
      >
        Apply Names
      </button>
      <button
        class={secondaryActionButton}
        onclick={() => clearAndClose(close)}
      >
        Clear
      </button>
    </div>
  </div>
</Popover>
