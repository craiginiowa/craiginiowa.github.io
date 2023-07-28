import { fetchPortfolioFiles } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const allFiles = await fetchPortfolioFiles();
  // const sortedFiles = allFiles.sort((a, b) => {
  //   return a.meta.title.toLowerCase() - b.meta.title.toLowerCase();
  // });

  return json(allFiles);
};
