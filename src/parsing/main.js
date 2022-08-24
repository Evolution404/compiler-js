import grammar from './grammar.js'

// 为Array类添加工具方法
Array.prototype.equal = function(item) {
  return JSON.stringify(this) === JSON.stringify(item)
}

Array.prototype.isExist = function(item) {
  for (let i = 0; i < this.length; i++) {
    if (typeof this[i] === 'object') {
      if (this[i].equal(item)) {
        return true
      }
    } else {
      if (this[i] === item) {
        return true
      }
    }
  }
  return false
}

Array.prototype.complexIndexOf = function(item) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].equal(item)) {
      return i
    }
  }
  return -1
}

Array.prototype.merge = function(item) {
  for (let i = 0; i < item.length; i++) {
    if (!this.isExist(item[i])) {
      this.push(item[i])
    }
  }
}


class Parser {
  constructor(lex) {
    this.lex = lex
    this.V = [] //非终结符
    this.T = [] //终结符
    this.msg = []
    this.table = []
    this.tree = {}
    this.err = ''
  }
  init() {
    this.loadGrammar()
    this.initEmpty()
    this.initFirst()
    this.initFollow()
    this.table = this.analysisTable()
  }

  run() {
    let lex = []
    this.msg = []
    for (let i = 0; i < this.lex.length; i++) {
      lex.push([this.lex[i]['key'], this.lex[i]['value']])
    }
    let stateStack = [0]
    let symbolStack = []
    let tree = []
    let nn = 0
    while (nn < 1000) {
      lex.push(['#', '结束符'])
      let curState = stateStack[stateStack.length - 1]
      let curSymbol = lex[0][0]
      let operation = this.table[curState][curSymbol]
      if (!operation) {
        this.err = '发现错误,在' + symbolStack[symbolStack.length - 1] + ' ' + lex[0][1] + ' ' + lex[1][1] + '附近'
        return false
      }
      if (operation === 'acc') {
        this.msg.push({
          msg: '分析成功',
          state: JSON.stringify(stateStack),
          symbol: JSON.stringify(symbolStack),
        })
        this.tree = tree
        console.log('分析成功')
        return true
      }
      if (operation[0] === 's') {
        let stateNum = Number(operation.split('s')[1])
        this.msg.push({
          msg: '转入状态' + stateNum,
          state: JSON.stringify(stateStack),
          symbol: JSON.stringify(symbolStack),
        })
        stateStack.push(stateNum)
        symbolStack.push(curSymbol)
        let value=lex.shift()[1]
        tree.push({
          name: curSymbol,
          value
        })
      } else if (operation[0] === 'r') {
        let grammarNum = Number(operation.split('r')[1])
        this.msg.push({
          msg: '使用产生式' + grammarNum + '进行规约',
          state: JSON.stringify(stateStack),
          symbol: JSON.stringify(symbolStack),
        })
        let [left, right] = this.grammarList[grammarNum]
        let children = [{
          name: '@'
        }]
        if (right[0] !== '@') {
          symbolStack.splice(symbolStack.length - right.length, right.length)
          stateStack.splice(stateStack.length - right.length, right.length)
          children = tree.splice(tree.length - right.length, right.length)
          tree.push({
            name: left,
            children: children
          })
        } else tree.push({
          name: left,
          children,
        })
        symbolStack.push(left)
        curState = stateStack[stateStack.length - 1]
        stateStack.push(this.table[curState][left])
      }
      nn++
    }
  }

  loadGrammar() {
    this.grammar = {}
    this.grammarList = []
    this.start = grammar[0].split('->')[0]
    grammar.forEach(item => {
      let [left, right] = item.split('->')
      right = right.split('|')
      right.forEach((item, index) => {
        right[index] = item.split(' ')
        this.grammarList.push([left, item.split(' ')])
        if (this.V.indexOf(left) === -1) {
          this.V.push(left)
        }
        item.split(' ').forEach(item => {
          if (item[0] === '<' && item[item.length - 1] === '>') {
            return
          }
          if (this.T.indexOf(item) === -1)
            this.T.push(item)
        })
      })
      this.grammar[left] = right
    })
    this.V.splice(this.V.indexOf(this.start), 1)
    if (this.T.indexOf('@') > -1)
      this.T.splice(this.T.indexOf('@'), 1)
    this.T.push('#')
  }

