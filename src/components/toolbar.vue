<template>
<div class="toolbar-box">
  <div class="toolbar-item" v-for="opt in options" @click="clickOption(opt)">
    <template v-if="opt.desc === 'split'">
      <span class="split-icon"> | </span>
    </template>
    <template v-else>
      <img class="opt-icon" :src="opt.icon" :alt="opt.desc" :title="opt.desc">
    </template>
  </div>
</div>
</template>

<script>
import {defineComponent} from 'vue'
import {withInstall} from '@/utils'

const toolbarItemList = [
  {
    icon: require('../assets/markdown/toolbar/h1.svg'),
    desc: '标题1',
    event: 'H1',
    addText: '\n# '
  },
  {
    icon: require('../assets/markdown/toolbar/h2.svg'),
    desc: '标题2',
    event: 'H2',
    addText: '\n## '
  },
  {
    icon: require('../assets/markdown/toolbar/h3.svg'),
    desc: '标题3',
    event: 'H3',
    addText: '\n### '
  },
  {
    icon: require('../assets/markdown/toolbar/h4.svg'),
    desc: '标题4',
    event: 'H4',
    addText: '\n#### '

  },
  {
    icon: require('../assets/markdown/toolbar/h5.svg'),
    desc: '标题5',
    event: 'H5',
    addText: '\n##### '
  },
  {
    icon: require('../assets/markdown/toolbar/list.svg'),
    desc: '无序列表',
    event: 'list',
    addText: '\n* '
  },{
    icon: require('../assets/markdown/toolbar/orderList.svg'),
    desc: '有序列表',
    event: 'orderList',
    addText: '\n1. '
  },{
    icon: require('../assets/markdown/toolbar/tab.svg'),
    desc: 'tab',
    event: 'tab',
    addText: '\t'
  },{
    icon: require('../assets/markdown/toolbar/link.svg'),
    desc: '链接',
    event: 'link',
    changeStart: '[]($url$)'
  },{
    icon: require('../assets/markdown/toolbar/bold.svg'),
    desc: '粗体',
    event: 'bold',
    changeStart: '**$**'
  }, {
    icon: require('../assets/markdown/toolbar/italic.svg'),
    desc: '斜体',
    event: 'italic',
    changeStart: '*$*'
  }
]

const toolbar = defineComponent( {
  name: 'toolbar',
  setup(props,{emit}){

    const clickOption = (opt) => {
      emit('toolbarEvent',opt)
    }

    return {
      options: toolbarItemList,
      clickOption
    }
  }
})


const Toolbar = withInstall(toolbar);
export default Toolbar;
export { Toolbar };
</script>

<style scoped lang='scss'>
@mixin toolbarStyle {
  .toolbar-box{
    height: 100%;
    width: max-content;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 4px 10px;
    .toolbar-item{
      height: 100%;
      margin-left: 6px;
      padding: 8px;
      text-align: center;
      line-height: 100%;
      border-radius: 5%;
      transition: transparentize 0.3s linear;
      .opt-icon{
        height: 100%;
        cursor: pointer;
        transition: transparentize 0.3s linear;
      }

      &:hover{
        background: #c1bdbd;
        .opt-icon{
          transform: scale(1.2)
        }
      }
    }

  }
}

@include toolbarStyle()
@media screen and (min-width: 415px) {
  @include toolbarStyle()
}
</style>
