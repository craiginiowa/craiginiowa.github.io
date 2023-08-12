export async function load({ params }) {
  const { slug } = params;
  let module;

  try {
    module = await import(`../samples/${slug}.md`);
  } catch (err) {
    console.log(err);
  }

  const { metadata } = module;
  const content = module.default;

  return {
    ...metadata,
    content,
  };
}
