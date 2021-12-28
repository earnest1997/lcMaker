import { exportDefault, titleCase, deepClone } from '@/utils/index'
import ruleTrigger from '../ruleTrigger'
import { getPageMethods, getCompMethods } from './methods'

const units = {
  KB: '1024',
  MB: '1024 / 1024',
  GB: '1024 / 1024 / 1024'
}
let confGlobal
const inheritAttrs = {
  file: '',
  dialog: 'inheritAttrs: false,'
}

/**
 * 组装js 【入口函数】
 * @param {Object} pageConfig 整个页面配置
 * @param {String} type 生成类型，文件或弹窗等
 */
export function makeUpJs(pageConfig, type) {
  const {
    formData: { fields, ...formConf },
    containerData
  } = pageConfig
  const pageData = [...fields, ...containerData]

  confGlobal = deepClone(formConf)
  const formDataList = []
  const dataList = []
  const ruleList = []
  const optionsList = []
  const propsList = []
  const methodList = mixinMethod(type)
  const uploadVarList = []
  const created = []

  const params = {
    formDataList,
    dataList,
    ruleList,
    optionsList,
    methodList,
    propsList,
    uploadVarList,
    created
  }
  pageData.forEach(el => {
    buildAttributes({ el, ...params })
  })
  //
  const script = buildexport(
    pageConfig,
    type,
    formDataList.join('\n'),
    dataList.join('\n'),
    ruleList.join('\n'),
    optionsList.join('\n'),
    uploadVarList.join('\n'),
    propsList.join('\n'),
    methodList.join('\n'),
    created.join('\n')
  )
  confGlobal = null
  return script
}

function buildCompMethods(scheme, methodList, confGlobal) {
  const {
    __config__: { tag }
  } = scheme
  const methods = getCompMethods(tag, scheme, confGlobal)

  if (methods) {
    // methodList = [...methods, ...methodList]
    // eslint-disable-next-line no-restricted-syntax
    for (const method of methods) {
      methodList.push(method)
    }
  }
}

// 构建组件属性
function buildAttributes(params) {
  const {
    el: scheme,
    formDataList,
    dataList,
    ruleList,
    optionsList,
    methodList,
    propsList,
    uploadVarList,
    created
  } = params
  const config = scheme.__config__
  const slot = scheme.__slot__
  buildData(scheme, formDataList, dataList)
  buildRules(scheme, ruleList)

  // 为组件绑定自己的方法
  buildCompMethods(scheme, methodList, confGlobal)

  // 特殊处理options属性
  if (scheme.options || (slot && slot.options && slot.options.length)) {
    buildOptions(scheme, optionsList)
    if (config.dataType === 'dynamic') {
      const model = `${scheme.__vFormModel__}Options`
      const options = titleCase(model)
      const methodName = `get${options}`
      buildOptionMethod(methodName, model, methodList, scheme)
      callInCreated(methodName, created)
    }
  }

  // 处理props
  if (scheme.props && scheme.props.props) {
    buildProps(scheme, propsList)
  }

  // 处理el-upload的action
  if (scheme.action && config.tag === 'el-upload') {
    uploadVarList.push(
      `${scheme.__vFormModel__}Action: '${scheme.action}',
      ${scheme.__vFormModel__}fileList: [],`
    )
    methodList.push(buildBeforeUpload(scheme))
    // 非自动上传时，生成手动上传的函数
    if (!scheme['auto-upload']) {
      methodList.push(buildSubmitUpload(scheme))
    }
  }

  // 构建子级组件属性
  if (config.children) {
    config.children.forEach(item => {
      buildAttributes(
        item,
        formDataList,
        dataList,
        ruleList,
        optionsList,
        methodList,
        propsList,
        uploadVarList,
        created
      )
    })
  }
}

// 在Created调用函数
function callInCreated(methodName, created) {
  created.push(`this.${methodName}()`); console.log(99)
  console.log(797)
}

// 混入处理函数
function mixinMethod(type) {
  const list = []
  const minxins = getPageMethods(confGlobal)
  const methods = minxins[type]
  if (methods) {
    Object.keys(methods).forEach(key => {
      list.push(methods[key])
    })
  }

  return list
}

