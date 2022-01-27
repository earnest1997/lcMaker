<template>
  <div class="container flex">
    <div class="left-board" :class="!collapseLeft ? 'active' : ''">
      <!-- 左侧导航start -->
      <div class="left-wrapper">
        <div class="nav">
          <div class="icon" @click="setCollapseLeft">
            <!-- <input id="check" type="checkbox"> -->
            <i v-show="!collapseLeft" class="el-icon-s-unfold" />
            <i v-show="collapseLeft" class="el-icon-s-fold" />
          </div>
        </div>
        <el-scrollbar
          :class="!collapseLeft ? 'active' : ''"
          class="left-scrollbar"
        >
          <div class="components-list">
            <div v-for="(item, listIndex) in leftComponents" :key="listIndex">
              <div class="components-title">
                <svg-icon iconClass="component" />
                {{ item.title }}
              </div>
              <draggable
                class="components-draggable"
                :list="item.list"
                :group="{
                  name: item.groupName || 'formComponentsGroup',
                  pull: 'clone',
                  put: false
                }"
                :clone="cloneComponent"
                draggable=".components-item"
                :sort="false"
                :move="onMoveForm"
                @end="onEnd"
              >
                <div
                  v-for="(element, index) in item.list"
                  :key="index"
                  class="components-item"
                  @click="addComponent(element)"
                >
                  <div class="components-body">
                    <svg-icon :iconClass="element.__config__.tagIcon" />
                    {{ element.__config__.label }}
                  </div>
                </div>
              </draggable>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <!-- 左侧导航end -->
    </div>

    <div class="center-board">
      <div class="action-bar">
        <el-button icon="el-icon-video-play" type="text" @click="run">
          运行
        </el-button>
        <el-button icon="el-icon-view" type="text" @click="showJson">
          查看json
        </el-button>
        <el-button icon="el-icon-view" type="text" @click="showJson">
          查看组件数据
        </el-button>
        <el-button icon="el-icon-download" type="text" @click="download">
          导出vue文件
        </el-button>
        <el-button
          class="copy-btn-main"
          icon="el-icon-document-copy"
          type="text"
          @click="copy"
        >
          复制代码
        </el-button>
        <el-button
          class="delete-btn"
          icon="el-icon-delete"
          type="text"
          @click="empty"
        >
          清空
        </el-button>
      </div>
      <el-scrollbar class="center-scrollbar">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form
            :size="formConf.size"
            :labelPosition="formConf.labelPosition"
            :disabled="formConf.disabled"
            :inline="formConf.inline"
            :labelWidth="formConf.labelWidth + 'px'"
          >
            <draggable
              class="drawing-board top"
              :list="drawingList"
              :animation="340"
              group="formComponentsGroup"
            >
              <FormDragItem
                v-for="(item, index) in drawingList"
                :key="item.renderKey"
                group="formComponentsGroup"
                :drawingList="drawingList"
                :currentItem="item"
                :index="index"
                :activeId="activeId"
                :formConf="formConf"
                @activeItem="activeFormItem"
                @copyItem="drawingItemCopy"
                @deleteItem="drawingItemDelete"
              />
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">
              从左侧拖入或点选组件进行页面设计（虚线框内为表单领域）
            </div>
          </el-form>
        </el-row>
      </el-scrollbar>
      <el-scrollbar>
        <draggable
          class="drawing-board bottom"
          :animation="340"
          :list="drawingContainer"
          group="containerGroup"
        >
          <!-- <div v-for="(item, index) in drawingContainer">
            {{ JSON.stringify(item) }}
          </div> -->
          <NormalDragItem
            v-for="(item, index) in drawingContainer"
            :key="`normal-${item.__config__.renderKey || item.tag}`"
            :group="drawingContainer"
            :drawingList="drawingContainer"
            :currentItem="item"
            :index="index"
            :activeId="activeId"
            :formConf="formConf"
            @activeItem="activeFormItem"
            @copyItem="drawingItemCopy"
            @deleteItem="drawingItemDelete"
          />
          <div v-show="!drawingContainer.length" class="empty-info">
            从左侧拖入表格组件（非必选）
          </div>
        </draggable>
      </el-scrollbar>
    </div>

    <right-panel
      :type="panelType"
      :drawingList.sync="drawingContainer"
      :activeData.sync="activeData"
      :formConf="formConf"
      :showField="!!drawingList.length || !!drawingContainer.length"
      @tag-change="tagChange"
      @fetch-data="fetchData"
      @set-search="addTableSearchItem"
      @set-table-pagination="setPagination"
    />

    <form-drawer
      :visible.sync="drawerVisible"
      :formData="pageData.formData"
      size="100%"
      :generateConf="generateConf"
    />
    <json-drawer
      size="60%"
      :visible.sync="jsonDrawerVisible"
      :jsonStr="JSON.stringify(pageData.formData)"
      @refresh="refreshJson"
    />
    <code-type-dialog
      :visible.sync="dialogVisible"
      title="选择生成类型"
      :showFileName="showFileName"
      @confirm="generate"
    />
    <input id="copyNode" type="hidden">
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { debounce } from 'throttle-debounce'
import { saveAs } from 'file-saver'
import ClipboardJS from 'clipboard'
import render from '@/components/render/render'
import FormDrawer from './FormDrawer'
import JsonDrawer from './JsonDrawer'
import RightPanel from '../rightPanel/index'
import {
  inputComponents,
  selectComponents,
  layoutComponents,
  formConf
} from '@/components/generator/config'
import {
  exportDefault,
  beautifierConf,
  isNumberStr,
  titleCase,
  deepClone,
  isObjectObject
} from '@/utils/index'
import {
  makeUpHtml,
  vueTemplate,
  vueScript,
  cssStyle
} from '@/components/generator/html/index'
import { makeUpJs } from '@/components/generator/js'
import { makeUpCss } from '@/components/generator/css'
import drawingDefalut from '@/components/generator/drawingDefalut'
import logo from '@/assets/logo.png'
import CodeTypeDialog from '../CodeTypeDialog'
import FormDragItem from '../dragItem/formItem'
import NormalDragItem from '../dragItem/normalItem'
import {
  getDrawingFromHistory,
  saveDrawingData,
  getIdGlobal,
  saveIdGlobal,
  getFormConf
} from '@/utils/db'
import loadBeautifier from '@/utils/loadBeautifier'

