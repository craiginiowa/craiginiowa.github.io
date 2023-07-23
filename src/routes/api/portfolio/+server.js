import { fetchPortfolioFiles } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async ({ url }) => {
  const target = url.searchParams.get("target");
  const allFiles = await fetchPortfolioFiles(target);
  const sortedFiles = allFiles.sort((a, b) => {
    return a.meta.title.toLowerCase() - b.meta.title.toLowerCase();
  });

  return json(sortedFiles);
};
