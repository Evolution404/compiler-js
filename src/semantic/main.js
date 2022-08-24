class Semantic {
  constructor(parser) {
    this.parser = parser
    this.tree = parser.tree[0]
    this.triple = [] //三元组,存储最终结果
  }

  run() {
    this.visitTree(this.tree)
    return this.triple
  }
  visitTree(tree) {
    if (!tree)
      return
    if (tree.name === "<函数块>") {
      this.handleBlock(tree)
    }
    if (!tree.children)
      return
    for (let i = 0; i < tree.children.length; i++) {
      this.visitTree(tree.children[i])
    }
  }
  handleBlock(tree) {
    if (tree.children.length === 1)
      return
    let multi = tree.children[0]
    if (multi.name === "<声明语句闭包>")
      this.handleStatement(multi)
    else if (multi.name === "<赋值函数>")
      this.handleAssignment(multi)
    else if (multi.name === "<条件语句>")
      this.handleIf(multi)
    else if (multi.name === "<for循环>")
      this.handleFor(multi)
    else if (multi.name === "<while循环>")
      this.handleWhile(multi)
    this.handleBlock(tree.children[1])
  }
  handleAssignment(tree) {
    let left = tree.children[0].children[0].children[0].value
    let right = tree.children[1].children[1].children[0]
    this.triple.push(left + ":=" + this.handleExpression(right))
  }
  handleStatement(tree) {
    if (tree.children.length === 1) return
    let closure = tree.children[1]
    tree = tree.children[0].children[0] //<声明>
    let type = tree.children[1].children[0].value //类型  int float等
    let variable = tree.children[2].children[0].children[0].value
    let right = tree.children[3].children[1].children[0].children[0].children[0].children[0].children[0].value
    this.triple.push(variable + ':=' + right)
    this.handleStatement(closure)
  }
  handleIf(tree) {
    let logic = tree.children[2]
    let flag = this.triple.length
    this.triple.push(this.handleLogic(logic))
    this.handleBlock(tree.children[5])
    this.triple[flag] = this.triple[flag] + this.triple.length
  }
  handleFor(tree) {
    this.handleAssignment(tree.children[2])
    let flag = this.triple.length
    let logic = tree.children[3]
    this.triple.push(this.handleLogic(logic))
    this.handleBlock(tree.children[8])
    this.handleSuffixExpression(tree.children[5])
    this.triple.push('goto L' + flag)
    this.triple[flag] = this.triple[flag] + this.triple.length
  }
  handleWhile(tree) {
    let flag = this.triple.length
    let logic = tree.children[2]
    this.triple.push(this.handleLogic(logic))
    this.handleBlock(tree.children[5])
    this.triple.push('goto L' + flag)
    this.triple[flag] = this.triple[flag] + this.triple.length
  }
  handleLogic(tree) {
    let logic = tree
    let left = logic.children[0].children[0].children[0].children[0].children[0].children[0].value
    let logicSymbol = logic.children[1].children[0].value
    let right = logic.children[2].children[0].children[0].children[0].children[0].value
    return 'iffalse ' + left + logicSymbol + right + ' goto L'
  }
  handleExpression(tree) {
    if (tree.name === '@')
      return ''
    if (!tree.children)
      return tree.value
    let rs = ''
    for (let i = 0; i < tree.children.length; i++) {
      rs = rs + this.handleExpression(tree.children[i])
    }
    return rs
  }
  handleSuffixExpression(tree) {
    let left = tree.children[0].children[0].children[0].value
    let suffix = tree.children[1].children[0].value
    if (suffix === '++')
      this.triple.push(left + ':=' + left + '+1')
    else if (suffix === '--')
      this.triple.push(left + ':=' + left + '-1')
  }
}
export default Semantic
