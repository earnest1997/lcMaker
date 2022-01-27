import { tableColumnType } from '@/components/generator/config'

const renderCol = (h, {
  type, data, color, isOperationCol, btnGroup
}) => {
  const tagDom = <el-tag type={color}>{data}</el-tag>
  const imgDom = <img src={data} style="width:100px;height:100px;" />
  const linkDom = <a href={data}>{data}</a>
  const btns = btnGroup?.map(({ value, color }) => (<el-button type={color} size='mini'>{value}</el-button>))
  
  type = isOperationCol ? '操作' : type
  switch (type) {
    case tableColumnType.标签:
      return tagDom
    case tableColumnType.图片:
      return imgDom
    case tableColumnType.链接:
      return linkDom
    case '操作':
      return <div>{btns}</div>
    default:
      return data
  }
}

export default {
  columns(h, conf, key) {
    const list = []
    conf.__slot__.columns.forEach(item => {
      const {
        width, prop, label, __config__:{ type, valMap }
      } = item
      const { __config__ } = item

      const isOverflow = tableColumnType.长文本 === type

      const slotScope = {
        scopedSlots: {
          default(scope) {
            const data = scope.row[prop]
            const color = valMap?.find(item => item.value === data)?.color || 'info'
            return renderCol(h, {
              type, color, data, ...__config__ 
            })
          }
        }
      }
      list.push(
        <el-table-column
          {...{
            props: {
              label,
              width,
              prop,
              align: 'center',
              ...(isOverflow && { 'show-overflow-tooltip': true })
            },
            ...slotScope
          }}
        ></el-table-column>
      )
    })
    return list
  }
}
