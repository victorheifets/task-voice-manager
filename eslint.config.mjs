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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/sw.js",
      "public/workbox-*.js",
      "e2e/**",
      "tests/**",
      "scripts/**",
      "test_env/**",
      "test-e2e-*.js",
      "*.config.js",
      "*.config.mjs"
    ]
  },
  {
    rules: {
      // Allow explicit any - common in many codebases
      "@typescript-eslint/no-explicit-any": "warn",
      // Warn on unused vars (allow underscore prefix)
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn"
    }
  }
];

export default eslintConfig;
