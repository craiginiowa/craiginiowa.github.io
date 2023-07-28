const PORTFOLIO_TITLES = {
  developer: "developer",
  graphics: "news graphics",
  illustrations: "illustrator",
};

/**
 * load function should fetch files for params.portfolio
 * @param {Object} params
 * @returns
 */

export async function load({ params }) {
  const { portfolio } = params;
  const title = PORTFOLIO_TITLES[portfolio];
  return { title, portfolio };
}
