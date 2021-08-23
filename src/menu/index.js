import { Menu } from 'electron';
import { MarkdownFile } from '@/nodeModule/MarkdownFile';
import {toggleFinder} from '@/nodeModule/Controler'

const markdownFile = new MarkdownFile();
const isMac = process.platform === 'darwin';
export const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        click: function () {
          markdownFile.create()
        }
      },
      {
        label: '打开',
        click: function (type) {
          // 主进程通知渲染进程操作文件
          markdownFile.open();
        }
      },
      {
        label: '保存',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: function () {
          markdownFile.save();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '打印',
        click: function () {

        }
      },
      {
        label: '退出',
        click: function () {

        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'tab'},
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
        : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      {
        label: 'toggleFinder',
        accelerator: process.platform === 'darwin' ? 'Cmd+T' : 'Ctrl+T',
        click: function () {
          toggleFinder()
        }
      },

    ]
  }
];

const m = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(m);
