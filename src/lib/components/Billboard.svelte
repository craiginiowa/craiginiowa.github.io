<script>
  export let title = "Billboard";
</script>

<div class="billboard">
  <h2>
    {title}
  </h2>
</div>

<style lang="scss">
  .billboard {
    align-items: center;
    border: 1px solid #2c2c2c;
    display: flex;
    margin: 0 0 30px;
    padding: 18px;

    @media (min-width: 768px) {
      margin: 0 0 75px;
    }
  }

  h2 {
    font-size: 42px;
    font-weight: 400;
    margin: 0;
  }
</style>
