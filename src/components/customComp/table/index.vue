<template>
  <div class="table-wrapper">
    <el-table :data="tableData">
      <el-table-column
        v-for="item in columns"
        :key="`${type}-${item.label}`"
        align="center"
        showOverflowTooltip
        :prop="item.col_prop || item.prop"
        :label="item.label"
        v-bind="item.props || {}"
      />
    </el-table>
    <el-pagination
      :pageSizes="[20, 50, 100]"
      :pageSize="20"
      :currentPage.sync="page"
      background
      layout="total,sizes, prev, pager, next"
      :total="tableLen"
      @size-change="val => handlePageInfoChange('page_size', val)"
      @current-change="val => handlePageInfoChange('page', val)"
    />
  </div>
</template>
<script>
const valMap = {
  price: Symbol(),
  text: Symbol(),
  date:Symbol()
}
export default {
  data() {
    return {
      columns: [{
        props: 'index', name: 'index', search: false, valueType: 'text'
      }],
      tableData: []
    }
  },
  mounted() {

  },
  methods: {
    transformData(data) {
      return data.map(({ valueType }))
    }
  }
}
</script>
