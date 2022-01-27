<script>
import TablePanel from './container/tablePanel'
import PaginationPanel from './container/paginationPanel'
import FormPanel from './formPanel'

const components = { TablePanel, PaginationPanel, FormPanel }
export default {
  render(h) {
    const compName = `${this.$attrs.type.replace(/\w/, $1 => $1.toUpperCase())}Panel`
    const comp = components[compName]
    return <comp {...{ props:this.$attrs, on:this.$listeners }} />
  }
}
</script>