  // item: 项目
  // left: 项目的左部,right:项目的右部,index:当前状态的位置
  closure(item) {
    let rs = [item]
    while (true) {
      let len = rs.length
      for (let i = 0; i < len; i++) {
        let [left, right, index] = rs[i]
        if (this.grammar[right[index]]) {
          let newLeft = right[index]
          let newItemRightList = this.grammar[right[index]]
          for (let j = 0; j < newItemRightList.length; j++) {
            let newRight = newItemRightList[j]
            let newItem = [newLeft, newRight, 0]
            if (!rs.isExist(newItem)) {
              rs.push(newItem)
            }
          }
        }
      }
      if (len === rs.length) {
        return rs
      }
    }
  }

  // 项目集遇到一个符号后转向的项目集
  go(itemCollection, X) {
    // 传入X为undefined时直接返回false
    if (!X) return false
    let trs = [] //未去重结果
    let rs = [] //最终结果
    for (let i = 0; i < itemCollection.length; i++) {
      let item = itemCollection[i]
      let [left, right, index] = item
      if (right[index] === X) {
        let newItem = [left, right, index + 1]
        trs = trs.concat(this.closure(newItem))
      }
    }
    trs.forEach(item => {
      if (!rs.isExist(item))
        rs.push(item)
    })

    return rs
  }

  //计算规范项目集闭包
  canonicalCollection() {
    let rs = []
    let table = []
    // 从增广文法开始符号进行计算
    rs.push(this.closure([this.start, this.grammar[this.start][0], 0]))
    while (true) {
      let len = rs.length
      for (let i = 0; i < len; i++) {
        let itemCollection = rs[i]
        for (let j = 0; j < itemCollection.length; j++) {
          let item = itemCollection[j]
          let [left, right, index] = item
          if (right[0] === '@') continue
          let newCollection = this.go(itemCollection, right[index])
          if (newCollection && !rs.isExist(newCollection)) {
            rs.push(newCollection)
          }
        }
      }

      if (len === rs.length) {
        return rs
      }
    }
  }

  analysisTable() {
    // 所有状态的集合
    let canCollection = this.canonicalCollection()
    let table = new Array(canCollection.length)
    for (let i = 0; i < table.length; i++) {
      table[i] = {}
      this.V.forEach(item => table[i][item] = '')
      this.T.forEach(item => table[i][item] = '')
    }

    for (let i = 0; i < canCollection.length; i++) {
      let state = canCollection[i]
      // 如果当前状态是规约状态
      if (this.stateType(state) === 'reduce') {
        let left = state[0][0]
        this.follow[left].forEach(k => {
          let item = state[0]
          let itemIndex = this.grammarList.complexIndexOf([item[0], item[1]])
          itemIndex === 0 ? table[i]['#'] = 'acc' : table[i][k] = 'r' + itemIndex

        })
      } else if (this.stateType(state) === 'shift') {
        for (let j = 0; j < state.length; j++) {
          let item = state[j]
          let [left, right, index] = item
          let nextSymbol = right[index]
          let nextState = this.go(state, nextSymbol)
          if (nextState) {
            // 下一个符号是非终结符
            let stateIndex = canCollection.complexIndexOf(nextState)
            if (nextSymbol[0] === '<' && nextSymbol[nextSymbol.length - 1] === '>') {
              table[i][nextSymbol] = stateIndex
            } else {
              //是终结符
              table[i][nextSymbol] = 's' + stateIndex
            }
          }
        }
      } else {
        // 发生了冲突
        let followList = {} // 所有规约项目的follow集的集合
        let symbolList = [] // 所有移进项目的下一个符号集合
        for (let j = 0; j < state.length; j++) {
          let item = state[j]
          if (item[2] === item[1].length || item[1][0] === '@') {
            // 规约项目
            if (!followList[item[0]])
              followList[item[0]] = {
                data: this.follow[item[0]],
                id: this.grammarList.complexIndexOf([item[0], item[1]])
              }

          } else {
            // 移进项目
            let nextSymbol = item[1][item[2]]
            if (symbolList.indexOf(nextSymbol) === -1) {
              symbolList.push(nextSymbol)
            }
          }
        }
        for (let key in followList) {
          followList[key]['data'].forEach(symbol => {
            let itemIndex = followList[key]['id']
            itemIndex === 0 ? table[i]['#'] = 'acc' : table[i][symbol] = 'r' + itemIndex
          })
        }
        symbolList.forEach(symbol => {
          let nextState = this.go(state, symbol)
          let stateIndex = canCollection.complexIndexOf(nextState)
          if (this.V.indexOf(symbol) > -1) {
            table[i][symbol] = stateIndex
            return
          }
          table[i][symbol] = 's' + stateIndex
        })
      }

    }
    for (let i = 0; i < table.length; i++) {
      table[i]['state'] = i
    }
    return table
  }

