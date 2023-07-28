import { fetchPortfolioFiles } from "$lib/utils";

export async function load({ fetch }) {
  const site = await fetchPortfolioFiles();
  return {
    ...site,
  };
}

export const prerender = true;
