<script>
  export let url;
  export let text;
</script>

<a class="external-link" href={url} target="_blank">
  {text}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.042 17.125">
    <g>
      <polyline
        fill="none"
        points="9.499,2.5 0.5,2.5 0.5,16.5 14.5,16.5 14.5,7.513"
      />
      <g>
        <polyline fill="none" points="16.5,5.457 16.5,0.5 11.482,0.5" />
        <line x1="16.5" y1="0.5" x2="7.678" y2="9.322" />
      </g>
    </g>
  </svg>
</a>

<style lang="scss">
  @use "../styles/colors" as *;

  .external-link {
    color: $site-color;
    cursor: pointer;

    svg {
      margin-left: 8px;
      stroke: $site-color;
      height: 14px;
    }
  }
</style>