  // 返回一个状态的类型 规约状态:reduce, 移进状态: shift 冲突:conflict
  stateType(collection) {
    let reduceNum = 0
    let shiftNum = 0
    for (let i = 0; i < collection.length; i++) {
      let item = collection[i]
      if (item[1][0] === '@')
        reduceNum++
        else
          item[2] === item[1].length ? reduceNum++ : shiftNum++
    }
    let len = collection.length
    if (len === shiftNum)
      return 'shift'
    else if (len === reduceNum && len === 1)
      return 'reduce'
    else
      return 'conflict'
  }

  initFirst() {
    let rs = {}
    rs[this.start] = []

    for (let i = 0; i < this.V.length; i++) {
      let v = this.V[i]
      rs[v] = []
    }
    while (true) {
      let strRs = JSON.stringify(rs)
      for (let i = 0; i < this.grammarList.length; i++) {
        let [left, right] = this.grammarList[i]
        let index = 0
        while (index < right.length) {
          if (this.T.indexOf(right[index]) > -1 || right[index] === '@') {
            rs[left].merge([right[index]])
            break
          } else {
            if (this.canBeEmpty[right[index]]) {
              rs[left].merge(rs[right[index]])
              index++
            } else {
              rs[left].merge(rs[right[index]])
              break
            }
          }
        }
      }
      if (strRs === JSON.stringify(rs)) {
        this.first = rs
        return
      }
    }
  }

  initFollow() {
    let rs = {}
    for (let i = 0; i < this.V.length; i++) {
      rs[this.V[i]] = []
    }
    rs[this.start] = ['#']
    while (true) {
      let str = JSON.stringify(rs)
      for (let i = 0; i < this.grammarList.length; i++) {
        let [left, right] = this.grammarList[i]
        for (let j = 0; j < right.length - 1; j++) {
          if (this.T.indexOf(right[j]) > -1 || right[j] === '@') continue
          let index = j + 1
          while (true) {
            // 遍历到文法的最后一项 使用左侧的follow集
            if (index === right.length) {
              rs[right[j]].merge(rs[left])
              break
              // 遇到的下一个符号是终结符,直接加入follow集
            } else if (this.T.indexOf(right[index]) > -1) {
              rs[right[j]].merge([right[index]])
              break
              // 遇到的下一个非终结符可以推出空
            } else if (this.canBeEmpty[right[index]]) {
              let mergeArr = []
              this.first[right[index]].forEach(item => {
                item === '@' ? null : mergeArr.push(item)
              })
              rs[right[j]].merge(mergeArr)
              index++
              // 不能为空的非终结符
            } else {
              let mergeArr = []
              this.first[right[index]].forEach(item => {
                item === '@' ? null : mergeArr.push(item)
              })
              rs[right[j]].merge(mergeArr)
              break
            }
          }
        }
        let last = right[right.length - 1]
        if (this.T.indexOf(last) > -1 || last === '@') continue
        rs[last].merge(rs[left])
      }

      if (str === JSON.stringify(rs)) {
        break
      }
    }
    this.follow = rs
  }

  initEmpty() {
    this.canBeEmpty = {}
    for (let i = 0; i < this.V.length; i++) {
      this.canBeEmpty[this.V[i]] = false
    }
    while (true) {
      let str = JSON.stringify(this.canBeEmpty)
      for (let i = 0; i < this.grammarList.length; i++) {
        let [left, right] = this.grammarList[i]
        if (right[0] === '@') {
          this.canBeEmpty[left] = true
        } else {
          let flag = true
          right.forEach(item => {
            if (this.T.indexOf(item) > -1)
              flag = false
            else {
              this.canBeEmpty[item] ? null : flag = false
            }
          })
          if (flag) {
            this.canBeEmpty[left] = true
          }
        }
      }
      if (str === JSON.stringify(this.canBeEmpty)) {
        return
      }
    }
  }
}

export default Parser
