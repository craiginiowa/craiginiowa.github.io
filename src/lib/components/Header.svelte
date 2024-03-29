<script>
  import { browser } from "$app/environment";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { base } from "$app/paths";

  export let scrollY;

  $: isHoverableDevice =
    browser && window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;

  let hide = false;
  let lastScrollY;
  let navInput;

  $: if (isHoverableDevice) {
    if (!hide && scrollY > lastScrollY) {
      hide = true;
    } else if (hide && scrollY < lastScrollY) {
      hide = false;
    }
    lastScrollY = scrollY;
  }

  afterNavigate(() => navInput.checked = false);
</script>

<header class="site-header" class:hide>
  <div class="site-header-background" />
  <div class="site-header-wrapper">
    <label for="nav-trigger" class="menu-icon">
      <svg viewBox="0 0 18 15" width="18px" height="15px">
        <path
          d="M18,1.484c0,0.82-0.665,1.484-1.484,1.484H1.484C0.665,2.969,0,2.304,0,1.484l0,0C0,0.665,0.665,0,1.484,0 h15.032C17.335,0,18,0.665,18,1.484L18,1.484z M18,7.516C18,8.335,17.335,9,16.516,9H1.484C0.665,9,0,8.335,0,7.516l0,0 c0-0.82,0.665-1.484,1.484-1.484h15.032C17.335,6.031,18,6.696,18,7.516L18,7.516z M18,13.516C18,14.335,17.335,15,16.516,15H1.484 C0.665,15,0,14.335,0,13.516l0,0c0-0.82,0.665-1.483,1.484-1.483h15.032C17.335,12.031,18,12.695,18,13.516L18,13.516z"
        />
      </svg>
    </label>
    <input id="nav-trigger" type="checkbox" bind:this={navInput} />
    <nav class="site-nav">
      <div class="site-logo-text">craig<span>in</span>iowa</div>
      {#if $page.route.id != "/"}
        <a class="home-link page-link" href="{base}/">home</a>
      {/if}
      <span class="page-link-dropdown">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="work">work</label>
        <div>
          <a
            class="page-link"
            class:active={$page?.route.id.includes("developer")}
            href="{base}/developer">developer</a>
          <a
            class="page-link"
            class:active={$page?.route.id.includes("graphics")}
            href="{base}/graphics">graphics</a>
          <a
            class="page-link"
            class:active={$page?.route.id.includes("illustrations")}
            href="{base}/illustrations">illustrations</a>
        </div>
      </span>
      <a
        class="page-link"
        class:active={$page?.route.id.includes("blog")}
        href="{base}/blog">blog</a>
      <a
        class="page-link"
        class:active={$page?.route.id.includes("about")}
        href="{base}/about">about</a>
    </nav>
    <a class="site-name" rel="author" href="{base}/">
      <div class="site-logo-text">craig<span>in</span>iowa</div>
    </a>
  </div>
</header>

<style lang="scss">
  @use "../styles/colors" as *;
  @use "../styles/variables" as *;

  $dropdown-text-color: rgba(0, 0, 0, 0.35);
  $header-background-opacity: 0.85;

  .site-header {
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 2;
  }

  :global(.site-header-background) {
    background-color: $white-color;
    clip-path: polygon(0 0, 100% 0, 100% 56px, 0 56px);
    pointer-events: none;
    position: fixed;
    height: 100vh;
    opacity: $header-background-opacity;
    transition: opacity 0.3s;
    width: 100vw;
    z-index: -1;

    .hide & {
      opacity: 0;
    }
  }

  :global(.home .site-header-background) {
    background-color: transparent;
    background-image: $radial-red;
  }

  .site-header-wrapper {
    align-items: center;
    display: flex;
    font-size: 18px;
    height: 56px;
    padding: 0 20px;
    transform: translateY(0%);
    transition: transform 0.3s;

    .hide & {
      transform: translateY(-100%);
    }

    @media (min-width: 768px) {
      flex-direction: row-reverse;
      justify-content: space-between;
    }
  }

  .site-header:hover .site-header-wrapper {
    transform: translate(0%);
  }

  .site-header:hover .site-header-background {
    opacity: $header-background-opacity;
  }

  .menu-icon {
    margin-left: -12px;
    padding: 6px 12px;
    position: relative;
    top: 2px;

    svg {
      fill: #666;

      :global(.home) & {
        fill: $white-color;
      }
    }

    @media (min-width: 768px) {
      display: none;
    }
  }

  #nav-trigger {
    position: fixed;
    left: -20px;
    top: -20px;

    &:checked {
      &::before {
        color: $white-color;
        content: "\2715";
        font-size: 20px;
        position: fixed;
        right: 26px;
        top: 24px;
        z-index: 1001;
      }

      &::after {
        background-color: rgba(0, 0, 0, 0.5);
        content: "";
        left: 0;
        position: fixed;
        height: 100vh;
        top: 0;
        width: 100vw;
      }
    }

    @media (min-width: 768px) {
      display: none;
    }
  }

  .site-nav {
    background-color: $white-color;
    box-sizing: border-box;
    color: #333;
    position: fixed;
    height: 100vh;
    left: -250px;
    padding: 20px;
    top: 0;
    transition: left 0.3s;
    width: 250px;

    @media (min-width: 768px) {
      background-color: transparent;
      position: static;
      height: initial;
      width: initial;
    }
  }

  .site-header #nav-trigger:checked ~ .site-nav {
    left: 0px;
  }

  .site-name {
    opacity: 1;
  }

  .site-logo-text {
    color: $text-color;
    font-size: 20px;
    font-weight: 700;

    span {
      color: $dropdown-text-color;
    }

    :global(.home) & {
      color: $white-color;

      span {
        color: $white-color-light;
      }
    }

    @media (min-width: 768px) {
      .site-nav & {
        display: none;
      }
    }

    .site-nav & {
      color: $text-color;
      margin-bottom: 18px;

      span {
        color: rgba(0, 0, 0, 0.5) !important;
      }
    }
  }

  .page-link-dropdown {
    label {
      display: inline-block;
      margin-bottom: 15px;

      &.work {
        display: none;
      }

      @media (min-width: 768px) {
        color: $dropdown-text-color;
        cursor: pointer;
        margin-bottom: 0;
        padding-right: 6px;
        position: relative;
        transition: color 0.2s;

        &.work {
          display: inline-block;
        }

        :global(.home) & {
          color: $white-color-light;

          &:hover {
            color: $white-color;
          }
        }

        &:hover {
          color: $text-color;
        }

        &::after {
          border-style: solid;
          border-color: inherit;
          border-width: 0 2px 2px 0;
          content: "";
          display: inline-block;
          height: 6px;
          margin-left: 3px;
          position: relative;
          right: -3px;
          top: -3px;
          transform: rotate(45deg);
          width: 6px;
        }
      }
    }

    div {
      .home & {
        background-color: unset;
      }

      /* Invisible block to maintain hover state */
      &::before {
        bottom: 100%;
        content: "";
        height: 20px;
        position: absolute;
        width: 100%;
      }

      @media (min-width: 768px) {
        background-color: rgba(255, 255, 255, $header-background-opacity);
        display: none;
        margin-left: -10px;
        padding: 0 10px 10px;
        position: absolute;
        top: 100%;
      }
    }

    @media (min-width: 768px) {
      display: inline-block;
      margin-left: 30px;
    }
  }

  .page-link-dropdown:hover > div {
    display: block;
  }

  .page-link {
    color: $dropdown-text-color;
    display: block;
    margin-bottom: 15px;

    &.active {
      color: $text-color;
    }

    @media (min-width: 768px) {
      display: inline;
      margin-left: 30px;
      transition: color 0.2s;

      :global(.home) & {
        color: $white-color-light;

        &.active,
        &:hover {
          color: $white-color;
        }
      }

      &:hover {
        color: $text-color;
      }

      .page-link-dropdown & {
        display: block;
        margin: 0;
        padding: 6px 0;
      }
    }
  }
</style>
