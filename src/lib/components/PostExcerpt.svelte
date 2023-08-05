<script>
  import DateFormatter from "$lib/components/DateFormatter.svelte";
  import { base } from "$app/paths";
  import { postExcerpt } from "$lib/utils";

  export let post;
  export let kicker;
</script>

<div class="post preview">
  {#if kicker}
    <label>{kicker}</label>
  {/if}
  <h6 class="timestamp">
    <DateFormatter date={new Date(post.meta.date)} />
  </h6>
  <a class="post-title" href={base + post.path}>
    <h2>{post.meta.title}</h2>
  </a>
  <p>{@html post.meta.excerpt}</p>
  <a class="read-more right-caret" href={base + post.path}>READ MORE</a>
</div>
