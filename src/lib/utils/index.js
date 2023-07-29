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
      let postPath = path.slice(11, -3).replace("/posts", "");
      const postParts = postPath.match(/\/(\d{4})-(\d{2})-(\d{2})-([^.]+)/);
      const { metadata } = await resolver();

      if (postParts.index == 5) {
        postPath = "/blog/" + postParts.slice(1, 5).join("/");
      }

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
  /*
  return {
    developer: [
      {
        meta: { description: "This is a description.", title: "dev-one" },
        path: "/developer/dev-one",
      },
      {
        meta: { description: "This is a description.", title: "dev-two" },
        path: "/developer/dev-two",
      },
      {
        meta: { description: "This is a description.", title: "dev-three" },
        path: "/developer/dev-three",
      },
    ],
    graphics: [
      {
        meta: { description: "This is a description.", title: "graphics-one" },
        path: "/graphics/graphics-one",
      },
      {
        meta: { description: "This is a description.", title: "graphics-two" },
        path: "/graphics/graphics-two",
      },
      {
        meta: {
          description: "This is a description.",
          title: "graphics-three",
        },
        path: "/graphics/graphics-three",
      },
    ],
    illustrations: [
      {
        meta: {
          description: "This is a description.",
          title: "illustrations-one",
        },
        path: "/illustrations/illustrations-one",
      },
      {
        meta: {
          description: "This is a description.",
          title: "illustrations-two",
        },
        path: "/illustrations/illustrations-two",
      },
      {
        meta: {
          description: "This is a description.",
          title: "illustrations-three",
        },
        path: "/illustrations/illustrations-three",
      },
    ],
  };
  */
};
