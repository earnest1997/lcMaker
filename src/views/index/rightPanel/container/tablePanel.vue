<script>
import { isArray } from 'util'
import JsonDrawer from '@/views/index/form/JsonDrawer'
import TreeNodeDialog from '@/views/index/TreeNodeDialog'
import { isNumberStr } from '@/utils/index'
import IconsDialog from '../../IconsDialog'
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  tableColumnType,
  tableColumnTagType
} from '@/components/generator/config'
import { saveFormConf } from '@/utils/db'
import { table } from '@/store/index'
import cssVars from '@/styles/variables.module.scss'
    
const {
  danger, info, warning, success, default: main 
} = cssVars
    
// 按钮类型
const btnTypes = Object.entries({
  danger,
  info,
  warning,
  success,
  main
}).reduce((prev, [k, v]) => {
  prev.push({
    label: k,
    value: v
  })
  return prev
}, [])
const dateTimeFormat = {
  date: 'yyyy-MM-dd',
  week: 'yyyy 第 WW 周',
  month: 'yyyy-MM',
  year: 'yyyy',
  datetime: 'yyyy-MM-dd HH:mm:ss',
  daterange: 'yyyy-MM-dd',
  monthrange: 'yyyy-MM',
  datetimerange: 'yyyy-MM-dd HH:mm:ss'
}
    
const tableColumnTypes = Object.entries(tableColumnType).map(
  ([label, value]) => ({ label, value })
)
const tagColors = Object.entries(tableColumnTagType).map(([label, value]) => ({
  label,
  value
}))
    
// 使changeRenderKey在目标组件改变时可用
const needRerenderList = ['tinymce']
    
