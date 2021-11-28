<template>
  <div class="reg-test-wrapper">
    <h4>正则自测</h4>
    <div class="content">
      <el-form-item
        v-model="reg"
        :rules="[{ validator: validateReg, trigger: 'change' }]"
        prop="reg"
      >
        <el-input v-model="reg" placeholder="请输入正则表达式" />
        <a class="pattern" href="javascript:void 0;">
          /<span @click="togglePattern">{{ pattern.join('') }}</span>
          <ul class="pattern-list">
            <li>REGEX FLAGS</li>
            <li
              v-for="item in patterns"
              :key="item.value"
              :class="pattern.includes(item.value) ? 'active' : ''"
              @click="handleSelect(item)"
            >
              <span>{{ item.all }}</span>
              <span>{{ item.label }}</span>
            </li>
          </ul>
        </a>
      </el-form-item>
      <div class="text">
        <!-- <textarea id="regTest" ref="regTest" v-model="regTest" placeholder="请输入验证文本" /> -->
        <div contenteditable="true" class="textarea" @input="handleInput" />
        <div class="cover">
          <span v-for="(item, index) in regTest" :key="`${item}-${index}`">{{
            item
          }}</span>
        </div>
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
      patterns: [
        {
          value: 'g',
          all: 'global',
          label: '全局匹配'
        },
        {
          value: 'i',
          all: 'insensitive',
          label: '不区分大小写'
        }
      ],
      matchedStr: []
    }
  },
  computed: {
    regs() {
      const { regTest, reg } = this
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
        const { regTest, reg } = val
        let regToBeMatch = this.reg
          .replace(/^\//, '')
          .replace(/\/$/, '')
          .replace(/\\/, '\\')
        try {
          regToBeMatch = new RegExp(reg, this.pattern.join(''))
        } catch (err) {
          return
        }
        if (!regTest || !regToBeMatch || !regTest.match(regToBeMatch)) {
          this.cleanBg()
          return
        }
        this.drawBg(regToBeMatch)
      },
      deep: true
    }
  },
  methods: {
    handleInput(e) {
      this.regTest = e.target.innerHTML
    },
    handleSelect(item) {
      const { value } = item
      const pattern = value.slice(0, 1)
      if (this.pattern.includes(pattern)) {
        this.pattern = this.pattern.filter(_item => _item !== pattern)
      } else {
        this.pattern.push(pattern)
      }
    },
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
    drawBg(reg) {
      if (this.pattern.includes('g')) {
        const res = Array.from(this.regTest.matchAll(reg)).map(item => {
          let { index } = item
          const len = item[0].length
          index -= 1
          const newMatched = Array.from({ length: len })
            .map(_ => index + 1)
            .join('')
          return newMatched
        })
        this.matchedStr = [...res, this.matchedStr]
        // let start=0
        // let res=[]
        //  while(start<=this.regTest.length-1){
        //    const str=this.regTest.slice(start)
        //   if(reg.test(str)){
        //      const len=str.match()
        //   }
        //  }
      }
    },
    cleanBg() {
      this.matchedStr = []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 317px;
  height: 54px;
  z-index: 1;
}

.content {
  margin-top: 10px;
  background: #f8f8f8;
  padding: 12px 6px;
  border-radius: 4px;
}

.pattern {
  position: relative;
  width: 12px;
  z-index: 2;
  margin-right: 10px;
  text-decoration: none;
  &:focus {
    .pattern-list {
      opacity: 1;
      pointer-events: unset;
    }
  }
  &-list {
    position: absolute;
    width: 220px;
    opacity: 0;
    top: -20px;
    right: 0;
    z-index: 2;
    pointer-events: none;
    li {
      position: relative;
      cursor: pointer;
      color: #606266;
    }
    li:first-child {
      color: #2b568a;
      text-transform: uppercase;
      font-weight: 600;
      border-bottom: 1px solid #e1e1e1;
      pointer-events: none;
    }
    li:not(:first-child):first-letter {
      color: #2c5c97;
    }
    li:hover {
      background: #f7f7f7;
    }
    li.active::after {
      position: absolute;
      right: 8px;
      top: 17px;
      content: '';
      width: 10px;
      height: 4px;
      border-color: transparent transparent #2c5c97 #2c5c97;
      border-width: 2px;
      border-style: solid;
      border-radius: 7px;
      transform: rotate(-45deg);
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
    content: '';
    display: inline-block;
    width: 1px;
    height: 14px;
    background-color: rgba(0, 0, 0, 0.7);
    /* 关键是中间的过程都是不显示的 */
    animation: cursor 1.5s infinite steps(1, start);
    @content;
  }
}

.reg-test-wrapper {
  margin-bottom: 18px;
  h4 {
    font-size: 14px;
    color: #606266;
  }
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

  .textarea {
    display: inline-block;
    width: 215px;
    min-height: 28px;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 6px 15px;
    font-size: 14px;
    letter-spacing: 0;
    font-family: Microsoft YaHei;
    color: transparent;
  }

  .textarea:focus + .cover {
    &:empty {
      @include cursor {
        // top: 10px;
        left: 15px;
        top: 7px;
      }
    }
  }

  .cover {
    position: absolute;
    width: 183px;
    font-size: 14px;
    left: 90px;
    padding: 7px 15px;
    top: 0;
    text-align: left;
    pointer-events: none;
    display: flex;
    flex-wrap: wrap;
    > span:last-child {
      position: relative;

      @include cursor {
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  .el-form-item__content:first-child {
    position: relative;
    width: 215px;
    float: right;
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
