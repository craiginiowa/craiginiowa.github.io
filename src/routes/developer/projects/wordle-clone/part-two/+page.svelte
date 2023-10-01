<script>
  import { afterNavigate } from "$app/navigation";
  import Wordle from "./components/Wordle.svelte";

  let slug = "";
  
  afterNavigate(navigation => {
    slug = navigation?.from?.params?.slug || "wordle-clone-part-two";
  });
</script>

<div class="wordle-clone">
  <Wordle {slug} />
</div>

<style>
  .wordle-clone {
    height: calc(100vh - 56px);
    position: relative;
    width: 100vw;
  }
</style>
