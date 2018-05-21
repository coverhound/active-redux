module.exports = {
  extends: '@coverhound/coverhound',
  env: {
    'jest/globals': true
  },
  plugins: [
    'jest'
  ],
  rules: {
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'no-undef': 'off', // not compatible with typescript
  },
  parser: 'typescript-eslint-parser',
};
