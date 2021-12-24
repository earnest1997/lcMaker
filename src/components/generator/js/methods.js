export const getPageMethods = confGlobal => ({
  file: confGlobal.formBtns ? {
    submitForm: `submitForm() {
      this.$refs['${confGlobal.formRef}'].validate(valid => {
        if(!valid) return
        // TODO 提交表单
      })
    },`,
    resetForm: `resetForm() {
      this.$refs['${confGlobal.formRef}'].resetFields()
    },`
  } : null,
  dialog: {
    onOpen: 'onOpen() {},',
    onClose: `onClose() {
      this.$refs['${confGlobal.formRef}'].resetFields()
    },`,
    close: `close() {
      this.$emit('update:visible', false)
    },`,
    handelConfirm: `handelConfirm() {
      this.$refs['${confGlobal.formRef}'].validate(valid => {
        if(!valid) return
        this.close()
      })
    },`
  },

})

function buildTableMethods(config, confGlobal) {
  const { formRef } = confGlobal
  const { __slot__:{ columns }, __config__:{ isShowPagination } } = config
  const isSearchAble = columns.some(item => item.search)
  const methodsMap = {
    [Symbol(isShowPagination)]:`handlePageInfoChange (key, val) {
        this[key] = val
        this.getDataAndRefresh({
          page: this.page,
          page_size: this.page_size
        })
      },`,
    [Symbol(isSearchAble)]:`handleSearch () {
        this.page = 1
        this.getDataAndRefresh({ page_size: this.page_size })
      },
      getDataAndRefresh (params) {
        const param = { ...params, ... this.$refs['${formRef}.model'] }
        api[this.req](param).then(res => {
          const listData = getValueSafely(res, ['data', 'list']) || []
          const listLen =
            getValueSafely(res, ['data', 'page_info', 'total']) || 0
          const countrys = getValueSafely(res, ['data', 'countrys'])
          let statusMap = getValueSafely(res, ['data', 'status_map'])
          this.statusMap = statusMap
          statusMap = Object.entries(statusMap).map(([k, v]) => ({ name: v, id: k }))
          this.options.statusList = statusMap
          this.tableData = transformer(listData)
        })
      },`
  }
  return Reflect.keys(methodsMap).filter(([key]) => key.description === 'true').map(key => methodsMap[key])
}

const getMethodsMap = arg => ({ 'el-table':() => buildTableMethods(...arg) })

export function getCompMethods(tag, ...arg) {
  const methodsMap = getMethodsMap(arg)
  if (!(tag in methodsMap)) return ''
  return methodsMap[tag]()
}
