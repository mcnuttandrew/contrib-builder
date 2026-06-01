<script lang="ts">
  import { onMount, tick } from "svelte";

  let {
    label,
    buttonClass = "",
    panelClass = "",
    wrapperClass = "",
    placement = "bottom-start",
  }: {
    label: string;
    buttonClass?: string;
    panelClass?: string;
    wrapperClass?: string;
    placement?: "bottom-start" | "bottom-end";
  } = $props();

  let open = $state(false);
  let root: HTMLDivElement | undefined;
  let triggerButton: HTMLButtonElement | undefined;
  let panelElement: HTMLDivElement | undefined;
  let panelStyle = $state("");

  const originClass =
    placement === "bottom-end" ? "origin-top-right" : "origin-top-left";

  function toggle() {
    open = !open;
    if (open) {
      void positionPanel();
    }
  }

  function close() {
    open = false;
  }

  function onDocumentClick(event: MouseEvent) {
    if (!open || !root) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && !root.contains(target)) {
      close();
    }
  }

  async function positionPanel() {
    await tick();
    if (!triggerButton) {
      return;
    }

    const margin = 8;
    const rect = triggerButton.getBoundingClientRect();
    const panelWidth = panelElement?.offsetWidth ?? 320;
    const panelHeight = panelElement?.offsetHeight ?? 220;

    let left = placement === "bottom-end" ? rect.right - panelWidth : rect.left;
    left = Math.max(
      margin,
      Math.min(left, window.innerWidth - panelWidth - margin),
    );

    let top = rect.bottom + 6;
    top = Math.max(
      margin,
      Math.min(top, window.innerHeight - panelHeight - margin),
    );

    panelStyle = `position: fixed; top: ${top}px; left: ${left}px;`;
  }

  function onWindowChange() {
    if (open) {
      void positionPanel();
    }
  }

  function onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }

  onMount(() => {
    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("keydown", onDocumentKeydown);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      document.removeEventListener("keydown", onDocumentKeydown);
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  });
</script>

<div
  class={`relative inline-block shrink-0 align-top ${wrapperClass}`}
  bind:this={root}
>
  <button
    type="button"
    class={buttonClass}
    aria-haspopup="dialog"
    aria-expanded={open}
    onclick={toggle}
    bind:this={triggerButton}
  >
    {label}
  </button>

  {#if open}
    <div
      class={`z-50 w-max min-w-64 max-w-sm rounded-md border border-slate-200 bg-white p-2 shadow-lg ${originClass} ${panelClass}`}
      style={panelStyle}
      role="dialog"
      aria-modal="false"
      bind:this={panelElement}
    >
      <slot {close} />
    </div>
  {/if}
</div>
