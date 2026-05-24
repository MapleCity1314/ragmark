import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v4";
import { addBookmark } from "./tools/add-bookmark";
import { searchKnowledge } from "./tools/search";
import { listBookmarks } from "./tools/list";
import { removeBookmark } from "./tools/remove";
import { importBookmarks } from "./tools/import";
import { syncBookmarks } from "./tools/sync-bookmarks";

export async function createServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "foldex",
    version: "0.0.0",
  });

  server.tool(
    "add_bookmark",
    "Save a URL to your knowledge base. Fetches the page, extracts content, converts to Markdown, and stores locally.",
    {
      url: z.string().describe("The URL to save"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Optional tags for organization"),
    },
    async ({ url, tags }) => {
      const result = await addBookmark(url, tags ?? []);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "search_knowledge",
    "Full-text search across all saved bookmarks. Supports filtering by author, tag, section, and date range.",
    {
      query: z.string().describe("Search query (natural language)"),
      max_results: z
        .number()
        .optional()
        .describe("Maximum number of results (default: 5)"),
      author: z.string().optional().describe("Filter by author name"),
      tag: z.string().optional().describe("Filter by tag"),
      section: z.string().optional().describe("Filter by section heading"),
      date_from: z
        .string()
        .optional()
        .describe("Filter by published date from (YYYY-MM-DD)"),
      date_to: z
        .string()
        .optional()
        .describe("Filter by published date to (YYYY-MM-DD)"),
    },
    async (params) => {
      const result = await searchKnowledge(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "list_bookmarks",
    "List all saved bookmarks. Optionally filter by tags.",
    {
      tags: z
        .array(z.string())
        .optional()
        .describe("Filter by tags (matches user tags and auto-tags)"),
    },
    async ({ tags }) => {
      const result = await listBookmarks({ tags });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "remove_bookmark",
    "Remove a bookmark and its stored Markdown file.",
    {
      url_or_id: z
        .string()
        .describe("The URL or bookmark ID to remove"),
    },
    async ({ url_or_id }) => {
      const result = await removeBookmark(url_or_id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "import_bookmarks",
    "Bulk import bookmarks from a Chrome/Firefox bookmarks HTML export file.",
    {
      file_path: z
        .string()
        .describe("Path to the bookmarks HTML file"),
    },
    async ({ file_path }) => {
      const result = await importBookmarks(file_path);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "sync_bookmarks",
    "Auto-detect and sync bookmarks from local browsers (Chrome, Edge, Brave). Incremental — only imports new URLs.",
    {
      browsers: z
        .array(z.string())
        .optional()
        .describe("Limit to specific browsers: chrome, edge, brave. Omit to detect all."),
    },
    async ({ browsers }) => {
      const result = await syncBookmarks(browsers);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

export async function startServer(): Promise<void> {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
