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
    height: 100%;
    position: relative;
    width: 100%;
  }
</style>