let beautifier
const emptyActiveData = { style: {}, autosize: {} }
let oldActiveId
let tempActiveData
const drawingListInDB = getDrawingFromHistory()
const formConfInDB = getFormConf()
const idGlobal = getIdGlobal()

const compPool = [...inputComponents, ...selectComponents, ...layoutComponents]

// TODO:生成分享链接
export default {
  name: 'ViewsForm',
  components: {
    draggable,
    render,
    FormDrawer,
    JsonDrawer,
    RightPanel,
    CodeTypeDialog,
    FormDragItem,
    NormalDragItem
  },
  data() {
    return {
      logo,
      idGlobal,
      formConf,
      inputComponents,
      selectComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: [],
      panelType: 'form',
      // 表格
      drawingContainer: [],
      drawingData: {},
      activeId: drawingDefalut[0].formId,
      drawerVisible: false,
      pageData: {
        formData: {},
        containerData: {}
      },
      dialogVisible: false,
      jsonDrawerVisible: false,
      generateConf: null,
      showFileName: false,
      activeData: drawingDefalut[0],
      saveDrawingDataDebounce: debounce(340, saveDrawingData),
      saveIdGlobalDebounce: debounce(340, saveIdGlobal),
      collapseLeft: false,
      leftComponents: [
        {
          title: '输入型组件',
          list: inputComponents
        },
        {
          title: '选择型组件',
          list: selectComponents
        },
        {
          title: '布局型组件',
          groupName: 'containerGroup',
          list: layoutComponents.filter(item => !item.__config__.isSideComp)
        }
        // {
        //   title: '业务型组件',
        //   list: businessComponents
        // }
      ]
    }
  },
  computed: {},
  watch: {
    // eslint-disable-next-line func-names
    'activeData.__config__.label': function (val, oldVal) {
      if (
        this.activeData.placeholder === undefined
        || !this.activeData.__config__.tag
        || oldActiveId !== this.activeId
      ) {
        return
      }
      this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val
    },
    activeId: {
      handler(val) {
        oldActiveId = val
      },
      immediate: true
    },
    drawingContainer: {
      handler(val) {
        this.saveDrawingDataDebounce(this.drawingList, val)
        if (val.length === 0) this.idGlobal = 100
      },
      deep: true
    },
    drawingList: {
      handler(val) {
        this.saveDrawingDataDebounce(val, this.drawingContainer)
        if (val.length === 0) this.idGlobal = 100
      },
      deep: true
    },
    idGlobal: {
      handler(val) {
        this.saveIdGlobalDebounce(val)
      },
      immediate: true
    }
  },
  mounted() {
    if (
      Array.isArray(drawingListInDB)
      && drawingListInDB.filter(Boolean).length > 0
    ) {
      const [list, container] = drawingListInDB
      this.drawingList = list.length ? list : drawingDefalut
      this.drawingContainer = container
    } else {
      this.drawingList = drawingDefalut
    }
    this.activeFormItem(this.drawingList[0])
    if (formConfInDB) {
      this.formConf = formConfInDB
    }
    loadBeautifier(btf => {
      beautifier = btf
    })
    const clipboard = new ClipboardJS('#copyNode', {
      text: trigger => {
        const codeStr = this.generateCode()
        this.$notify({
          title: '成功',
          message: '代码已复制到剪切板，可粘贴。',
          type: 'success'
        })
        return codeStr
      }
    })
    clipboard.on('error', e => {
      this.$message.error('代码复制失败')
    })
  },
  methods: {
    setCollapseLeft() {
      this.collapseLeft = !this.collapseLeft
    },
    setObjectValueReduce(obj, strKeys, data) {
      const arr = strKeys.split('.')
      arr.reduce((pre, item, i) => {
        if (arr.length === i + 1) {
          pre[item] = data
        } else if (!isObjectObject(pre[item])) {
          pre[item] = {}
        }
        return pre[item]
      }, obj)
    },
    setRespData(component, resp) {
      const { dataPath, renderKey, dataConsumer } = component.__config__
      if (!dataPath || !dataConsumer) return
      const respData = dataPath
        .split('.')
        .reduce((pre, item) => pre[item], resp)

      // 将请求回来的数据，赋值到指定属性。
      // 以el-tabel为例，根据Element文档，应该将数据赋值给el-tabel的data属性，所以dataConsumer的值应为'data';
      // 此时赋值代码可写成 component[dataConsumer] = respData；
      // 但为支持更深层级的赋值（如：dataConsumer的值为'options.data'）,使用setObjectValueReduce
      this.setObjectValueReduce(component, dataConsumer, respData)
      const i = this.drawingList.findIndex(
        item => item.__config__.renderKey === renderKey
      )
      if (i > -1) this.$set(this.drawingList, i, component)
    },
    fetchData(component) {
      const { dataType, method, url } = component.__config__
      if (dataType === 'dynamic' && method && url) {
        this.setLoading(component, true)
        this.$axios({
          method,
          url
        }).then(resp => {
          this.setLoading(component, false)
          this.setRespData(component, resp.data)
        })
      }
    },
    setLoading(component, val) {
      const { directives } = component
      if (Array.isArray(directives)) {
        const t = directives.find(d => d.name === 'loading')
        if (t) t.value = val
      }
    },
    activeFormItem(currentItem) {
      const {
        __config__: { tag }
      } = currentItem
      const footerComps = ['el-table', 'el-pagination']
      this.panelType = footerComps.includes(tag) ? tag.replace('el-', '') : 'form'
      this.activeData = currentItem
      this.activeId = currentItem.__config__.formId
    },
    onEnd(obj) {
      if (obj.from !== obj.to) {
        this.fetchData(tempActiveData)
        this.activeData = tempActiveData
        this.activeId = this.idGlobal
      }
    },
    onMoveForm(e, originalEvent) {
      // 停靠对象 如果停靠对象是A区，就拒绝掉
      // if (e.relatedContext.element.isConfig) return false

      // 拖拽对象
      // if (e.draggedContext.element.isConfig) return false
      return true
    },
    onMoveContainer(e, originalEvent) {
      // 停靠对象 如果停靠对象是A区，就拒绝掉
      // if (e.relatedContext.element.isConfig) return false

      // 拖拽对象
      // if (e.draggedContext.element.isConfig) return false
      return true
    },
    // 表格配置start
    openPagination(props) {
      let target = compPool.find(item => {
        const {
          __config__: { tagIcon }
        } = item
        return tagIcon === 'pagination'
      })
      target = deepClone(target)
      // 为组件生成唯一ID 方便标识是否是active项
      target = this.cloneComponent(target)
      target = { ...target, ...props }
      this.drawingContainer.push(target)
      // debugger
    },
    closePagination() {
      // TODO 目前只支持一个表格 一个分页的组合
      if (this.drawingContainer.length > 1) {
        this.drawingContainer.pop()
      }
    },
    setPagination({ isShowPagination, ...props }) {
      // debugger
      if (isShowPagination) {
        this.openPagination(props)
      } else {
        this.closePagination()
      }
    },
    addTableSearchItem(data) {
      const { type, label, prop } = data
      let target = compPool.find(item => {
        const {
          __config__: { tagIcon }
        } = item
        return tagIcon === type
      })
      target = deepClone(target)
      // 为组件生成唯一ID 方便标识是否是active项
      target = this.cloneComponent(target)
      target.__config__.label = label
      target.__vFormModel__ = prop
      this.drawingList.push(target)
      this.activeFormItem(target)
    },
    // 表格配置end
    addComponent(item) {
      const clone = this.cloneComponent(item)
      this.fetchData(clone)
      this.drawingList.push(clone)
    },
    cloneComponent(origin) {
      const clone = deepClone(origin)
      const config = clone.__config__
      config.span = this.formConf.span // 生成代码时，会根据span做精简判断
      this.createIdAndKey(clone)
      clone.placeholder !== undefined && (clone.placeholder += config.label)
      tempActiveData = clone
      return tempActiveData
    },
    createIdAndKey(item) {
      const config = item.__config__
      config.formId = ++this.idGlobal
      config.renderKey = `${config.formId}${+new Date()}` // 改变renderKey后可以实现强制更新组件
      if (config.layout === 'colFormItem') {
        item.__vFormModel__ = `field${this.idGlobal}`
      } else if (config.layout === 'rowFormItem') {
        config.componentName = `row${this.idGlobal}`
        !Array.isArray(config.children) && (config.children = [])
        delete config.label // rowFormItem无需配置label属性
      }
      if (Array.isArray(config.children)) {
        config.children = config.children.map(childItem => this.createIdAndKey(childItem))
      }
      return item
    },
    AssemblePageData() {
      this.pageData = {
        formData: {
          fields: deepClone(this.drawingList),
          ...this.formConf
        },
        containerData: deepClone(this.drawingContainer)
      }
    },
    generate(data) {
      const func = this[`exec${titleCase(this.operationType)}`]
      this.generateConf = data
      func && func(data)
    },
    execRun(data) {
      this.AssemblePageData()
      this.drawerVisible = true
    },
    execDownload(data) {
      const codeStr = this.generateCode()
      const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, data.fileName)
    },
    execCopy(data) {
      document.getElementById('copyNode').click()
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(
        () => {
          this.drawingList = []
          this.drawingContainer = []
          this.idGlobal = 100
        }
      )
    },
    drawingItemCopy(item, list) {
      let clone = deepClone(item)
      clone = this.createIdAndKey(clone)
      list.push(clone)
      this.activeFormItem(clone)
    },
    drawingItemDelete(index, list) {
      list.splice(index, 1)
      this.$nextTick(() => {
        const len = this.drawingList.length
        if (len) {
          this.activeFormItem(this.drawingList[len - 1])
        }
      })
    },
    generateCode() {
      const { type } = this.generateConf
      this.AssemblePageData()
      const script = vueScript(makeUpJs(this.pageData, type))
      const html = vueTemplate(makeUpHtml(this.pageData, type))
      const css = cssStyle(makeUpCss(this.pageData))
      return beautifier.html(html + script + css, beautifierConf.html)
    },
    showJson() {
      this.AssemblePageData()
      this.jsonDrawerVisible = true
    },
    download() {
      this.dialogVisible = true
      this.showFileName = true
      this.operationType = 'download'
    },
    run() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'run'
    },
    copy() {
      this.dialogVisible = true
      this.showFileName = false
      this.operationType = 'copy'
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag)
      const config = newTag.__config__
      newTag.__vFormModel__ = this.activeData.__vFormModel__
      config.formId = this.activeId
      config.span = this.activeData.__config__.span
      this.activeData.__config__.tag = config.tag
      this.activeData.__config__.tagIcon = config.tagIcon
      this.activeData.__config__.document = config.document
      if (
        typeof this.activeData.__config__.defaultValue
        === typeof config.defaultValue
      ) {
        config.defaultValue = this.activeData.__config__.defaultValue
      }
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined) {
          newTag[key] = this.activeData[key]
        }
      })
      this.activeData = newTag
      this.updateDrawingList(newTag, this.drawingList)
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(
        item => item.__config__.formId === this.activeId
      )
      if (index > -1) {
        list.splice(index, 1, newTag)
      } else {
        list.forEach(item => {
          if (Array.isArray(item.__config__.children)) this.updateDrawingList(newTag, item.__config__.children)
        })
      }
    },
    refreshJson(data) {
      this.drawingList = deepClone(data.fields)
      delete data.fields
      this.formConf = data
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/home';

.container {
  display: flex;
  width: 100vw;
}
.left-wrapper {
  display: flex;
  .nav {
    z-index: 1;
    padding-top: 14px;
    width: 44px;
    flex-shrink: 0;
    text-align: center;
    height: 100vh;
    background: #fbfbfb;
    border-right: 1px solid #ececec;
    position: relative;
    i {
      cursor: pointer;
    }
  }
  .left-scrollbar {
    transition: all ease-out 0.1s;
    background: #fff;
    transform: translate(-100%);
    width: 0;
    &.active {
      width: 240px;
      transform: translate(0);
    }
  }
}
.center-board {
  border: 10px solid #eeeff3;
}
</style>
