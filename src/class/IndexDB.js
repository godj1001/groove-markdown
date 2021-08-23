import  {Dexie} from 'dexie'
let db = null
export const init = async () => {
  db = new Dexie('markdown')
  db.version(1).stores({
    files: '++id,name,&path,timestamp'
  })
  db.open()
  console.log(db)
}

/**
 * 保存动作 区分是否存在
 */
export const saveAction = async (file) => {
  let sqlRes = await db.files.where('path').equals(file.path).toArray()
  console.log(sqlRes)
  if (sqlRes.length > 0){
    update(file)
  }else {
    add(file)
  }
}
export const removeAction = async (file) => {
  console.log('db removeAction',file.path)
  let sqlRes = await db.files.where('path').equals(file.path).delete()
  console.log(sqlRes)
}

export const renameAction = async (file, newFile) => {
  await db.files.where('path').equals(file.path).modify(newFile)
}
/**
 * 添加数据
 */
export const add = async (file) => {
  await db.files.add(file)
}

/**
 * 更新path
 */
export const update = async (file) => {
  await db.files.where('path').equals(file.path).modify(file)
}
/**
 * 查询全部
 */
export const getAll = async () => {
  let data =  await db.files.toArray()
  data.sort((a,b) => {
    return b.timestamp.getTime() - a.timestamp.getTime()
  }).slice(0,10)
  console.log(data)
  return data
}
