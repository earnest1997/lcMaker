/* eslint-disable max-len */
import ruleTrigger from '../ruleTrigger'
import { globalObj } from './vars'
// import { tags } from './tags'

let someSpanIsNot24

export function dialogWrapper(str) {
  return `<el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" @close="onClose" title="Dialog Titile">
    ${str}
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>`
}

export function vueTemplate(str) {
  return `<template>
    <div>
      ${str}
    </div>
  </template>`
}

export function vueScript(str) {
  return `<script>
    ${str}
  </script>`
}

export function cssStyle(cssStr) {
  return `<style>
    ${cssStr}
  </style>`
}
function buildPageTemplate() {

}

function buildContainerTemplate() {}

function buildFormTemplate(scheme, child, type) {
  let labelPosition = ''
  if (scheme.labelPosition !== 'right') {
    labelPosition = `label-position="${scheme.labelPosition}"`
  }
  const disabled = scheme.disabled ? `:disabled="${scheme.disabled}"` : ''
  let str = `<el-form ref="${scheme.formRef}" :inline="${
    scheme.inline
  }" :model="${scheme.formModel}" :rules="${scheme.formRules}" size="${
    scheme.size
  }" ${disabled} label-width="${scheme.labelWidth}px" ${labelPosition}>
      ${child}
      ${buildFromBtns(scheme, type)}
    </el-form>`
  if (someSpanIsNot24) {
    str = `<el-row :gutter="${scheme.gutter}">
        ${str}
      </el-row>`
  }
  return str
}

function buildFromBtns(scheme, type) {
  let str = ''
  if (scheme.formBtns && type === 'file') {
    str = `<el-form-item size="large">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>`
    if (someSpanIsNot24) {
      str = `<el-col :span="24">
          ${str}
        </el-col>`
    }
  }
  return str
}

// span不为24的用el-col包裹
function colWrapper(scheme, str) {
  if (someSpanIsNot24 || scheme.__config__.span !== 24) {
    return `<el-col :span="${scheme.__config__.span}">
      ${str}
    </el-col>`
  }
  return str
}

const layouts = () => {
  const tags = (async () => {
    await import('./tag.js');
  })();
  return ({
    colFormItem(scheme) {
      const config = scheme.__config__
      let labelWidth = ''
      let label = `label="${config.label}"`
      if (config.labelWidth && config.labelWidth !== globalObj.confGlobal.labelWidth) {
        labelWidth = `label-width="${config.labelWidth}px"`
      }
      if (config.showLabel === false) {
        labelWidth = 'label-width="0"'
        label = ''
      }
      const required = !ruleTrigger[config.tag] && config.required ? 'required' : ''
      const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
      let str = `<el-form-item ${labelWidth} ${label} prop="${scheme.__vFormModel__}" ${required}>
        ${tagDom}
      </el-form-item>`
      str = colWrapper(scheme, str)
      return str
    },
    rowFormItem(scheme) {
      const config = scheme.__config__
      const type = scheme.type === 'default' ? '' : `type="${scheme.type}"`
      const justify = scheme.type === 'default' ? '' : `justify="${scheme.justify}"`
      const align = scheme.type === 'default' ? '' : `align="${scheme.align}"`
      const gutter = scheme.gutter ? `:gutter="${scheme.gutter}"` : ''
      const children = config.children.map(el => layouts()[el.__config__.layout](el))
      let str = `<el-row ${type} ${justify} ${align} ${gutter}>
      ${children.join('\n')}
    </el-row>`
      str = colWrapper(scheme, str)
      return str
    },
    raw(scheme) {
      const config = scheme.__config__
      const children = config.children.map(el => layouts()[el.__config__.layout](el))
      const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
      return tagDom
    }
  })
}



/**
 * 组装html代码。【入口函数】
 * @param {Object} formConfig 整个表单配置
 * @param {String} type 生成类型，文件或弹窗等
 */
export function makeUpFormHtml(formConfig, type) {
  const htmlList = []
  globalObj.confGlobal = formConfig
  // 判断布局是否都沾满了24个栅格，以备后续简化代码结构
  someSpanIsNot24 = formConfig.fields.some(item => item.__config__.span !== 24)
  // 遍历渲染每个组件成html
  formConfig.fields.forEach(el => {
    htmlList.push(layouts()[el.__config__.layout](el))
  })
  const htmlStr = htmlList.join('\n')
  // 将组件代码放进form标签
  let temp = buildFormTemplate(formConfig, htmlStr, type)
  // dialog标签包裹代码
  return temp
}

export function makeUpContainerHtml(containerData, type) {
  const htmlList = []
  // 遍历渲染每个组件成html
  containerData.forEach(el => {
    htmlList.push(layouts()[el.__config__.layout](el))
  })
  const htmlStr = htmlList.join('\n')
  // 将组件代码放进form标签
  // let temp = buildContainerTemplate(formConfig, htmlStr, type)
  // dialog标签包裹代码
  // return temp

  globalObj.confGlobal = null
  return htmlStr
}

export function makeUpHtml(fieldData, type) {
  const { formData, containerData } = fieldData
  const formHtml = makeUpFormHtml(formData)
  const containerHtml = makeUpContainerHtml(containerData)
  let temp = `${formHtml}${containerHtml}`
  // let temp = buildPageTemplate(formHtml, containerHtml)
  if (type === 'dialog') {
    temp = dialogWrapper(temp)
  }
  return temp
}
