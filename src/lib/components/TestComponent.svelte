<script>
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  const sentence = "The quick brown fox jumped over the lazy dog.";
  let visible = false;
  onMount(() => {
    setTimeout(() => (visible = true), 500);
  });
  onDestroy(() => {
    console.log("destory");
  });
</script>

<label>
  <input type="checkbox" bind:checked={visible} />
  toggle me
</label>

<div class="sentence">
  {#if visible}
    {#each sentence.split("") as letter}
      {@const delay = Math.round(Math.random() * 2500 + 1000)}
      <span data-delay={delay} in:fade|global={{ delay, duration: 500 }}
        >{letter}</span
      >
    {/each}
  {/if}
</div>

<style>
  label {
    color: black;
  }
  .sentence {
    color: black;
    font-size: 30px;
  }
</style>
