import { fetchMarkdownPosts } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const posts = await fetchMarkdownPosts();

  return json(posts);
};
