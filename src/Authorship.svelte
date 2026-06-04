<script lang="ts">
  import templates from "./templates";
  import store from "./store";
  import { getCreditTaxonomy, type CreditTaxonomyId } from "./creditTaxonomy";

  let template = $state("IEEE" as keyof typeof templates);

  const templateNames = Object.keys(templates) as Array<keyof typeof templates>;
  const activeTaxonomy = $derived(getCreditTaxonomy($store.creditTaxonomyId));
  const latexOutput = $derived(
    templates[template]($store.authors, activeTaxonomy.id as CreditTaxonomyId),
  );

  type LatexToken = {
    text: string;
    className: string;
  };

  function tokenizeLatex(value: string): LatexToken[] {
    const tokens: LatexToken[] = [];
    const matcher = /(%[^\n]*|\\[a-zA-Z@]+|\\.|[{}$&#_^])/g;
    let lastIndex = 0;

    for (const match of value.matchAll(matcher)) {
      const index = match.index ?? 0;

      if (index > lastIndex) {
        tokens.push({
          text: value.slice(lastIndex, index),
          className: "latex-plain",
        });
      }

      const text = match[0];
      let className = "latex-plain";

      if (text.startsWith("%")) {
        className = "latex-comment";
      } else if (text.startsWith("\\")) {
        className = "latex-command";
      } else if (text === "{" || text === "}") {
        className = "latex-brace";
      } else if (text === "$") {
        className = "latex-math";
      } else {
        className = "latex-special";
      }

      tokens.push({ text, className });
      lastIndex = index + text.length;
    }

    if (lastIndex < value.length) {
      tokens.push({ text: value.slice(lastIndex), className: "latex-plain" });
    }

    return tokens;
  }
</script>

<div
  class="flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
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

  <div class="authorship-output-shell">
    <pre
      aria-label="Authorship LaTeX output"
      class="authorship-highlight">{#each tokenizeLatex(latexOutput) as token}<span
          class={token.className}>{token.text}</span
        >{/each}</pre>
  </div>
  <span class="text-xs italic"
    >Authors are encouraged to alter this output as need be in their own
    documents. For instance, our notion of High/Low/No contribution might now
    map to a model of All/None or Primary/Secondary.</span
  >
</div>

<style>
  .authorship-output-shell {
    overflow: visible;
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid rgb(203 213 225);
    background: rgb(248 250 252);
  }

  .authorship-highlight {
    box-sizing: border-box;
    margin: 0;
    width: 100%;
    padding: 0.75rem;
    font-family:
      ui-monospace,
      SFMono-Regular,
      SF Mono,
      Menlo,
      Monaco,
      Consolas,
      Liberation Mono,
      monospace;
    font-size: 0.875rem;
    line-height: 1.5rem;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .authorship-highlight {
    display: block;
    user-select: text;
  }

  .latex-plain {
    color: rgb(15 23 42);
  }

  .latex-command {
    color: rgb(2 132 199);
    font-weight: 600;
  }

  .latex-comment {
    color: rgb(22 163 74);
    font-style: italic;
  }

  .latex-brace {
    color: rgb(100 116 139);
  }

  .latex-math {
    color: rgb(180 83 9);
    font-weight: 600;
  }

  .latex-special {
    color: rgb(124 58 237);
  }
</style>
