module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [2, { args: "all", argsIgnorePattern: "^_" }],
    "no-control-regex": 0,
    "import/no-unresolved": 0,
    "import/order": [
      "error",
      {
        groups: [
          "external", // Built-in types are first
          "internal",
          ["sibling", "parent"], // Then sibling and parent types. They can be mingled together
          "index", // Then the index file
          "object",
          // Then the rest: internal and external type
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
