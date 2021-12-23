<script>
import draggable from 'vuedraggable'
import render from '@/components/render/render'

const components = {
  itemBtns(h, currentItem, index, list) {
    const { copyItem, deleteItem } = this.$listeners
    return [
          <span
            class="drawing-item-copy"
            title="复制"
            onClick={event => {
              copyItem(currentItem, list)
              event.stopPropagation()
            }}
          >
            <i class="el-icon-copy-document" />
          </span>,
          <span
            class="drawing-item-delete"
            title="删除"
            onClick={event => {
              deleteItem(index, list)
              event.stopPropagation()
            }}
          >
            <i class="el-icon-delete" />
          </span>
    ]
  }
}
const layouts = {
  colFormItem(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    let className = this.activeId === config.formId
      ? 'drawing-item active-from-item'
      : 'drawing-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    return (
          <div
            span={config.span}
            class={className}
            onClick={event => {
              activeItem(currentItem)
              event.stopPropagation()
            }}
          >
              <render
                key={config.renderKey}
                conf={currentItem}
                onInput={event => {
                  this.$set(config, 'defaultValue', event)
                }}
              >
                {child}
              </render>
            {components.itemBtns.apply(this, arguments)}
          </div>
    )
  },
  raw(h, currentItem, index, list) {
    const config = currentItem.__config__
    
    const child = renderChildren.apply(this, arguments)
    return (
          <render
            key={config.renderKey}
            conf={currentItem}
            onInput={event => {
              this.$set(config, 'defaultValue', event)
            }}
          >
            {child}
          </render>
    )
  }
}

function renderChildren(h, currentItem, index, list) {
  const config = currentItem.__config__
  if (!Array.isArray(config.children)) return null
  return config.children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, config.children)
    }
    return layoutIsNotFound.call(this)
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.currentItem.__config__.layout}匹配的layout`)
}

export default {
  components: {
    render,
    draggable
  },
  props: ['currentItem', 'index', 'drawingList', 'activeId', 'formConf', 'group'],
  render(h) {
    const layout = layouts[this.currentItem.__config__.layout]

    if (layout) {
      return layout.call(
        this,
        h,
        this.currentItem,
        this.index,
        this.drawingList
      )
    }
    return layoutIsNotFound.call(this)
  }
}
</script>

