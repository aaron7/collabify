module.exports = {
  extends: ['@nkzw'],
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        map: [['@', './src']],
      },
    },
  },
};
