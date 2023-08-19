<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  $: if (browser) {
    if ($page.route.id.includes("/projects")) {
      document.body.classList.add("projects");
    } else document.body.classList.remove("projects");
  }
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