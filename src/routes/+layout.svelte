<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import Header from "$lib/components/Header.svelte";
  import "$lib/styles/style.scss";

  let main;
  let scrollY;

  $: if (browser) {
    if ($page.route.id == "/") {
      document.body.classList.add("home");
    } else document.body.classList.remove("home");

    if (main && main.scrollTop > 0) {
      main.scrollTo(0, 0);
    }
  }
</script>

<Header {scrollY} />

<main class="page-wrapper" bind:this={main} on:scroll={() => scrollY = main.scrollTop}>
  {#if $page.route.id == "/"}
    <section class="animated-background" />
  {/if}

  <slot />

  <footer class="site-footer">
    <h5>© Craig Johnson. All Rights Reserved.</h5>
    <div>
      <a
        href="https://bsky.app/profile/craiginiowa.bsky.social"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          id="bluesky-icon"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 530">
          <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
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
    height: 100%;
    justify-content: space-between;
    overflow-y: auto;
    position: relative;
    width: 100%;
    z-index: 1;
  }
</style>
