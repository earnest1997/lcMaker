export default {
  columns(h, conf, key) {
    const list = []
    conf.__slot__.columns.forEach(item => {
      const { width, prop, label } = item
      list.push(
        <el-table-column
          {...{
            props: {
              label,
              width,
              prop,
              align: 'center'
            }
          }}
        ></el-table-column>
      )
    })
    return list
  }
}
