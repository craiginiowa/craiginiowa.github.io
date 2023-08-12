<script>
  import { base } from '$app/paths';
  export let data;
</script>

<div class="page-content portfolio">
  <section class="column content">
    {#each data.images as image}
      <img class="portfolio-image" src="{base}/img/{image}" alt={data.title} />
    {/each}
  </section>
  <section class="column text">
    <p><a class="back-link" href="{base}/{data.cid}">&#8592; {data.cid}</a></p>
    <svelte:component this={data.content} />
  </section>
</div>