// 构建data
function buildData(scheme, formDataList, dataList) {
  const config = scheme.__config__
  const model = scheme.__vFormModel__ || scheme.__vModel__
  const isFormData = '__vFormModel__' in scheme

  if (!model) return
  if (Array.isArray(model)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const _model of model) {
      const [key, val] = Object.entries(_model)
      dataList.push(`${key}:${val},`)
    }
    return
  }
  const defaultValue = JSON.stringify(config.defaultValue)
  if (isFormData) {
    formDataList.push(`${model}: ${defaultValue},`)
  } else {
    dataList.push(`${model}: ${defaultValue},`)
  }
}

// 构建校验规则
function buildRules(scheme, ruleList) {
  const config = scheme.__config__
  if (scheme.__vFormModel__ === undefined) return
  const rules = []
  if (ruleTrigger[config.tag]) {
    if (config.required) {
      const type = Array.isArray(config.defaultValue) ? "type: 'array'," : ''
      let message = Array.isArray(config.defaultValue)
        ? `请至少选择一个${config.label}`
        : scheme.placeholder
      if (message === undefined) message = `${config.label}不能为空`
      rules.push(
        `{ required: true, ${type} message: '${message}', trigger: '${
          ruleTrigger[config.tag]
        }' }`
      )
    }
    if (config.regList && Array.isArray(config.regList)) {
      config.regList.forEach(item => {
        if (item.pattern) {
          rules.push(
            `{ pattern: ${eval(item.pattern)}, message: '${
              item.message
            }', trigger: '${ruleTrigger[config.tag]}' }`
          )
        }
      })
    }
    ruleList.push(`${scheme.__vFormModel__}: [${rules.join(',')}],`)
  }
}

// 构建options
function buildOptions(scheme, optionsList) {
  if (scheme.__vFormModel__ === undefined) return
  // el-cascader直接有options属性，其他组件都是定义在slot中，所以有两处判断
  let { options } = scheme
  if (!options) options = scheme.__slot__.options
  if (scheme.__config__.dataType === 'dynamic') {
    options = []
  }
  const str = `${scheme.__vFormModel__}Options: ${JSON.stringify(options)},`
  optionsList.push(str)
}

function buildProps(scheme, propsList) {
  const str = `${scheme.__vFormModel__}Props: ${JSON.stringify(
    scheme.props.props
  )},`
  propsList.push(str)
}

// el-upload的BeforeUpload
function buildBeforeUpload(scheme) {
  const config = scheme.__config__
  const unitNum = units[config.sizeUnit]
  let rightSizeCode = ''
  let acceptCode = ''
  const returnList = []
  if (config.fileSize) {
    rightSizeCode = `let isRightSize = file.size / ${unitNum} < ${config.fileSize}
    if(!isRightSize){
      this.$message.error('文件大小超过 ${config.fileSize}${config.sizeUnit}')
    }`
    returnList.push('isRightSize')
  }
  if (scheme.accept) {
    acceptCode = `let isAccept = new RegExp('${scheme.accept}').test(file.type)
    if(!isAccept){
      this.$message.error('应该选择${scheme.accept}类型的文件')
    }`
    returnList.push('isAccept')
  }
  const str = `${scheme.__vFormModel__}BeforeUpload(file) {
    ${rightSizeCode}
    ${acceptCode}
    return ${returnList.join('&&')}
  },`
  return returnList.length ? str : ''
}

// el-upload的submit
function buildSubmitUpload(scheme) {
  const str = `submitUpload() {
    this.$refs['${scheme.__vFormModel__}'].submit()
  },`
  return str
}

function buildOptionMethod(methodName, model, methodList, scheme) {
  const config = scheme.__config__
  const str = `${methodName}() {
    // 注意：this.$axios是通过Vue.prototype.$axios = axios挂载产生的
    this.$axios({
      method: '${config.method}',
      url: '${config.url}'
    }).then(resp => {
      var { data } = resp
      this.${model} = data.${config.dataPath}
    })
  },`
  methodList.push(str)
}

// js整体拼接
function buildexport(
  conf,
  type,
  formDatas,
  data,
  rules,
  selectOptions,
  uploadVar,
  props,
  methods,
  created
) {
  const { formData } = conf
  const str = `${exportDefault}{
  ${inheritAttrs[type]}
  components: {},
  props: [],
  data () {
    return {
      ${data}
      ${formData.formModel}: {
        ${formDatas}
      },
      ${formData.formRules}: {
        ${rules}
      },
      ${uploadVar}
      ${selectOptions}
      ${props}
    }
  },
  computed: {},
  watch: {},
  created () {
    ${created}
  },
  mounted () {},
  methods: {
    ${methods}
  }
}`
  return str
}
