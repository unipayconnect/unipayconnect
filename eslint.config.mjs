module.exports = {
  env: {
    browser: true,      // Enables browser global variables like `window`
    es2021: true,        // Enables ES2021 features
    node: true,          // Enables Node.js global variables like `process`
  },
  extends: [
    'airbnb',            // Uses the Airbnb style guide
    'airbnb/hooks',      // Airbnb's React hooks rules
    'plugin:react/recommended',  // React specific linting rules
    'plugin:jsx-a11y/recommended',  // Accessibility rules
    'plugin:import/errors',  // Helps with import/export syntax errors
    'plugin:import/warnings',
    'plugin:import/typescript',  // Helps with TypeScript imports
    'prettier',           // Disables conflicting Prettier rules
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,         // Enables JSX
    },
    ecmaVersion: 'latest', // Latest ECMAScript version
    sourceType: 'module',  // Enables module imports
  },
  plugins: [
    'react',             // React specific linting rules
    'jsx-a11y',          // Accessibility linting rules
    'import',            // Import/export linting rules
  ],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }], // Allow JSX in .js files
    'react/react-in-jsx-scope': 'off', // React 17+ no need to import React in scope
    'import/prefer-default-export': 'off', // Allow single named exports
    'no-console': 'warn', // Warn on console statements
    'no-unused-vars': 'warn', // Warn on unused variables
    'no-unknown-animations': [
      'warn',
      {
        ignoreAtRules: ['tailwind'], // Ignore Tailwind CSS at-rules
      },
    ],
  },
  settings: {
    react: {
      version: 'detect', // Auto-detect React version
    },
  },
};
