export default {
  columns(h, conf, key) {
    const list = []
    conf.__slot__.columns.forEach(item => {
      const { width, prop, label } = item
      // TODO 不能用扩展运算符
      list.push(<el-table-column label={label} width={width} prop={prop} align='center'></el-table-column>)
    })
    return list
  }
}

