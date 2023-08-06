<script>
  import Billboard from "$lib/components/Billboard.svelte";
  import CollectionThumbs from "$lib/components/CollectionThumbs.svelte";
  export let data;
</script>

<section class="page-content">
  <Billboard title="illustrator" />
  <CollectionThumbs collection={data.illustrations} path="/illustrations/" />
</section>