export default {
  name: 'FormGeneratorContainerpanel',
    
  props: ['showField', 'activeData', 'formConf', 'drawingList'],
  data() {
    return {
      jsonDrawerVisible: false,
      // 表格数据
      tableData: '',
      currentTab: 'field',
      currentNode: null,
      dialogVisible: false,
      iconsVisible: false,
      currentIconModel: null,
      selectedVal: '',
      tableInfo: { pageSize: 20 },
      // 表格项数据
      tableColumnTypes,
      tableColumnType,
      tagColors,
      statusMap: {},
      btnTypes: Object.freeze(btnTypes)
    }
  },
  computed: {
    documentLink() {
      return (
        this.activeData.__config__.document
            || 'https://element.eleme.cn/#/zh-CN/component/installation'
      )
    },
    dateOptions() {
      if (
        this.activeData.type !== undefined
            && this.activeData.__config__.tag === 'el-date-picker'
      ) {
        if (this.activeData['start-placeholder'] === undefined) {
          return this.dateTypeOptions
        }
        return this.dateRangeTypeOptions
      }
      return []
    },
    tagList() {
      return [
        {
          label: '输入型组件',
          options: inputComponents
        },
        {
          label: '选择型组件',
          options: selectComponents
        }
      ]
    },
    activeTag() {
      return this.activeData.__config__.tag
    },
    isShowMin() {
      return ['el-input-number', 'el-slider'].indexOf(this.activeTag) > -1
    },
    isShowMax() {
      return (
        ['el-input-number', 'el-slider', 'el-rate'].indexOf(this.activeTag) > -1
      )
    },
    isShowStep() {
      return ['el-input-number', 'el-slider'].indexOf(this.activeTag) > -1
    }
  },
  watch:{
    'tableInfo.pageSize':function setPagesize(val) {
      const target = this.drawingList.find(item => item.__config__.tag.includes('pagination'))
      target.pageSize = val
    },
    formConf: {
      handler(val) {
        saveFormConf(val)
      },
      deep: true
    },
    'activeData.data': {
      handler(val) {
        this.tableData = JSON.stringify({ list: val })
      },
      immediate: true
    },
    'activeData.__config__.isShowPagination': 'setTablePagination'
  },
    
  mounted() {},
    
  methods: {
    removeItem(index, map) {
      map.splice(index, 1)
    },
    addNewItem(e, item, key) {
      const val = e.target.textContent
      if (!val) return
      item.__config__[key] = item.__config__[key] || []
      item.__config__[key].push({ value: val, color: 'info' })
      item = { ...item }
      // debugger
      e.target.textContent = ''
      this.$forceUpdate()
    },
    // removeBtn(index, btnGroup) {
    //     btnGroup.splice(index, 1)
    // },
    // addNewBtn(e, item) {
    
    // },
    // addNewTag(e, valMap) {
    //     const val = e.target.textContent
    
    //     if (!val) return
    //     valMap.push({ value: val, color: 'info' })
    //     e.target.textContent = ''
    // },
    refreshData(tableData) {
      this.activeData.data = tableData?.list || []
    },
    editData() {
      this.jsonDrawerVisible = true
    },
    changeFormData(evt) {
      const file = evt.target.files[0]
      const reader = new FileReader()
      reader.onload = e => {
        const tableData = e.target.result
        this.activeData.data = JSON.parse(tableData).list
      }
      reader.readAsText(file)
    },
    // 为表格绑定分页
    setTablePagination(isShowPagination, prevShow) {
      if (prevShow === undefined) return
      const { pageSize } = this.tableInfo
      this.$emit('set-table-pagination', { isShowPagination, pageSize })
    },
    setTableSearch(type, item) {
      this.selectedVal = type
      this.$emit('set-search', { type, ...item })
    },
    addReg() {
      this.activeData.__config__.regList.push({
        pattern: '',
        message: ''
      })
    },
    addSelectItem() {
      this.activeData.__slot__.options.push({
        label: '',
        value: ''
      })
    },
    addTableItem() {
      const newTableItem = {
        __config__: {
          layout: 'raw',
          tag: 'el-table-column',
          search: true,
          isOperationCol:false,
          type: tableColumnType.文本,
          btnGroup: [],
          valMap: []
        },
        prop: '',
        label: '',
        width:100,
        
      }
      this.activeData.__slot__.columns.push(newTableItem)
    },
    addTreeItem() {
      ++this.idGlobal
      this.dialogVisible = true
      this.currentNode = this.activeData.options
    },
    renderContent(h, { node, data, store }) {
      return (
            <div class="custom-tree-node">
              <span>{node.label}</span>
              <span class="node-operation">
                <i
                  onClick={() => this.append(data)}
                  class="el-icon-plus"
                  title="添加"
                ></i>
                <i
                  onClick={() => this.remove(node, data)}
                  class="el-icon-delete"
                  title="删除"
                ></i>
              </span>
            </div>
      )
    },
    append(data) {
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      this.dialogVisible = true
      this.currentNode = data.children
    },
    remove(node, data) {
      this.activeData.__config__.defaultValue = [] // 避免删除时报错
      const { parent } = node
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },
    addNode(data) {
      this.currentNode.push(data)
    },
    setOptionValue(item, val) {
      item.value = isNumberStr(val) ? +val : val
    },
    setDefaultValue(val) {
      if (Array.isArray(val)) {
        return val.join(',')
      }
      // if (['string', 'number'].indexOf(typeof val) > -1) {
      //   return val
      // }
      if (typeof val === 'boolean') {
        return `${val}`
      }
      return val
    },
    onDefaultValueInput(str) {
      if (isArray(this.activeData.__config__.defaultValue)) {
        // 数组
        this.$set(
          this.activeData.__config__,
          'defaultValue',
          str.split(',').map(val => (isNumberStr(val) ? +val : val))
        )
      } else if (['true', 'false'].indexOf(str) > -1) {
        // 布尔
        this.$set(this.activeData.__config__, 'defaultValue', JSON.parse(str))
      } else {
        // 字符串和数字
        this.$set(
          this.activeData.__config__,
          'defaultValue',
          isNumberStr(str) ? +str : str
        )
      }
    },
    onSwitchValueInput(val, name) {
      if (['true', 'false'].indexOf(val) > -1) {
        this.$set(this.activeData, name, JSON.parse(val))
      } else {
        this.$set(this.activeData, name, isNumberStr(val) ? +val : val)
      }
    },
    setTimeValue(val, type) {
      const valueFormat = type === 'week' ? dateTimeFormat.date : val
      this.$set(this.activeData.__config__, 'defaultValue', null)
      this.$set(this.activeData, 'value-format', valueFormat)
      this.$set(this.activeData, 'format', val)
    },
    spanChange(val) {
      this.formConf.span = val
    },
    multipleChange(val) {
      this.$set(this.activeData.__config__, 'defaultValue', val ? [] : '')
    },
    dateTypeChange(val) {
      this.setTimeValue(dateTimeFormat[val], val)
    },
    rangeChange(val) {
      this.$set(
        this.activeData.__config__,
        'defaultValue',
        val ? [this.activeData.min, this.activeData.max] : this.activeData.min
      )
    },
    rateTextChange(val) {
      if (val) this.activeData['show-score'] = false
    },
    rateScoreChange(val) {
      if (val) this.activeData['show-text'] = false
    },
    colorFormatChange(val) {
      this.activeData.__config__.defaultValue = null
      this.activeData['show-alpha'] = val.indexOf('a') > -1
      this.activeData.__config__.renderKey = +new Date() // 更新renderKey,重新渲染该组件
    },
    openIconsDialog(model) {
      this.iconsVisible = true
      this.currentIconModel = model
    },
    setIcon(val) {
      this.activeData[this.currentIconModel] = val
    },
    tagChange(tagIcon) {
      let target = inputComponents.find(
        item => item.__config__.tagIcon === tagIcon
      )
      if (!target) {
        target = selectComponents.find(
          item => item.__config__.tagIcon === tagIcon
        )
      }
      this.$emit('tag-change', target)
    },
    changeRenderKey() {
      if (needRerenderList.includes(this.activeData.__config__.tag)) {
        this.activeData.__config__.renderKey = +new Date()
      }
    },
    renderBaseInfo(h) {
      return (
            <el-tab-pane label="表格属性" name="field">
              <el-form
                label-width="90px"
                label-position="top"
                style="padding: 10px"
              >
                <el-form-item label="是否分页">
                  <el-switch value={this.activeData.__config__.isShowPagination} onChange={e => { this.activeData.__config__.isShowPagination = e; this.tableInfo.pageSize = 10; }}/>
                </el-form-item>
                {this.activeData.__config__.isShowPagination && (
                  <el-form-item label="分页条数">
                    <el-input-number value={this.tableInfo.pageSize} onChange={val => this.tableInfo.pageSize = val}/>
                  </el-form-item>
                )}
                <el-form-item label="表格数据">
                  <el-button
                    icon="el-icon-upload"
                    size="mini"
                    placeholder="请选择文件，仅支持json格式"
                  >
                    <input
                      type="file"
                      accept="application/JSON"
                      onChange={this.changeFormData}
                    />
                    点击上传文件
                  </el-button>
                  <el-button
                    size="mini"
                    type="primary"
                    onClick={() => this.editData()}
                  >
                    编辑表格数据
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
      )
    },
    renderDynamicItems(h, {
      item, map, tagMap, mapKey, labelKey = '取值' 
    }) {
      const [tagMapKey, tagMapVal] = Object.entries(tagMap)[0]
      const dropDownItems = tagMapVal.map(color => (
            <el-dropdown-item key={color.label} command={color.label}>
              <span
                style={`background:${color.value};width:10px;height:10px;display:inline-block;border-radius:4px;`}
              />
              &nbsp;{color.label}
            </el-dropdown-item>
      ))
    
      const itemMap = (map || []).map((item, index) => (
            <el-dropdown
              onCommand={colorVal => {
                item.color = colorVal
              }}
            >
              <el-tag type={item.color}>
                {item.value}
                <i
                  class="el-icon-close"
                  onClick={() => this.removeItem(index, map)}
                />
              </el-tag>
              <el-dropdown-menu slot="dropdown">{dropDownItems}</el-dropdown-menu>
            </el-dropdown>
      ))
    
      return (
            <el-form-item label={labelKey}>
              <div class="inline">
                {itemMap}
                <div
                  class="add-tag"
                  contenteditable={true}
                  onBlur={e => this.addNewItem(e, item, mapKey)}
                />
              </div>
            </el-form-item>
      )
    },
    renderTableItemBaseInfo(h, item, index) {
      const comps = this.tagList.map(group => (
            <el-option-group key={group.label} label={group.label}>
              {group.options.map(tag => (
                <el-option
                  key={tag.__config__?.label}
                  label={tag.__config__?.label}
                  value={tag.__config__.tagIcon}
                >
                  <svg-icon class="node-icon" icon-class={tag.__config__.tagIcon} />
                  <span> {tag.__config__?.label}</span>
                </el-option>
              ))}
            </el-option-group>
      ))
      return (
            <div class="top ">
              <el-form-item label="表格项名">
                <el-input value={item.label} placeholder="label" size="small" onInput={val => { item.label = val }}/>
              </el-form-item>
              <el-form-item label="数据索引">
                <el-input value={item.prop} placeholder="prop" size="small" onInput={val => { item.prop = val }}/>
              </el-form-item>
    
              <el-form-item label="表格宽度">
                <el-input value={item.width} placeholder="表格宽度" size="small" onInput={val => { item.width = val }}/>
              </el-form-item>
              <el-form-item label="是否为查询项">
                <el-switch
                  value={item.__config__?.search}
                  onChange={val => {
                    item.__config__.search = val
                  }}
                />
              </el-form-item>
              <el-form-item label="组件类型">
                {item.__config__?.search && (
                  <el-select
                    value={this.selectedVal}
                    label="查询类型"
                    placeholder="请选择组件类型"
                    style="width: '100%'"
                    size="small"
                    onChange={val => this.setTableSearch(val, item)}
                  >
                    {comps}
                  </el-select>
                )}
              </el-form-item>
            </div>
      )
    },
    renderTableItem(h, item, index) {
      const options = tableColumnTypes.map(type => (
            <el-option key={type.value} label={type.label} value={type.value} />
      ))
      const opBtns = (
            <div class="inline">
              {' '}
              <h5 style="margin-left: 5px; font-size: 14px">item{index + 1}</h5>
              <div class="op">
                <div class="select-line-icon option-drag">
                  <i class="el-icon-s-operation" />
                </div>
    
                <div
                  class="close-btn select-line-icon"
                  onClick={() => {
                    this.activeData.__slot__.columns.splice(index, 1)
                  }}
                >
                  <i class="el-icon-remove-outline" />
                </div>
              </div>
            </div>
      )
      const scopedSlots = {
        title() {
          return opBtns
        }
      }
      
      const { __config__ } = item
      const { isOperationCol } = __config__ || {}
      return (
            <el-collapse-item class="select-item" {...{ scopedSlots }}>
              <div class="table-item">
                {this.renderTableItemBaseInfo(h, item, index)}
                <div class="bottom">
                  <el-form-item label="值的类型">
                    <el-select
                      value={item.__config__.type}
                      onChange={val => { item.__config__.type = val }}
                      placeholder="请选择值的类型"
                      size="small"
                    >
                      {options}
                    </el-select>
                  </el-form-item>
                  {item.__config__.type === '标签' && this.renderDynamicItems(h, {
                    item,
                    map: item.__config__.valMap,
                    tagMap: { tagColors },
                    mapKey: 'valMap',
                    labelKey: '取值'
                  })}
                  <el-form-item label="是否为操作项">
                    <el-switch value={item.__config__?.isOperationCol} onChange={val => { item.__config__.isOperationCol = val }}/>
                  </el-form-item>
                  {isOperationCol
                    && this.renderDynamicItems(h, {
                      item,
                      map: item.__config__.btnGroup,
                      tagMap: { btnTypes },
                      mapKey: 'btnGroup',
                      labelKey: '按钮'
                    })}
                </div>
              </div>
            </el-collapse-item>
      )
    },
    renderTableItemBottom(h) {
      return (
            <div style="text-align: right; margin: 10px 0">
              <el-button
                icon="el-icon-circle-plus-outline"
                type="primary"
                size="mini"
                onClick={() => this.addTableItem()}
              >
                添加表格项
              </el-button>
            </div>
      )
    },
    toggleJsonVisible(val) {
      this.jsonDrawerVisible = val
    },
  },
  render(h) {
    const tableItems = this.activeData.__slot__?.columns?.map((item, index) => this.renderTableItem(h, item, index))
    return (
          <div class="right-board">
            <el-tabs value={this.currentTab} class="center-tabs">
              {this.renderBaseInfo(h)}
              <el-tab-pane label="表格项属性" name="form">
                <div class="field-box">
                  <el-scrollbar class="right-scrollbar">
                    <el-form size="small" label-width="100px" label-position="top">
                      <draggable
                        list={this.activeData.__slot__.columns}
                        animation={340}
                        group="selectItem"
                        handle=".option-drag"
                      >
                        <el-collapse>{tableItems}</el-collapse>
                      </draggable>
                    </el-form>
                    {this.renderTableItemBottom(h)}
                  </el-scrollbar>
                </div>
              </el-tab-pane>
            </el-tabs>
            <IconsDialog
              visible={this.iconsVisible}
              current={this.activeData[this.currentIconModel]}
              onSelect={this.setIcon}
            />
            {this.jsonDrawerVisible}
            <JsonDrawer
              size="60%"
              // eslint-disable-next-line no-useless-computed-key
              on={{ ['update:visible']: this.toggleJsonVisible }}
              visible={this.jsonDrawerVisible}
              jsonStr={this.tableData}
              onRefresh={this.refreshData}
            />
          </div>
    )
  }
}
</script>
    
    <style lang="scss" scoped>
    @import '@/styles/common';
    
    .add-tag {
      display: inline-block;
      width: fit-content;
      min-width: 70px;
      height: 30px;
      padding: 8px 6px;
      /* line-height:30px; */
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      color: #606266;
      font-size: 12px;
      line-height: 1;
    
      &:focus {
        outline: none;
      }
    
      &:not(:focus) {
        color: transparent;
        cursor: pointer;
    
        &::after {
          z-index: 1;
          content: '➕新值';
          white-space: nowrap;
    
          color: #606266;
          font-size: 12px;
          @extend %absolute-center;
        }
      }
    }
    
    .right-scrollbar {
      .bottom .el-select {
        margin-bottom: 10px;
      }
    
      .el-input--small {
        margin-bottom: 10px;
      }
    
      .select-item {
        border: 1px solid #eeeff3;
        border-radius: 4px;
        padding: 10px;
        background: #fbfbfb;
    
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
    
    .right-board {
      flex-basis: 350px;
      flex-shrink: 0;
      min-width: 0;
      right: 0;
      top: 0;
      padding-top: 3px;
    
      .el-button {
        position: relative;
        cursor: pointer;
      }
    
      .el-button input {
        opacity: 0;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    }
    </style>
    <style lang="scss">
    @import '@/styles/common.scss';
    
    /* .right-scrollbar { */
    .el-collapse-item__arrow {
      margin: 0 !important;
    }
    
    .el-collapse-item__wrap,
    .el-collapse-item__header {
      background: none;
    }
    
    .el-collapse-item__header .inline {
      width: 100%;
    
      > h5 {
        margin-right: auto;
        margin-left: 10px;
      }
    
      .op {
        margin-left: auto;
        display: flex;
        justify-content: flex-end;
        padding: 4px 0;
        margin-bottom: 0px;
    
        > div {
          cursor: pointer;
    
          &:first-child {
            margin-right: 5px;
          }
        }
      }
    }
    
    /* } */
    
    .inline {
      .el-icon-close {
        &:hover {
          display: inline-block;
          @include wh(15, 15);
          line-heigth: 15px;
          text-align: center;
          font-size: 12px;
          border-radius: 100%;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
        }
      }
    }
    </style>
    
