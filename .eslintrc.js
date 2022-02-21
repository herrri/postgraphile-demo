module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: [
    "airbnb-base",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    quotes: [2, "double"],
    "no-console": "off",
  },
  plugins: [
    "json",
  ],
};
