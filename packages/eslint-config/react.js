import baseConfig from "./eslint.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
  },
});
