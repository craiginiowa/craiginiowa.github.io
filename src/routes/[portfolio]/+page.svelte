<script>
  import { base } from "$app/paths";
  import Billboard from "$lib/components/Billboard.svelte";
  export let data;

  $: portfolio = data[data.portfolio];
</script>

<Billboard title={data.title} />

<ul>
  {#each portfolio as item}
    <li>
      <h2>
        <a href={base + item.path}>
          {item.meta.title}
        </a>
      </h2>
      <p>{item.meta.description}</p>
    </li>
  {/each}
</ul>
