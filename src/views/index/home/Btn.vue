<!-- 容器元素旋转，第一面跟第二面形成一个九十度的折角就行-->
<template>
  <div ref="fancyButton" class="fancy-button" :style="buttonStyle" v-on="$listeners">
    <div class="fancy-flipper">
      <div class="fancy-front" :style="fancyFrontStyle">
        {{ buttonText }}
      </div>
      <div class="fancy-back" :style="fancyBackStyle">
        {{ buttonText }}
      </div>
    </div>
  </div>
</template>
<script>
const color = '#FFFFFF'
const width = 210
const height = 50
const fontSize = 40
const borderWidth = 15

export default {
  props: {
    buttonText: { type: String, default: '' }
  },
  data() {
    return {
      width,
      height,
      fancyFrontStyle: {
        transform: `rotateX(0deg) translateZ(${height / 2}px )`
      },
      fancyBackStyle: {
        transform: `rotateX(90deg) translateZ( ${height / 2}px )`
      },
      buttonStyle: {
        width,
        height
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/mixin.scss';

.fancy-button {
  position: relative;
  display: block;
  cursor: pointer;
  perspective: 1800px;
  .fancy-back {
    color: #fff;
    border: 4px solid #fff;
    background: transparent;
  }
  .fancy-front {
    color: rgba(0, 0, 0, 0.8);
    background: #fff;
  }
  .fancy-flipper {
    width: 210px;
    height: 50px;

    letter-spacing: 0.01em;
    font-family: Futura, "Helvetica Neue", Helvetica, sans-serif;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform-style: preserve-3d;
    transform: rotateX(-90deg);
    transition: transform 0.3s ease;
  }
  .fancy-front,
  .fancy-back {
    @include flex;
    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.5);
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  &:hover {
    .fancy-flipper {
      transform: rotateX(0deg);
    }
  }
}
</style>
