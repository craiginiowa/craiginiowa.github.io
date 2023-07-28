<!-- page.svelte -->
<script>
  export let data;
  $: console.log(data);
</script>

<ul>
  <li><h2>Sample page</h2></li>
  <!-- {#each data.files as file}
    <li>
      <h2>
        <a href={file.path}>
          {file.meta.title}
        </a>
      </h2>
      Description: {file.meta.description}
    </li>
  {/each} -->
</ul>

<style>
  li {
    margin-bottom: 10px;
  }
  h2 {
    margin-bottom: 0;
  }
</style>
