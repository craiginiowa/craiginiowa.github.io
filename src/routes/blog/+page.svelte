<script>
  import Billboard from "$lib/components/Billboard.svelte";
  import DateFormatter from "$lib/components/DateFormatter.svelte";
  export let data;
</script>

<div class="page-content">
  <Billboard title="blog" />

  {#if data.posts.length > 0}
    <ul class="post-list">
      {#each data.posts as post}
        <li class="post">
          <span class="post-meta">
            <DateFormatter date={post.date} />
          </span>
          <a href={post.path}>
            <h2>{post.title}</h2>
          </a>
          <p>
            {@html post.excerpt}
          </p>
          <a class="read-more right-caret" href={post.path}>READ MORE</a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
