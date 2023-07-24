<!-- page.svelte -->
<script>
  export let data;
</script>

<ul>
  <li>Sample page</li>
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
