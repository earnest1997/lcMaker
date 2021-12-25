const CONTAINER_ITEMS = 'container'
const FORM_ITEMS = 'form'
const DRAWING_ITEMS_VERSION = '1.2'
const ITEM_KEY = 'DRAWING_ITEMS_VERSION'
const DRAWING_ID = 'idGlobal'
const TREE_NODE_ID = 'treeNodeId'
const FORM_CONF = 'formConf'

export function getDrawingFromHistory() {
  // 加入缓存版本的概念，保证缓存数据与程序匹配
  const version = localStorage.getItem(ITEM_KEY)
  if (version !== DRAWING_ITEMS_VERSION) {
    localStorage.setItem(ITEM_KEY, DRAWING_ITEMS_VERSION)
    saveDrawingData([], [])
    return null
  }

  const form = localStorage.getItem(FORM_ITEMS)
  const container = localStorage.getItem(CONTAINER_ITEMS)
  return [form, container].map(item => {
    if (!item) return []

    return JSON.parse(item)
  })
}

export function saveDrawingData(form, container) {
  form && localStorage.setItem(FORM_ITEMS, JSON.stringify(form))
  container && localStorage.setItem(CONTAINER_ITEMS, JSON.stringify(container))
}

export function getIdGlobal() {
  const str = localStorage.getItem(DRAWING_ID)
  if (str) return parseInt(str, 10)
  return 100
}

export function saveIdGlobal(id) {
  localStorage.setItem(DRAWING_ID, `${id}`)
}

export function getTreeNodeId() {
  const str = localStorage.getItem(TREE_NODE_ID)
  if (str) return parseInt(str, 10)
  return 100
}

export function saveTreeNodeId(id) {
  localStorage.setItem(TREE_NODE_ID, `${id}`)
}

export function getFormConf() {
  const str = localStorage.getItem(FORM_CONF)
  if (str) return JSON.parse(str)
  return null
}

export function saveFormConf(obj) {
  localStorage.setItem(FORM_CONF, JSON.stringify(obj))
}
