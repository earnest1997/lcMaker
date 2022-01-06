<template>
  <div class="right-board">
    <el-tabs v-model="currentTab" class="center-tabs">
      <el-tab-pane label="表格属性" name="field">
        <el-form label-width="90px">
          <el-form-item label="是否分页">
            <el-switch v-model="activeData.__config__.isShowPagination" />
          </el-form-item>
          <el-form-item
            v-show="activeData.__config__.isShowPagination"
            label="分页条数"
          >
            <el-input-number v-model="tableInfo.pageSize" />
          </el-form-item>
          <el-form-item label="表格数据">
            <el-button
              icon="el-icon-upload"
              size="mini"
              placeholder="请选择文件，仅支持json格式"
            >
              <input
                type="file"
                accept="application/JSON"
                @change="changeFormData"
              >
              点击上传文件
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="表格项属性" name="form">
        <div class="field-box">
          <a
            class="document-link"
            target="_blank"
            :href="documentLink"
            title="查看组件文档"
          >
            <i class="el-icon-link" />
          </a>
          <el-scrollbar class="right-scrollbar">
            <!-- 组件属性 -->
            <el-form size="small" label-width="120px">
              <draggable
                :list="activeData.__slot__.columns"
                :animation="340"
                group="selectItem"
                handle=".option-drag"
              >
                <div
                  v-for="(item, index) in activeData.__slot__.columns"
                  :key="index"
                  class="select-item"
                >
                  <div class="left">
                    <!-- 表单项自带属性 -->
                    <div class="top inline">
                      <div class="select-line-icon option-drag">
                        <i class="el-icon-s-operation" />
                      </div>
                      <el-input
                        v-model="item.label"
                        placeholder="label"
                        size="small"
                      />
                      <el-input
                        v-model="item.prop"
                        placeholder="prop"
                        size="small"
                      />
                      <el-input
                        v-model="item.width"
                        placeholder="表格宽度"
                        size="small"
                      />
                    </div>
                    <!-- 表单项自定义属性 -->
                    <div class="bottom">
                      <el-form-item label="是否为查询项">
                        <el-switch v-model="item.search" />
                      </el-form-item>
                      <el-select
                        v-show="item.search"
                        v-model="selectedVal"
                        label="查询类型"
                        placeholder="请选择组件类型"
                        :style="{ width: '100%' }"
                        @change="val => setTableSearch(val, item)"
                      >
                        <el-option-group
                          v-for="group in tagList"
                          :key="group.label"
                          :label="group.label"
                        >
                          <el-option
                            v-for="item in group.options"
                            :key="item.__config__.label"
                            :label="item.__config__.label"
                            :value="item.__config__.tagIcon"
                          >
                            <svg-icon
                              class="node-icon"
                              :icon-class="item.__config__.tagIcon"
                            />
                            <span> {{ item.__config__.label }}</span>
                          </el-option>
                        </el-option-group>
                      </el-select>
                    </div>
                  </div>
                  <div
                    class="close-btn select-line-icon"
                    @click="activeData.__slot__.columns.splice(index, 1)"
                  >
                    <i class="el-icon-remove-outline" />
                  </div>
                </div>
              </draggable>
              <div style="margin-left: 20px">
                <el-button
                  style="padding-bottom: 0"
                  icon="el-icon-circle-plus-outline"
                  type="text"
                  @click="addTableItem"
                >
                  添加表格项
                </el-button>
              </div>

              <template v-if="Array.isArray(activeData.__config__.regList)">
                <el-divider>正则校验</el-divider>
                <RegTest />
                <div
                  v-for="(item, index) in activeData.__config__.regList"
                  :key="index"
                  class="reg-item"
                >
                  <span
                    class="close-btn"
                    @click="activeData.__config__.regList.splice(index, 1)"
                  >
                    <i class="el-icon-close" />
                  </span>
                  <el-form-item label="表达式">
                    <el-input v-model="item.pattern" placeholder="请输入正则" />
                  </el-form-item>
                  <el-form-item label="错误提示" style="margin-bottom: 0">
                    <el-input
                      v-model="item.message"
                      placeholder="请输入错误提示"
                    />
                  </el-form-item>
                </div>
                <div style="margin-left: 20px">
                  <el-button
                    icon="el-icon-circle-plus-outline"
                    type="text"
                    @click="addReg"
                  >
                    添加规则
                  </el-button>
                </div>
              </template>
              <el-form-item label="校验模型">
                <el-input
                  v-model="formConf.formRules"
                  placeholder="请输入校验模型"
                />
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>

    <icons-dialog
      :visible.sync="iconsVisible"
      :current="activeData[currentIconModel]"
      @select="setIcon"
    />
  </div>
</template>

<script>
import { isArray } from 'util'
import TreeNodeDialog from '@/views/index/TreeNodeDialog'
import { isNumberStr } from '@/utils/index'
import IconsDialog from '../IconsDialog'
import {
  inputComponents,
  selectComponents,
  layoutComponents
} from '@/components/generator/config'
import { saveFormConf } from '@/utils/db'
import RegTest from './RegTest.vue'

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

// 使changeRenderKey在目标组件改变时可用
const needRerenderList = ['tinymce']

export default {
  components: {
    TreeNodeDialog,
    IconsDialog,
    RegTest
  },
  props: ['showField', 'activeData', 'formConf'],
  data() {
    return {
      currentTab: 'field',
      currentNode: null,
      dialogVisible: false,
      iconsVisible: false,
      currentIconModel: null,
      selectedVal: '',
      tableInfo: { pageSize: 20 }
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
  watch: {
    formConf: {
      handler(val) {
        saveFormConf(val)
      },
      deep: true
    },
    'activeData.__config__.isShowPagination': 'setTablePagination'
  },
  methods: {
    changeFormData(file) {
      const reader = new FileReader()
      reader.onload = function (val) {}
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
      this.activeData.__slot__.columns.push({
        label: '',
        prop: '',
        width: 'unset'
      })
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
              on-click={() => this.append(data)}
              class="el-icon-plus"
              title="添加"
            ></i>
            <i
              on-click={() => this.remove(node, data)}
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
    }
  }
}
</script>

<style lang="scss" scoped>
.right-scrollbar {
  .el-input--small {
    margin-bottom: 10px;
  }
  .select-item {
    border: 1px solid #eeeff3;
    border-radius: 4px;
    padding: 5px;
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
