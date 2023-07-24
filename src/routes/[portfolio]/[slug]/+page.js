/**
 * load should fetch .md file for {params.portfolio}/{params.slug}
 * @param {Object} params
 * @returns
 */
export const load = async ({ fetch, params }) => {
  console.log({ params });
  return {};
  // const response = await fetch("/api/portfolio?target=developer");
  // const files = await response.json();
  // return { files };
};
