<script>
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
        <span>publish date & time</span>
        <!-- <time class="dt-published" datetime="{data.date | date_to_xmlschema }" itemprop="datePublished">
                {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
                {data.date | date: date_format }
            </time> -->
      </p>
    </header>

    <div class="post-content e-content" itemprop="articleBody">
      <svelte:component this={data.content} />
    </div>

    <!-- {%- if site.disqus.shortname -%}
    {%- include disqus_comments.html -%}
    {%- endif -%} -->

    <!-- <a class="u-url" href={data.url} hidden /> -->
  </article>
</section>
