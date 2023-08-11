<script>
  import DateFormatter from "$lib/components/DateFormatter.svelte";

export let data;
</script>

<section class="page-content blog-post">
  <article class="post" itemscope itemtype="http://schema.org/BlogPosting">
    <header class="post-header">
      {#if data.image}
        <figure class="post-image">
          <img src={data.image.url} alt={data.title} />
          {#if data.image.caption}
            <figcaption>
              {data.image.caption}
              {#if data.image.credit}
                <b>{data.image.credit}</b>
              {/if}
            </figcaption>
          {/if}
        </figure>
      {/if}
      {#if data.headline}
        <h1 class="post-title" itemprop="name headline">{data.headline}</h1>
      {:else}
        <h1 class="post-title" itemprop="name headline">{data.title}</h1>
      {/if}
      <p class="post-meta">
        <DateFormatter date={data.date} />
      </p>
    </header>

    <div class="post-content e-content" itemprop="articleBody">
      <svelte:component this={data.content} />
    </div>
  </article>
</section>
