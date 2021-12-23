const styles = {
  'el-rate': '.el-rate{display: inline-block; vertical-align: text-top;}',
  'el-upload': '.el-upload__tip{line-height: 1.2;}',
  'el-pagination':'.el-pagination{text-align:center;}'
}

function addCss(cssList, el) {
  const css = styles[el.__config__.tag]
  css && cssList.indexOf(css) === -1 && cssList.push(css)
  if (el.__config__.children) {
    el.__config__.children.forEach(el2 => addCss(cssList, el2))
  }
}

export function makeUpCss(conf) {
  const cssList = []
  const { formData:{ fields }, containerData } = conf
  // 
  const pageData = [...fields, ...containerData]
  pageData.forEach(el => addCss(cssList, el))
  return cssList.join('\n')
}
