<template>
  <div class="reg-test-wrapper">
    <h4>正则自测</h4>
    <el-form-item
      v-model="reg"
      :rules="[{ validator: validateReg, trigger: 'blur' }]"
      prop="reg"
    >
      <el-input v-model="reg" placeholder="请输入正则表达式" />
    </el-form-item>
    <div class="text">
      <canvas ref="canvas" />
      <el-input
        id="regTest"
        ref="regTest"
        v-model="regTest"
        type="textarea"
        placeholder="请输入验证文本"
      />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      regTest: '',
      reg: ''
    }
  },
  computed: {
    regs() {
      const { regTest, reg } = this
      return { regTest, reg }
    }
  },
  watch: {
    regs: {
      handler(val) {
      // eslint-disable-next-line prefer-const
        let { regTest, reg } = val
        if (!regTest || !reg) return
        reg = reg.replace(/^\//, '').replace(/\/$/, '')
        reg = new RegExp(reg)
        const matches = regTest.match(reg) ?? []
        console.log(matches, 'ss')
      },
      deep: true
    }
  },
  methods: {
    drawBg(reg) {
      const { canvas } = this.$refs
      canvas.width = 200
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      // matches.forEach((item, index) => {
      //   const isOdd = index % 2 === 0
      //   const fillStyle = isOdd ? 'rgba(77,145,226,.3)' : 'rgba(77,145,226,.6)'
      //   const { width } = ctx.measureText(item)
      // })
      let arr
      let index = 0
      const maxW = 500
      const lineH = 15
      // eslint-disable-next-line no-cond-assign
      while (arr = reg.exec(this.regTest) !== null) {
        ctx.font = '12px Microsoft YaHei'
        const textWidth = ctx.measureText(this.regTest.slice(0, reg.lastIndex))
        const start = textWidth % maxW
        const line = Math.ceil(textWidth / maxW)
        const top = line * lineH
        const matchW = ctx.measureText(arr[0])
        const isOdd = index % 2 === 0
        const fillStyle = isOdd ? 'rgba(77,145,226,.3)' : 'rgba(77,145,226,.6)'
        ctx.fillStyle = fillStyle
        ctx.fillRect(start, top, matchW + 1, lineH)
        index += 1
      }
    }

  }
}
</script>
<style lang='scss' scoped>
canvas{
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 100px;
    }
</style>
<style lang='scss'>
.reg-test-wrapper{
.el-input{
background:transparent;
}
}
</style>
