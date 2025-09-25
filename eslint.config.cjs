const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const importPlugin = require("eslint-plugin-import");

module.exports = [
    js.configs.recommended,

    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: { project: "./tsconfig.json", ecmaFeatures: { jsx: true } },
        },
        plugins: { "@typescript-eslint": tsPlugin, import: importPlugin },
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },

    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: { react: reactPlugin },
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                console: "readonly",
                fetch: "readonly",
                process: "readonly",
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/jsx-key": "warn",
            "no-console": "off",
            "no-unused-vars": "off",
            "no-undef": "off",
            "no-useless-escape": "off"
        },
    },

    {
        ignores: ["tailwind.config.js", "postcss.config.js", "next.config.js", "scripts/**", "**/*.jsx", "**/*.ts", "**/hooks"],
    },
];
