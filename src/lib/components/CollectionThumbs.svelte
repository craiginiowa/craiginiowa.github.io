<script>
  import { base } from "$app/paths";

  export let collection;
  export let path;
  export let name = "";
  export let featured = false;

  $: thumbs = featured
    ? collection
        .filter((item) => item.featured && item.published)
        .slice(0, 4)
        .sort((a, b) => {
          return a.sortorder - b.sortorder;
        })
    : collection
        .filter((item) => item.published)
        .sort((a, b) => {
          return b.title.toLowerCase() < a.title.toLowerCase() ? 1 : -1;
        });
</script>

<div class="thumbnails-container">
  {#if name}
    <a class="thumbnails-more-link right-caret" href={base + path}>{name}</a>
  {/if}
  <div class="thumbnails-grid">
    {#each thumbs as thumb}
      {@const thumbnail = thumb.thumbnail || "no-image.png"}
      <div class="thumbnail-wrapper">
        <a href={base + thumb.path}>
          <div class="thumbnail-inner">
            <img
              class="thumbnail-image"
              src={base + "/img/" + thumbnail}
              alt={thumb.title}
            />
            <div class="thumbnail-promo-text">
              <h4>{thumb.title}</h4>
              <p>{thumb.description}</p>
            </div>
          </div>
        </a>
        <h4>{thumb.title}</h4>
      </div>
    {/each}
  </div>
</div>
