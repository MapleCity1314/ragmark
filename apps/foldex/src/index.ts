import { startServer } from "./server";

startServer().catch((err) => {
  console.error("Foldex MCP server error:", err);
  process.exit(1);
});
