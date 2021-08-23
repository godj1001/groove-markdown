import { GrooveFile } from '@/class/GrooveFile';
import {getAll, saveAction, removeAction, renameAction} from './IndexDB'
const { ipcRenderer } = window.require('electron');
const fileActionEvent = {
  SAVE: 'save',
  OPEN: 'open',
  UPDATE: 'update',
  CREATE: 'create',
  WRITE_SUCCESS: 'writeFileSuccess',
  RENAME_SUCCESS: 'renameSuccess'
};
export class FileManager {
  static instance = null;
  constructor (props) {
    if (FileManager.instance) {
      return FileManager.instance;
    }
    FileManager.instance = this;
    this.cache = {};
    this.activePath = null;
    if (props){
      if (Array.isArray(props.cache)){
        for (let item of props.cache){
          this.cache[item.path] = item
        }
      }else {
        this.cache = props.cache
      }
      this.activePath = props.activePath
    }
    setTimeout(() => {
      this.sendUpdateEvent()
    },100)
    this.addListener();
  }

  /**
   * 添加监听文件事件
   */
  addListener () {
    ipcRenderer.on('fileAction', (e, params) => {
      console.log('[fileManager] fileAction', e, params, this);

      const fnList = {
        [fileActionEvent.UPDATE]: this.openFile.bind(this),
        [fileActionEvent.SAVE]: this.saveFile.bind(this),
        [fileActionEvent.WRITE_SUCCESS]: this.writeSuccess.bind(this),
        [fileActionEvent.RENAME_SUCCESS]:this.renameSuccess.bind(this),
        [fileActionEvent.CREATE]: this.createFile.bind(this)
      };
      const fn = fnList[params.type];
      fn(params);
    });
    window.addEventListener('rendererSendEvent',(e) => {
      const event = e.detail
      console.log(event)
      const {type,data} = event
      const fn = {
        ['closeFile']: this.removeCache.bind(this)
      }
      fn[type](data)
    })
  }
  createFile(){
    this.sendCreateEvent()
  }
  writeSuccess(event){
    let file =  new GrooveFile()
    file.update(event.file)
    this.addCache(file)
    this.activePath = file.path
    this.sendUpdateEvent()
  }
  renameSuccess(event){
    console.log('rename event',event)
    let oldFile = event.file
    let newFile = event.newFile
    if (this.activePath === oldFile.path){
      this.activePath = newFile.path
    }
    let file = this.cache[oldFile.path]
    this.cache[newFile.path] = {
      name: newFile.name,
      path: newFile.path,
      data: file.data,
      timestamp: new Date()
    }
    renameAction(oldFile,newFile)
    delete this.cache[oldFile.path]

    this.sendUpdateEvent()
  }
  saveFile () {
    /**
     * 判断是否创建的文件
     */
    const event = new CustomEvent('fileAction', {
      detail: {
        type: 'save'
      }
    });
    window.dispatchEvent(event);
  }

  openFile (params) {
    console.log('this 执行', this);
    if (params.status === 'error') {
      console.log(params);
      /**
       * todo 日志
       */
      return;
    }
    const path = params.file.path;
    console.log(this.cache);
    if (this.cache[path]) {
      this.cache[path].update(params.file);
    } else {
      const file = new GrooveFile();
      file.update(params.file);
      this.addCache(file);
    }
    this.activePath = path;
    this.sendUpdateEvent()
  }

  sendUpdateEvent(){
    const event = new CustomEvent('fileAction', {
      'detail': {
        type: 'update',
        cache: this.cache,
        activePath: this.activePath
      }
    });
    window.dispatchEvent(event);
  }

  sendCreateEvent(){
    const event = new CustomEvent('fileAction', {
      'detail': {
        type: 'create',
      }
    });
    window.dispatchEvent(event);
  }

  async addCache (file) {
    this.cache[file.path] = file;
    await saveAction(file)
    await getAll()
  }
  async removeCache(event){
    const {file} = event
    delete this.cache[file.path]
    await removeAction(file)
    this.sendUpdateEvent()
  }

  getActiveFile () {
    return this.cache[this.activePath];
  }
}
