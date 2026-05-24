import baseConfig from "@ragmark/eslint-config/base";

export default [...baseConfig, { ignores: ["dist/", "coverage/"] }];
