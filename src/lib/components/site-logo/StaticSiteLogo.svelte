<div class="site-logo">
  <div class="billboard">
    <div class="skills-cloud">
      developer • graphic<br />artist • illustrator •<br />copy editor • other<br
      />assorted activities
    </div>
    <div class="craiginiowa-logo">
      <img src="/img/craiginiowa.svg" />
    </div>
  </div>
</div>

<style lang="scss">
  .site-logo {
    background-color: #900;
    background-image: none;
    color: #fff;
    padding: 30px 15px;
    position: relative;
  }
  .billboard {
    align-items: center;
    border: 1px solid #fff;
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 18px;
  }
  .skills-cloud {
    font-size: 13px;
    line-height: 1.35;
    text-align: right;

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }
  .craiginiowa-logo {
    margin-left: 24px;

    img {
      width: 100px;

      @media (min-width: 768px) {
        width: auto;
      }
    }
  }
</style>
