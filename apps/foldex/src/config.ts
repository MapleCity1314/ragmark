import { homedir } from "os";
import { join } from "path";

export interface FoldexConfig {
  dataDir: string;
  searchTool: "builtin" | "ripgrep";
}

export function getConfig(): FoldexConfig {
  return {
    dataDir:
      process.env["FOLDEX_DATA_DIR"] || join(homedir(), ".foldex", "data"),
    searchTool:
      (process.env["FOLDEX_SEARCH_TOOL"] as "builtin" | "ripgrep") ||
      "builtin",
  };
}
