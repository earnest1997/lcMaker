export function classNames(...items) {
  let str = '';
  (function iterator(arr) {
    arr.forEach(v => {
      if (Array.isArray(v)) {
        iterator(v)
      } else if (v instanceof Object) {
        Object.keys(v).forEach(key => {
          const val = v[key]
          if (val) {
            str += ` ${key}`
          }
        })
      } else if (v) {
        str += ` ${v}`
      }
    })
  }(items))
  
  return str.trim()
}
