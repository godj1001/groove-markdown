
export class GrooveFile{
  constructor() {
    this.timestamp = new Date()
  }

  update(newVal){
    let attrs = Object.keys(newVal)
    for (let item of attrs){
      this[item] = newVal[item]
    }
    this.timestamp = new Date()
  //  todo update file and db
  }

}



