import { fetchMarkdownPosts, postExcerpt } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const posts = await fetchMarkdownPosts();
  const pinned = posts.find((post) => post.pinned);
  const firstParagraph = await postExcerpt(pinned);

  return json(firstParagraph);
};
