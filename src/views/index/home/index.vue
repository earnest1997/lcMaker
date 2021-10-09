<template>
  <div class="home">
    <h2>Admin-Comp-Generator</h2>
    <h3>选择一种类型开始吧</h3>
    <div class="btn-wrapper">
      <Btn buttonText="业务组件" @click="turn('custom')" />
      <Btn buttonText="自定义表单" @click="turn('form')" />
    </div>
  </div>
</template>
<script>
import Btn from './Btn'

export default {
  components: { Btn },
  methods: {
    turn(path) {
      this.$router.push({ path: `/${path}` })
    }
  }
}
</script>
<style lang="scss">
@import "@/styles/mixin.scss";

.home {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  .btn-wrapper {
    padding-top: 10vh;
    margin-left: -200px;
    @include flex;
    > div:first-child {
      margin-right: 300px;
    }
  }
  h2 {
    color: #fff;
    font-size: 24px;
    padding: 10px 0 0 10px;
  }
  h3 {
  margin:0 auto;
    color: #fff;
    padding-top: 20vh;
    font-size: 40px;
    word-break:keep-all;
    white-space:nowrap;
    overflow:hidden;
    animation: typing 1.5s forwards 1 steps(9,end);
  }
}
@keyframes typing {
  from {
    width: 0;
  }
  to {
  /* width: 18ch; */
    width: 360px;
  }
}
</style>
