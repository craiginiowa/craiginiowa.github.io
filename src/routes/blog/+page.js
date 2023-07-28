import { fetchMarkdownPosts } from "$lib/utils";

export const load = async () => {
  const allPosts = await fetchMarkdownPosts();

  const sortedPosts = allPosts.sort((a, b) => {
    return new Date(b.meta.date) - new Date(a.meta.date);
  });

  return {
    posts: sortedPosts,
  };
};
