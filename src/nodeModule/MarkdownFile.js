const { dialog, BrowserWindow, ipcMain } = require('electron');
const os = require('os');
const fs = require('fs');
let instance = null;
export class MarkdownFile {
  constructor (props = { workspace: '~' }) {
    if (instance) {
      return instance;
    } else {
      instance = this;
      this.workspace = props.workspace;
      this.cache = [];
    }
    ipcMain.on('openFile', this.open);
    ipcMain.on('createFile',this.create)
  }

  /**
   * 打开文件
   */
  open (e) {
    console.log('open ~/Documents');
    // shell.openItem(os.homedir()+'/Documents/result.txt')
    dialog.showOpenDialog({
      title: '选择文件',
      defaultPath: `${os.homedir()}/Documents`,
      filters: [
        { name: 'Markdown', extensions: ['md'] },
      ],
      buttonLabel: '选择文件'
    }, (res) => {
      if (!res) return
      fs.readFile(res[0], (err, data) => {
        console.log('open dialog')
        if (err) {
          console.log(err);
          ipcSend('fileAction', { type: 'update', status: 'error', ...err });
        }
        const path = res[0];
        const pathList = path.split('/');
        const fileName = pathList[pathList.length - 1];
        const file = {
          path: res[0],
          pathList: pathList,
          size: data.length,
          name: fileName,
          data: data.toString()
        };
        ipcSend('fileAction', { type: 'update', status: 'success', timestamp: new Date().getTime(), file });
      });
    });
  }

  /**
   * 快捷键触发保存
   */
  save () {
    console.log('快捷键触发');
    ipcSend('fileAction', { type: 'save' });
  }

  create(){
    ipcSend('fileAction',{
      type: 'create'
    })
  }
  renameFile(data){
    console.log(data,'markdownClass')
    let file = data.file
    let path = file.path.split('/')
    let oldName = path[path.length - 1]
    let newName = data.newName
    let pathWithoutName = path.slice(0,path.length - 1).join('/')
    let newPath = pathWithoutName+'/'+newName + '.md'
    console.log(newPath)
    fs.rename(file.path,newPath,(err) => {
      console.log(err)
      ipcSend('fileAction', { type: 'renameSuccess',status: 'success', file ,
      newFile:{
        name: newName,
        path: newPath
      }
      });
    })

  }
  writeFile (data) {
    console.log(data, 'markdown class');
    if (data.file&&data.file.path){
      this.writeExistFile(data.file)
    }else {
      this.writeNotExistFile(data)
    }
  }
  writeNotExistFile(data){
    dialog.showOpenDialog({
      title: '选择文件夹',
      defaultPath: `${os.homedir()}/Documents`,
      filters: [],
      properties: ['openDirectory'],
      buttonLabel: '选择文件'
    }, (res) => {
      if (!res) return
      console.log(res)
      let file = data.file
      let name = file.name ? file.name + '.md' : 'groove-markdown_' + new Date().getTime()+ '.md'
      file.path = res[0]+ '/' +name
      file.name = name
      this.writeExistFile(file)
    });
  }

  /**
   * 写入文件
   */
  writeExistFile(file){
    file.timestamp = new Date()
    fs.writeFile(file.path, file.data, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('成功写入', file.path);
      }
      ipcSend('fileAction', { type: 'writeFileSuccess',status: 'success',  file });
    });
  }
}

/**
 * 向渲染进程发送消息
 */
export function ipcSend (event, params) {
  BrowserWindow.getFocusedWindow().webContents.send(event, params);
}
