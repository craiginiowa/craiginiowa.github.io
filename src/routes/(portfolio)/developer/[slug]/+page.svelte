<script>
  export let data;
  const { title, description, content } = data;
</script>

<article>
  <h1>{title}</h1>

  <p>Description: {description}</p>

  <svelte:component this={content} />
</article>
