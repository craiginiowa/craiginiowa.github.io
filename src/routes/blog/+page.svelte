<!-- post.svelte -->
<script>
  import { base } from "$app/paths";
  import Billboard from "$lib/components/Billboard.svelte";
  export let data;
  $: console.log(data);
</script>

<Billboard title="blog" />

<ul>
  {#each data.posts as post}
    <li>
      <h2>
        <a href={base + post.path}>
          {post.meta.title}
        </a>
      </h2>
      Published {post.meta.date}
    </li>
  {/each}
</ul>
