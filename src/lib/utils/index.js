/**
 * Get markdown files in blog/posts directory. Vite supports importing multiple modules
 * from the file system via the special import.meta.glob function.
 *
 * If includeDrafPosts is true, grab posts in blog/drafts directory as well.
 *
 * https://vitejs.dev/guide/features.html#glob-import
 *
 * @returns {Array} - Array of { meta, path } objects
 */
export const fetchMarkdownPosts = async () => {
  const allPostFiles = import.meta.glob("/src/routes/blog/posts/*.md");
  const draftPostFiles = import.meta.glob("/src/routes/blog/drafts/*.md");

  const INCLUDE_DRAFT_POSTS = false;

  const iterablePostFiles = INCLUDE_DRAFT_POSTS
    ? Object.entries({ ...allPostFiles, ...draftPostFiles })
    : Object.entries(allPostFiles);

  const allPosts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      const draft = path.includes("drafts");
      const postPath = path.slice(11, -3).replace(/\/posts|\/drafts/, "");
      const { metadata } = await resolver();

      return {
        meta: metadata,
        path: postPath,
        draft,
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
export const fetchPortfolioFiles = async () => {
  const portfolioFiles = {
    developer: null,
    graphics: null,
    illustrations: null,
  };

  for (let key in portfolioFiles) {
    let globbedFiles;

    switch (key) {
      case "developer":
        globbedFiles = import.meta.glob(
          "/src/routes/[portfolio]/developer/*.md"
        );
        break;
      case "graphics":
        globbedFiles = import.meta.glob(
          "/src/routes/[portfolio]/graphics/*.md"
        );
        break;
      case "illustrations":
        globbedFiles = import.meta.glob(
          "/src/routes/[portfolio]/illustrations/*.md"
        );
        break;
    }

    const iterableFiles = Object.entries(globbedFiles);
    const allFiles = await Promise.all(
      iterableFiles.map(async ([path, resolver]) => {
        const { metadata } = await resolver();
        const filePath = path.slice(23, -3);
        return {
          meta: metadata,
          path: filePath,
        };
      })
    );
    portfolioFiles[key] = allFiles;
  }

  return portfolioFiles;
};

/**
 * Get first paragraph of blog post at path.
 * @param {String}
 */
export async function postExcerpt(post) {
  const { path, draft } = post;
  const slug = path.replace("/blog/", "");
  let firstParagraph;

  try {
    if (draft) {
      post = await import(`../../routes/blog/drafts/${slug}.md`);
    } else {
      post = await import(`../../routes/blog/posts/${slug}.md`);
    }
  } catch (err) {
    console.log(err);
  }

  if (typeof post.default.render == "function") {
    const { html } = await post.default.render();
    firstParagraph = html.split("</p>")[0].replace(/^<[^>]+>/, "");
  }

  return firstParagraph;
}
