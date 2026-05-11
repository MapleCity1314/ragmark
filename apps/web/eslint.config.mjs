import reactConfig from "@ragmark/eslint-config/react";

export default [
  ...reactConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "dist/",
    ],
  },
];
