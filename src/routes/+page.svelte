<script>
  import AnimatedSiteLogo from "$lib/components/AnimatedSiteLogo.svelte";
  import PostExcerpt from "$lib/components/PostExcerpt.svelte";
  import TestComponent from "$lib/components/TestComponent.svelte";

  export let data;

  const { developer, graphics, illustrations, posts } = data;

  $: pinned = posts.find((post) => post.meta.pinned);

  // $: console.log(data);
</script>

<div class="animated-site-logo">
  <AnimatedSiteLogo />
</div>

<!-- <div class="test">
    <TestComponent />
  </div> -->

{#if pinned}
  <PostExcerpt post={pinned} kicker="PINNED BLOG POST" />
{/if}

<!--
  {%- assign pinned = site.posts | where: "pinned", true | first -%}
  {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
  {% if pinned %} 
  {% endif %}

  {%- assign latest = site.posts | where: "pinned", false | first -%}
  {% if latest %}
  <div class="post preview">
    <label>LATEST BLOG ENTRY</label>
    <h6 class="timestamp">{{ latest.date | date: date_format }}</h6>
    <a class="post-title" href="{{ latest.url | relative_url }}">
      <h2>{{ latest.title | escape }}</h2>
    </a>
    {{ latest.excerpt }}
    <a class="read-more right-caret" href="{{ latest.url | relative_url }}">READ MORE</a>
  </div>
  {% endif %}
-->

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
