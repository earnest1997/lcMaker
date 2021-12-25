module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended', 'airbnb-base',"plugin:vue/essential","eslint:recommended"],
  rules: {
    'linebreak-style': 0,
    'no-console': 'off',
    'no-': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-unused-components': 0,
    'no-unused-vars': 0,
    'import/order': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'comma-dangle': 0,
    'symbol-description':'off',
    'vue/attribute-hyphenation':0,
    'array-callback-return':0,
    'prefer-const':0,
    'no-shadow':0,
    'no-multiple-empty-lines':0,
    'semi': 0,
    'key-spacing':0,
    'no-unused-expressions': 0,
    'no-plusplus': 0,
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'arrow-parens': [2, 'as-needed'],
    'vue/max-attributes-per-line': 0,
    'no-trailing-spaces':0,
    'max-len': [
      1,
      {
        code: 120
      }
    ],
    'no-eval': 0,
    'no-multi-assign': 0,
    'prefer-rest-params': 0,
    'vue/require-prop-types': 0,
    'no-restricted-globals': 0
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    location: false
  }
};
