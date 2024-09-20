#!/usr/bin/env node

const path = require("path");
const fs = require('fs').promises;
const mvdir = require("mvdir");
const prompts = require("prompts");
const replace = require("replace-in-file");
const slugify = require("slugify");

main();

async function main() {
  const codebase = "project_template"
  const res = await prompts([
    {
      type: "text",
      name: "app",
      message: "What should we call your application?",
    },
    {
      type: async (prev) =>
        (await hasDirectory(getDir(prev))) ? "text" : null,
      name: "dir",
      message: async (prev) =>
        `Looks like a directory already exists called "${slugify(prev, {
          lower: true,
        })}". Where should your app be placed instead?`,
    },
  ]);

  const name = res.app.trim();
  const slug = slugify(name, { lower: true });
  const dir = res.dir || path.join(".", slug);

  try {
    await mvdir(path.join(__dirname, codebase), dir, { copy: true });
    await mvdir(
      path.join(dir, "_gitignore"),
      path.join(dir, ".gitignore")
    );
    await mvdir(
      path.join(dir, "ui", "_gitignore"),
      path.join(dir, "ui", ".gitignore")
    );
    await mvdir(
      path.join(dir, "app", "_gitignore"),
      path.join(dir, "app", ".gitignore")
    );

    const prefixPath = (p) => path.join(dir, p);

    await replace({
      files: [
        "README.md",
        "app/src/lib.rs",
        "metadata.json",
        "ui/index.html"
      ].map(prefixPath),
      from: /%APPNAME%/g,
      to: name,
    });

    await replace({
      files: [
        "metadata.json",
        "ui/package.json",
        "ui/vite.config.ts",
        "ui/src/utils.tsx",
        "Cargo.toml",
        "app/Cargo.toml",
        "pkg/manifest.json"
      ].map(prefixPath),
      from: /%APPSLUG%/g,
      to: slug,
    });

    // Rename the /app folder to the slug
    const oldAppPath = path.join(dir, 'app');
    const newAppPath = path.join(dir, slug);
    await fs.rename(oldAppPath, newAppPath);

    console.log(
      `All done, switch to the "${res.dir || slug}" directory to get started.`
    );
    console.log("Happy hacking!");
  } catch (err) {
    console.log(
      `Something went wrong when generating your app. You may need to delete the folder at ${dir}`
    );
  }
}

async function hasDirectory(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch (err) {
    return false;
  }
}

function getDir(appName) {
  const slug = slugify(appName, { lower: true });
  return path.join(".", appName);
}
