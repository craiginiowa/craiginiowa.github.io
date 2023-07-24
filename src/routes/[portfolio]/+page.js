/**
 * load function should fetch files for params.portfolio
 * @param {Object} params
 * @returns
 */

export const load = async ({ fetch, params }) => {
  console.log({ params });
  // const response = await fetch("/api/posts");
  // const posts = await response.json();
  const title = params.portfolio;

  return { title };
};
