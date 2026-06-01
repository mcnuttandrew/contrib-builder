<script lang="ts">
  let {
    open = false,
    title = "",
    onClose = () => {},
    panelClass = "",
  }: {
    open?: boolean;
    title?: string;
    onClose?: () => void;
    panelClass?: string;
  } = $props();

  function closeModal() {
    onClose();
  }

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function onBackdropKeydown(event: KeyboardEvent) {
    if (
      event.target === event.currentTarget &&
      (event.key === "Escape" || event.key === "Enter" || event.key === " ")
    ) {
      closeModal();
    }
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (open && event.key === "Escape") {
      closeModal();
    }
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]"
    role="button"
    aria-label="Close modal"
    onclick={onBackdropClick}
    onkeydown={onBackdropKeydown}
    tabindex="-1"
  >
    <div
      class={`w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ${panelClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
      tabindex="0"
    >
      <div class="mb-3 flex items-start justify-between gap-3">
        <h2 class="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
          onclick={closeModal}
        >
          ×
        </button>
      </div>
      <slot />
    </div>
  </div>
{/if}
