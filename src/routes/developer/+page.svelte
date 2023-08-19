<script>
  import Billboard from "$lib/components/Billboard.svelte";
  import CollectionThumbs from "$lib/components/CollectionThumbs.svelte";
  export let data;
</script>

<section class="page-content">
  <p><a href="/developer/projects/my-project">My Project</a></p>
  <Billboard title="developer" />
  <CollectionThumbs collection={data.developer} path="/developer/" />
</section>
