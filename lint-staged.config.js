module.exports = {
  'src/**/*.{js,vue}': ['eslint --fix'],
  //   'src/**/*.{vue,html,css,scss,sass}': ['stylelint --fix', 'git add'],
  'src/**/*.{js,vue,html,css,scss,sass}': [
    'prettier-eslint --write',
  ]
}
