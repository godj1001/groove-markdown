<template>
  <div class="main">
    <div class="tool-bar">
      <Toolbar @toolbarEvent="toolbarEvent"></Toolbar>
    </div>
    <div class="markdown-content" ref="markdownRef">
      <textarea class="content-editor" ref="contentEditor" v-model="content" @keydown.enter="checkStatus" @keydown.backspace="checkStatus"/>
      <div class="content-preview" ref="htmlContent"  v-html="htmlRes">
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, onMounted, watch, ref,nextTick } from 'vue';
import { throttle, withInstall } from '@/utils';
import * as hljs from 'highlight.js';
import {Toolbar} from './toolbar'
import 'highlight.js/scss/github.scss';
const { ipcRenderer } = window.require('electron');
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
            hljs.highlight(lang, str, true).value +
            '</code></pre>';
      } catch (__) {
        console.log(__);
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const markdown = defineComponent({
  name: 'markdown',
  components:{
    Toolbar
  },
  props: {
    modelValue: {
      default: () => {
        return {
          name: '',
          path: '',
          data: ''
        };
      },
      type: Object
    }
  },
  emits: ['saveFile','update:modelValue'],
  setup (props, { emit }) {
    const content = ref('');
    const htmlRes = ref('');
    const contentEditor = ref(null);
    const htmlContent = ref(null);
    const scrollHtml = (e) => {
      const flag = e.scrollTop + e.clientHeight > e.scrollHeight - 20;
      const rate = flag ? (e.scrollTop + e.clientHeight) / e.scrollHeight : e.scrollTop / e.scrollHeight;
      htmlContent.value.scrollTop = htmlContent.value.scrollHeight * rate;
    };
    const htmlScrollFn = throttle(scrollHtml, 300);

    onMounted(() => {
      content.value = props.modelValue.data;
      console.log(contentEditor.value);
      ipcRenderer.on('saveFile', () => {
        console.log('markdown ipc get');
        emit('saveFile', content);
      });
      contentEditor.value.addEventListener('scroll', (e) => {
        htmlScrollFn(e.srcElement);
      });
    });

    const contentToHtml = (newVal) => {
      htmlRes.value = md.render(newVal);
      emit('update:modelValue',{...props.modelValue,data: newVal})
    };
    const setContent = (val) => {
      content.value = val.data;
    };
    watch(content, contentToHtml);
    watch(() => props.modelValue, setContent);
    const addText = async (text) => {
      let pos =  contentEditor.value.selectionStart
      console.log(pos)
      content.value = content.value.slice(0,pos) + text + content.value.slice(pos,content.value.length)
      await nextTick()
      contentEditor.value.selectionStart = pos + text.length
      contentEditor.value.selectionEnd = pos + text.length
      contentEditor.value.focus()
    }
    const clearStatus = () => {
      console.log('clearStatus')
    }

    const checkStatus = () => {

    }

    const findIndex = (text,target) => {
      let res = []
      let index = 0
      for (let item of text){
        if (item === target){
          res.push(index)
        }
        index++
      }
      return res
    }

    const changeStart = async (text) => {
      let pos =  contentEditor.value.selectionStart
      let [posStart,posEnd] = findIndex(text,'$')

      console.log(posStart,posEnd)
      if (!posEnd){
        posEnd = posStart + 1
      }
      let newText = text.replace(/\$/g,'')
      console.log(newText)
      content.value = content.value.slice(0,pos) + newText + content.value.slice(pos,content.value.length)

      await nextTick()
      contentEditor.value.selectionStart = pos + posStart
      contentEditor.value.selectionEnd = pos + posEnd - 1
      contentEditor.value.focus()
    }
    const toolbarEvent = (opt) => {
      /**
       * todo check event  set status
       */
      console.log(opt)
      if (opt.addText){
        addText(opt.addText)
      }else if (opt.changeStart){
        changeStart(opt.changeStart)
      }
    }
    return {
      content,
      htmlRes,
      contentEditor,
      htmlContent,
      toolbarEvent,
      clearStatus,
      checkStatus
    };
  }
});
const Markdown = withInstall(markdown);
export default Markdown;
export { Markdown };
</script>

<style scoped lang='scss'>
@import '../style';

@mixin markdownStyle {

  .main{
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    overflow: hidden;
    .tool-bar{
      flex-shrink: 0;
      height: 40px;
      width: 100%;
      border-bottom: 1px solid #939292;
    }
    .markdown-content{
      width: 100%;
      flex-grow: 1;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      height: calc(100% - 40px);

      .content-editor{
        height: 100%;
        width: 100%;
        background: #0b1c2c;
        color: #cbc8c8;
        flex-grow: 1;
        flex-shrink: 1;
        border: none;
        border-right: 1px solid #939292;
        padding: 40px 30px 0 30px;
        outline: none;
        caret-color: white;
        font-size: 18px;
        line-height: 34px;
        overflow: scroll;
        &::-webkit-scrollbar{
          display: none;
        }
        &:focus {
          outline:none;
          caret-color: #d46b6b;
        }
      }
      .content-preview{
        height: 100%;
        width: 100%;
        word-break: break-word;
        flex-grow: 1;
        flex-shrink: 1;
        padding: 40px 30px 0 30px;
        font-size: 18px;
        line-height: 34px;
        overflow: scroll;
        h1{
          font-size: 30px;
        }
        h2{
          font-size: 28px;
        }
        h3{
          font-size: 26px;
        }
        h4{
          font-size: 24px;
        }
        h5{
          font-size: 22px;
        }

        &::-webkit-scrollbar{
          display: none;
        }
      }
    }
  }
}

@include markdownStyle()
@media screen and (min-width: 415px) {
  @include markdownStyle()
}
</style>
