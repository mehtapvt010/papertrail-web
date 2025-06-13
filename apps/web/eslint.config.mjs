import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    rules: {
      // Disables warnings/errors for unused variables in JS files
      "no-unused-vars": "off",

      // Disables warnings/errors for unused variables in TS files
      "@typescript-eslint/no-unused-vars": "off",

      // Disables: 'is never reassigned. Use 'const' instead.'
      "prefer-const": "off",

      // Disables: 'Unexpected any. Specify a different type.'
      "@typescript-eslint/no-explicit-any": "off",

      // ADD THIS LINE: Disables 'Expected an assignment or function call...'
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];

export default eslintConfig;