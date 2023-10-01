#!/usr/bin/node

/**
 * Build data file from .md files in portfolio and blog.
 *
 * Format:
 * {
 *    developer: [ { meta: ...frontmatter, path }, ... ],
 *    graphics: [ { meta: ...frontmatter, path }, ... ],
 *    illustrator: [ { meta: ...frontmatter, path }, ... ],
 *    blog: {
 *      drafts: [ { meta: ...frontmatter, excerpt, path, draft: true }, ... ]
 *      posts: [ { meta: ...frontmatter, excerpt, path, draft: false }, ... ]
 *    }
 * }
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { default as frontmatter } from "@github-docs/frontmatter";
import { marked } from "marked";

const DRAFTMODE = false;

const portfolio = {
  developer: "./src/routes/developer/samples",
  graphics: "./src/routes/graphics/samples",
  illustrations: "./src/routes/illustrations/samples",
};
const blog = {
  drafts: "./src/routes/blog/drafts",
  posts: "./src/routes/blog/posts",
};

/**
 *
 * @param {String} dirpath - Directory containing markdown files.
 * @param {String} relpath - Relative path to prefix file name in forming link urls.
 * @param {Boolean} pullExcerpt - Blog posts should include excerpt (first paragraph).
 * @returns
 */
async function readMarkdownFiles(dirpath, relpath, pullExcerpt = false) {
  try {
    const files = await readdir(dirpath);
    const items = [];
    for (const file of files) {
      // Markdown files only
      if (/\.md$/.test(file)) {
        const mdFile = await readFile(dirpath + "/" + file, {
          encoding: "utf8",
        });
        // Get frontmatter and markdown content
        const { data, content } = frontmatter(mdFile);

        if (pullExcerpt) {
          // Process markdown and save text from first <p> tag.
          const html = marked.parse(content, {
            mangle: false,
            headerIds: false,
          });
          data.excerpt = html.match(/<p>(.*)<\/p>/)[1];
          // Remove html
          data.excerpt = data.excerpt.replace(/<[^>]+>/g, "");

        }

        const item = {
          ...data,
          path: relpath + file.slice(0, -3),
        };

        // Flag draft status of blog posts
        if (pullExcerpt) {
          item.draft = dirpath.includes("drafts");
        }

        items.push(item);
      }
    }
    return items;
  } catch (err) {
    console.error(err);
  }
}

for (const key in portfolio) {
  portfolio[key] = await readMarkdownFiles(portfolio[key], `/${key}/`);
}

let posts = await readMarkdownFiles(blog.posts, "/blog/", true);

if (DRAFTMODE) {
  const drafts = await readMarkdownFiles(blog.drafts, "/blog/", true);
  posts = [...posts, ...drafts];
}

posts.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

try {
  writeFile(
    "src/data/data.json",
    JSON.stringify({ ...portfolio, posts }, null, 2)
  );
} catch (err) {
  console.error(err);
}
