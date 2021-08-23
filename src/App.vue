<template>
 <div class="g-markdown">
    <div class="file-finder" v-show="finderShow">
      <div class="file-toolbar" >
            <document-add class="folder-icon" @click="finderCreateClick"/>
            <folder class="folder-icon" @click="finderOpenClick"/>
      </div>
      <div class="file-list">
        <div class="file" @contextmenu="createMenu(file)" @click="changeFileActive(file)" v-for="file in fileCache" :active="file.path === activePath" :key="file.path">
          {{file.name}}
        </div>
      </div>

    </div>
    <Markdown v-model="activeFile" @save-file="saveFile"></Markdown>
    <el-dialog
      title="新建文件"
      v-model="createFileDialogShow"
    >
      <template #default>
        <div class="dialog-content">
          <span class="label">文件名</span>
          <el-input class="ml-4p" v-model="fileNameInput" placeholder="请输入内容"></el-input>
          <span class="label ml-2p"> .md </span>
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createFileDialogShow = false">取 消</el-button>
          <el-button type="primary" @click="createFileSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
   <el-dialog
       title="重命名文件"
       v-model="renameFileDialogShow"
   >
     <template #default>
       <div class="dialog-content">
         <span class="label">文件名</span>
         <el-input class="ml-4p" v-model="renameInput" placeholder="请输入内容"></el-input>
         <span class="label ml-2p"> .md </span>
       </div>
     </template>
     <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameFileDialogShow = false">取 消</el-button>
          <el-button type="primary" @click="renameFileSubmit">确 定</el-button>
        </span>
     </template>
   </el-dialog>
 </div>
</template>

<script>
import { Markdown } from './components/markdown.vue';
import { DocumentAdd,Folder } from '@element-plus/icons'
const { ipcRenderer,remote } = window.require('electron');
const { Menu, MenuItem } = remote
export default {
  name: 'App',

  data () {
    return {
      fileNameInput: '',
      renameInput: '',
      finderShow: true,
      activeFile: {
        name: '',
        path: '',
        data: '',
      },
      createFileDialogShow: false,
      renameFileDialogShow: false,
      fileCache: [],
      activePath: '',
      renameFileObj: null
    };
  },
  mounted () {
    this.setupIpc();
  },
  beforeUnmount() {
    for (let item of this.fileCache){
      // this.saveFile({},item)
    }
  },
  components: {
    Markdown: Markdown,
    DocumentAdd,
    [DocumentAdd.name]:DocumentAdd,
    Folder,
    [Folder.name]:Folder
  },
  methods: {
    setupIpc () {
      window.addEventListener('fileAction', (e) => {
        const event = e.detail;
        console.log('fileAction event',event)
        const fnList = {
          update: this.updateState,
          save: this.saveState,
          create: this.createFile
        };
        const fn = fnList[event.type];
        fn(event);
      });
      ipcRenderer.on('viewControl',(e,params) => {
        console.log(e,params)
        this.finderShow = !this.finderShow
      })
    },
    finderCreateClick(){
      ipcRenderer.send('createFile')
    },
    finderOpenClick(){
      ipcRenderer.send('openFile')
    },
    createFile(){
      this.createFileDialogShow = true
    },
    saveState(event,file=this.activeFile){
      console.log('app saveState',event)
      ipcRenderer.send('writeFile',{file:file})
    },
    updateState (event) {
      console.log(event);
      const cache = event.cache;
      const cacheList = [];
      const activePath = event.activePath ;
      for (const item of Object.keys(cache)) {
        cacheList.push(cache[item]);
      }
      cacheList.sort((a, b) => {
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
      console.log(cacheList);
      const active = cacheList.find(item => {
        return item.path === activePath;
      });
      console.log(active);
      this.fileCache = cacheList;
      this.activePath = activePath || (cacheList.length>0 ? cacheList[0].path : null);
      this.activeFile = active;
      this.$forceUpdate()
    },
    saveFile () {
      ipcRenderer.send('writeFile', { file: this.activeFile });
    },
    changeFileActive (file) {
      this.activePath = file.path;
      this.activeFile = file;
    },
    createMenu(file){
      // 右键菜单
      const menu = new Menu()
      menu.append(new MenuItem({
        label: '关闭',
        click: () =>  {
          const event = new CustomEvent('rendererSendEvent', {
            detail: {
              type: 'closeFile',
              data: {
                file
              }
            }
          });
          window.dispatchEvent(event)
        }
      }))
      menu.append(new MenuItem({
        label: '重命名',
        click: () => {
          this.renameFileDialogShow = true
          this.renameFileObj = file
        }
      }))

      menu.popup(remote.getCurrentWindow())
    },
    renameFileSubmit(){
      this.renameFileDialogShow = false
      let fileName = this.renameInput
      this.renameInput = ''
      ipcRenderer.send('renameFile',{
        file: this.renameFileObj,
        newName: fileName
      })
    },
    createFileSubmit(){
      this.createFileDialogShow = false
      let fileName = this.fileNameInput
      this.fileNameInput = ''
      ipcRenderer.send('writeFile',{
        file: {
          name: fileName,
          data: ''
        }
      })
    }
  }
};
</script>

<style scoped lang="scss">
  @import 'style';
  $finder: #d4cece;

  .g-markdown{
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .file-finder{
      width: 200px;
      height: 100%;
      border-right: 1px solid #343d50;
      background: #020d13;
      flex-shrink: 0;
      .file-toolbar{
        padding: 20px 10px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        border-bottom: 1px solid #0f1f32;
        background: #020d13;
        .folder-icon{
          height: 30px;
          width: 30px;
          color: $finder;
          cursor: pointer;
        }
      }
      .file-list{
        height: calc(100% - 81px);
        overflow-y: scroll;
        &::-webkit-scrollbar{
          display: none;
        }
        .file{
          color: $finder;
          padding: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
          position: relative;
          &[active=true] {
            &:before{
              content: '';
              height: 100%;
              width: 5px;
              background: #0F5BAE;
              position: absolute;
              left: 0;
              top: 0;
            }
            background: #232b32;
            color: #2081e3;
          }
        }
      }

      }
    .dialog-content{
      display: flex;
      align-items: center;
      .label{
        flex-shrink: 0;
      }

    }
  }
</style>
