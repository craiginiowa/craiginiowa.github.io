export async function load({ params }) {
  const { slug } = params;
  let post;

  try {
    post = await import(`../posts/${slug}.md`);
  } catch (err) {
    try {
      post = await import(`../drafts/${slug}.md`);
    } catch (err) {
      console.log(err);
    }
  }

  const { title, date } = postdata;
  const content = post.default;

  return {
    content,
    title,
    date,
  };
}
