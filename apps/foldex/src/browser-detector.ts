import { homedir } from "os";
import { join } from "path";
import { readFile, access } from "fs/promises";
import type { BrowserBookmark, BrowserDetectResult } from "./types";

interface ChromeBookmarkNode {
  name: string;
  url?: string;
  type?: string;
  children?: ChromeBookmarkNode[];
}

interface ChromeBookmarkRoot {
  roots: Record<string, ChromeBookmarkNode>;
}

export async function detectBrowsers(): Promise<BrowserDetectResult[]> {
  const results: BrowserDetectResult[] = [];

  const browsers = [
    {
      name: "chrome",
      paths: [
        join(
          homedir(),
          "AppData",
          "Local",
          "Google",
          "Chrome",
          "User Data",
          "Default",
          "Bookmarks",
        ),
        join(
          homedir(),
          "Library",
          "Application Support",
          "Google",
          "Chrome",
          "Default",
          "Bookmarks",
        ),
        join(homedir(), ".config", "google-chrome", "Default", "Bookmarks"),
      ],
    },
    {
      name: "edge",
      paths: [
        join(
          homedir(),
          "AppData",
          "Local",
          "Microsoft",
          "Edge",
          "User Data",
          "Default",
          "Bookmarks",
        ),
      ],
    },
    {
      name: "brave",
      paths: [
        join(
          homedir(),
          "AppData",
          "Local",
          "BraveSoftware",
          "Brave-Browser",
          "User Data",
          "Default",
          "Bookmarks",
        ),
        join(
          homedir(),
          "Library",
          "Application Support",
          "BraveSoftware",
          "Brave-Browser",
          "Default",
          "Bookmarks",
        ),
        join(
          homedir(),
          ".config",
          "BraveSoftware",
          "Brave-Browser",
          "Default",
          "Bookmarks",
        ),
      ],
    },
  ];

  for (const browser of browsers) {
    for (const p of browser.paths) {
      try {
        await access(p);
        const bookmarks = await parseChromeBookmarks(p);
        if (bookmarks.length > 0) {
          results.push({
            browser: browser.name,
            path: p,
            bookmarks,
          });
        }
        break;
      } catch {
        continue;
      }
    }
  }

  return results;
}

async function parseChromeBookmarks(
  filePath: string,
): Promise<BrowserBookmark[]> {
  const data = await readFile(filePath, "utf-8");
  const root = JSON.parse(data) as ChromeBookmarkRoot;
  const bookmarks: BrowserBookmark[] = [];

  function walk(node: ChromeBookmarkNode, folder: string) {
    if (node.type === "url" && node.url) {
      bookmarks.push({
        url: node.url,
        title: node.name || node.url,
        folder: folder || undefined,
      });
    }
    if (node.children) {
      const currentFolder = node.name || folder;
      for (const child of node.children) {
        walk(child, currentFolder);
      }
    }
  }

  for (const rootKey of Object.keys(root.roots)) {
    const rootNode = root.roots[rootKey];
    if (rootNode) walk(rootNode, "");
  }

  return bookmarks;
}
