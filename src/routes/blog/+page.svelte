<!-- post.svelte -->
<script>
  import { base } from "$app/paths";
  import Billboard from "$lib/components/Billboard.svelte";
  export let data;

  // $: console.log(data);
</script>

<Billboard title="blog" />

<ul post-list>
  {#each data.posts as post}
    <li class="post">
      <h2>
        <a href={base + post.path}>
          {post.title}
        </a>
      </h2>
      Published {post.date}
    </li>
  {/each}
</ul>
