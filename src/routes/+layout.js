export const prerender = true;

export async function load() {
  console.log("layout.js load");
  const site = {
    developer: [
      { slug: "dev-one" },
      { slug: "dev-two" },
      { slug: "dev-three" },
    ],
    graphics: [
      { slug: "graphics-one" },
      { slug: "graphics-two" },
      { slug: "graphics-three" },
    ],
    illustrations: [
      { slug: "illustrations-one" },
      { slug: "illustrations-two" },
      { slug: "illustrations-three" },
    ],
  };

  return {
    ...site,
  };
}
