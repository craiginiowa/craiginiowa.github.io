export async function load({ params }) {
  const { year, month, day, slug } = params;
  const post = await import(
    `../../../../posts/${year}-${month}-${day}-${slug}.md`
  );
  const { title, date } = post.metadata;
  const content = post.default;

  return {
    content,
    title,
    date,
  };
}
