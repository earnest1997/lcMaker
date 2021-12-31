<script>
import Container from './containerPanel'
import FormPanel from './formPanel'

export default {
  components: { Container, FormPanel },
  props: ['showField', 'activeData', 'formConf', 'type'],
  render(h) {
    const props = {
      activeData: this.activeData,
      formConf: this.formConf,
      showField: this.showField
    }
    if (this.type === 'container') {
      return <Container {...{ props }} />
    }
    return <FormPanel {...{ props }} />
  }
}
</script>
