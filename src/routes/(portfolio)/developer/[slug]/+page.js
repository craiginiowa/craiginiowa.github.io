export async function load({ params }) {
  const item = await import(`../samples/${params.slug}.md`);
  const { title, description } = item.metadata;
  const content = item.default;

  return {
    content,
    title,
    description,
  };
}
