<template>
  <div class="reg-test-wrapper">
    <h4>正则自测</h4>
    <el-form-item v-model="reg" :rules="[{ validator: validateReg, trigger: 'blur' }]" prop="reg">
      <el-input v-model="reg" placeholder="请输入正则表达式" />
      <a class="pattern" href="javascript:void 0;">
        /<span @click="togglePattern">{{ pattern.join('') }}</span>
        <ul class="pattern-list">
          <li v-for="item in patterns" :key="item.value">
            <span>{{ item.value }}</span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </a>
    </el-form-item>
    <div class="text">
      <textarea id="regTest" ref="regTest" v-model="regTest" placeholder="请输入验证文本" />
      <div class="cover">
        <span v-for="(item,index) in regTest" :key="`${item}-${index}`">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const ctx = null
const canvasW = 317
const canvasH = 54

export default {
  data() {
    return {
      regTest: '',
      reg: '',
      pattern: ['g'],
      patterns: [{
        value: 'g',
        label: '全局匹配'
      }, {
        value: 'i',
        label: '不区分大小写'
      }]
    }
  },
  computed: {
    regs() {
      const {
        regTest,
        reg
      } = this
      return {
        regTest,
        reg
      }
    }
  },
  watch: {
    regs: {
      handler(val) {
        // eslint-disable-next-line prefer-const
        const {
          regTest,
          reg
        } = val
        if (!regTest || !reg) {
          console.log('wth')
          this.cleanBg()
          return
        }
        this.drawBg()
      },
      deep: true
    }
  },
  methods: {
    togglePattern() {},
    validateReg(rule, value, cb) {
      if (!value) return
      value = value.replace(/^\//, '').replace(/\/$/, '')
      try {
        const reg = new RegExp(value)
      } catch (err) {
        cb(new Error('不合法的正则表达式'))
        return
      }
      cb()
    },
    cleanBg() {
      ctx && ctx.clearRect(0, 0, canvasW, canvasH)
    },
    drawBg() {

    }
  }
}
</script>

<style lang="scss" scoped>
canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 317px;
    height: 54px;
    z-index: 1;
}

.pattern {
    position: relative;
    width: 12px;
    z-index: 2;

    &-list {
        position: absolute;
        width: 220px;
        opacity: 0;
        top: -20px;
        right: 0;
        z-index: 2;
        pointer-events: none;
    }

    &:focus {
        .pattern-list {
            opacity: 1;
            pointer-events: unset;
        }
    }
}
</style>
<style lang="scss">
@import '@/styles/common.scss';

@mixin cursor {
    &::after {
        position: absolute;
        top: 0;
        right: -1px;
        content: "";
        display: inline-block;
        width: 1px;
        height: 14px;
        background-color: rgba(0, 0, 0, .7);
        /* 关键是中间的过程都是不显示的 */
        animation: cursor 1.5s infinite steps(1, start);
        @content;
    }
}

.reg-test-wrapper {
    .el-input {
        background: transparent;
    }

    .text {
        position: relative;
        text-align: right;
    }

    canvas {
        position: absolute;
        pointer-events: none;
    }

    textarea {
        width: 227px;
        box-sizing: border-box;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        padding: 6px 15px;
        font-size: 14px;
        letter-spacing: 0;
        font-family: Microsoft YaHei;
        color: #fff;
    }

    textarea:focus+.cover {
        &:empty {
            @include cursor {
                top: 10px;
                left: 15px;
            }
        }
    }

    .cover {
        position: absolute;
        padding: 6px 15px;
        left: 0;
        top: 0;
        pointer-events: none;

    }

    >span:last-child {
        position: relative;

        @include cursor {
            top: 50%;
            transform: translateY(-50%);
        }
    }

    .el-form-item__content:first-child {
        position: relative;
    }

    .pattern {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        color: #407352;

        &-list {
            background: #fff;
            border-radius: 3px;
            box-shadow: 0 0 10px 3px rgb(0 0 0 / 20%);
            right: 0;
            word-break: keep-all;
            white-space: nowrap;

            li {
                padding: 8px 20px;
            }
        }
    }
}

@keyframes cursor {
    0% {
        opacity: 1;
        display: block;
    }

    50% {
        opacity: 0;
        display: none;
    }

    100% {
        opacity: 1;
        display: block;
    }
}
</style>
