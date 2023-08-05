<script>
  import AnimatedSiteLogo from "$lib/components/AnimatedSiteLogo.svelte";
  import DateFormatter from "$lib/components/DateFormatter.svelte";
  import CollectionThumbs from "$lib/components/CollectionThumbs.svelte";
  import TestComponent from "$lib/components/TestComponent.svelte";
  import { base } from "$app/paths";

  export let data;

  const { developer, graphics, illustrations, posts } = data;

  $: pinned = posts.find((post) => post.pinned);

  $: latest = posts.find((post) => post.pinned == false);

  // $: console.log(data);
</script>

<div class="animated-site-logo">
  <AnimatedSiteLogo />
</div>

<!-- <div class="test">
    <TestComponent />
  </div> -->

{#if pinned}
  <div class="post preview">
    <label>PINNED BLOG POST</label>
    <h6 class="timestamp">
      <DateFormatter date={pinned.date} />
    </h6>
    <a class="post-title" href={base + pinned.path}>
      <h2>{pinned.title}</h2>
    </a>
    <p>{@html pinned.excerpt}</p>
    <a class="read-more right-caret" href={base + pinned.path}>READ MORE</a>
  </div>
{/if}

{#if latest}
  <div class="post preview">
    <label>LATEST BLOG ENTRY</label>
    <h6 class="timestamp">
      <DateFormatter date={latest.date} />
    </h6>
    <a class="post-title" href={base + latest.path}>
      <h2>{latest.title}</h2>
    </a>
    <p>{@html latest.excerpt}</p>
    <a class="read-more right-caret" href={base + latest.path}>READ MORE</a>
  </div>
{/if}

<CollectionThumbs
  collection={data.developer}
  name="developer"
  path="/developer/"
  featured="true"
/>

<CollectionThumbs
  collection={data.graphics}
  name="graphic artist"
  path="/graphics/"
  featured="true"
/>

<CollectionThumbs
  collection={data.illustrations}
  name="illustrator"
  path="/illustrations/"
  featured="true"
/>

<style>
  body {
    background-color: green;
  }
  .animated-site-logo {
    background-image: none;
    color: #fff;
    padding: 30px 0;
    position: relative;
  }
</style>
