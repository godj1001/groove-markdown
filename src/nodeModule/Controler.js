import {ipcSend} from '@/nodeModule/MarkdownFile'

export function showFinder (){
  ipcSend('viewControl', { type: 'toggleFinder' });
}
export function toggleFinder(){
  ipcSend('viewControl', { type: 'toggleFinder' });
}
