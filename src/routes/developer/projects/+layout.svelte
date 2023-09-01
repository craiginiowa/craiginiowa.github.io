<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";

  onMount(() => {
    if (browser) {
      document.body.classList.add("projects");
    }
  });
  onDestroy(() => {
    if (browser) {
      document.body.classList.remove("projects");
    }
  });
</script>

<section class="app-content">
  <slot />
</section>

<style>
  .app-content {
    height: calc(100vh - 56px);
    margin-top: 56px;
    width: 100vw;
  }
</style>