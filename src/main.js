import { createApp } from 'vue';
import App from './App.vue';
import './style/index.scss';
import { FileManager } from '@/class/FileManager';
import {getAll, init} from '@/class/IndexDB'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css';
const markdownInit = async () => {
  await init()
  let files = await getAll()
  /**
   *
   */
  window.FileManager = new FileManager({
    cache: files,
    activePath: files.length>0?files[0].path: null
  });
}


markdownInit()



createApp(App).use(ElementPlus).mount('#app');

