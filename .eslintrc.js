module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2019,
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaFeatures: {
      "jsx": true,
      "experimentalObjectRestSpread": true
    }
  },
  env: {
    es6: true, 
    browser: true
  },
  globals: {
    'persianDate': 'readonly'
  },
  plugins: [
    'svelte3'
  ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  extends: ['eslint:recommended'],
  rules: {
    'import/first': 0,
     'node/no-unsupported-features/es-syntax': 0  
  },
  settings: {
		'svelte3/ignore-styles': () => {return true}
  }
};
