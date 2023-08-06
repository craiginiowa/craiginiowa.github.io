<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import Header from "$lib/components/Header.svelte";
  import "$lib/styles/style.scss";

  export let data;

  let main;

  $: if (browser) {
    if ($page.route.id == "/") {
      document.body.classList.add("home");
    } else document.body.classList.remove("home");

    if (main && main.scrollTop > 0) {
      main.scrollTo(0, 0);
    }
  }
</script>

<Header />

<main class="page-wrapper" bind:this={main}>
  {#if $page.route.id == "/"}
    <section class="animated-background" />
  {/if}

  <slot />

  <footer class="site-footer">
    <h5>© Craig Johnson. All Rights Reserved.</h5>
    <div>
      <a
        href="https://www.twitter.com/craiginiowa"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          id="twitter-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 20"
        >
          <path
            d="M23.953,2.322c-0.885,0.391-1.83,0.654-2.825,0.775c1.015-0.611,1.794-1.574,2.163-2.723
                    c-0.951,0.555-2.005,0.959-3.127,1.184C19.268,0.6,17.991,0,16.573,0c-2.717,0-4.92,2.203-4.92,4.918
                    c0,0.389,0.046,0.764,0.127,1.123C7.69,5.848,4.066,3.885,1.641,0.916C1.213,1.637,0.975,2.477,0.975,3.391
                    c0,1.709,0.869,3.213,2.188,4.096C2.355,7.459,1.596,7.238,0.934,6.869v0.062c0,2.385,1.693,4.373,3.946,4.826
                    c-0.413,0.111-0.849,0.17-1.296,0.17c-0.314,0-0.615-0.029-0.916-0.086c0.631,1.953,2.445,3.377,4.604,3.418
                    c-1.68,1.318-3.809,2.104-6.102,2.104c-0.391,0-0.779-0.021-1.17-0.066c2.189,1.395,4.768,2.209,7.557,2.209
                    c9.054,0,13.998-7.496,13.998-13.984c0-0.209,0-0.42-0.015-0.631c0.961-0.689,1.8-1.561,2.46-2.547L23.953,2.322L23.953,2.322z"
          />
        </svg>
      </a>
      <a
        href="mailto:craigjiniowa@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          id="email-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 26 20"
        >
          <g>
            <g>
              <path
                fill="none"
                d="M25.5,16.75c0,1.1-0.9,2-2,2h-21c-1.1,0-2-0.9-2-2V3.25c0-1.1,0.9-2,2-2h21c1.1,0,2,0.9,2,2
                            V16.75z"
              />
            </g>
            <path
              fill="none"
              d="M24.83,1.82L14.414,12.236c-0.777,0.777-2.051,0.777-2.828,0L1.149,1.799"
            />
          </g>
        </svg>
      </a>
    </div>
  </footer>
</main>

<style lang="scss">
  .page-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: calc(100% - 56px);
    justify-content: space-between;
    overflow-y: auto;
    padding: 30px 20px 0;
    position: relative;
    width: 100%;
    z-index: 1;

    @media (min-width: 480px) {
      padding-top: 50px;
    }
  }
</style>
