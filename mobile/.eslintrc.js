module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*', '/node_modules/*'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
