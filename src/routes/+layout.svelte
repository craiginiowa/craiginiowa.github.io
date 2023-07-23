<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import Header from "$lib/components/Header.svelte";
  import "$lib/styles/style.scss";

  $: if (browser) {
    if ($page.route.id == "/") {
      document.body.classList.add("home");
    } else document.body.classList.remove("home");
  }
</script>

<Header />

<main class="page-wrapper">
  <section class="page-content">
    <slot />
  </section>
</main>
