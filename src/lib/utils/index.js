/**
 * Get markdown files in blog/posts directory. Vite supports importing multiple modules
 * from the file system via the special import.meta.glob function.
 *
 * https://vitejs.dev/guide/features.html#glob-import
 *
 * @returns {Array} - Array of { meta, path } objects
 */
export const fetchMarkdownPosts = async () => {
  const allPostFiles = import.meta.glob("/src/routes/blog/posts/*.md");
  const iterablePostFiles = Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const { metadata } = await resolver();
      const postPath = path.slice(11, -3).replace("/posts", "");
      console.log(postPath);
      return {
        meta: metadata,
        path: postPath,
      };
    })
  );

  return allPosts;
};

/**
 * Get markdown files in portfolio directories. Vite supports importing multiple modules
 * from the file system via the special import.meta.glob function.
 *
 * @returns {Array} - Array of { meta, path } objects
 */
export const fetchPortfolioFiles = async (target) => {
  let targetedPortfolioFiles;

  switch (target) {
    case "developer":
      targetedPortfolioFiles = import.meta.glob(
        "/src/routes/\\(portfolio\\)/developer/samples/*.md"
      );
      break;
    case "graphics":
      targetedPortfolioFiles = import.meta.glob(
        "/src/routes/\\(portfolio\\)/graphics/samples/*.md"
      );
      break;
    case "illustrations":
      targetedPortfolioFiles = import.meta.glob(
        "/src/routes/\\(portfolio\\)/illustrations/samples/*.md"
      );
      break;
    default:
      return [];
  }

  const iterablePortfolioFiles = Object.entries(targetedPortfolioFiles);

  const allFiles = await Promise.all(
    iterablePortfolioFiles.map(async ([path, resolver]) => {
      const { metadata } = await resolver();
      const filePath = path.slice(23, -3).replace("/samples", "");

      return {
        meta: metadata,
        path: filePath,
      };
    })
  );

  return allFiles;
};
