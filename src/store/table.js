/* eslint-disable import/no-mutable-exports */
import Vue from 'vue'

export let store = Vue.observable({
  tableData: JSON.stringify({ list: [{ id: 999 }] })
})

export let mutations = {
  setTableData(data) {
    store.tableData = data
  }
}
