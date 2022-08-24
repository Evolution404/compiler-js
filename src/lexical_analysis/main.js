const token = require('./token.js')

class TextLex {
    constructor(text) {
        // 保存程序代码
        if (text[text.length - 1] !== '\n')
            text += '\n'
        text = text.replace(/\/\/[^\n]*/g, '')
        text = text.replace(/\/\*([^\*^\/]*|[\*^\/*]*|[^\**\/]*)*\*\//g, '')
        this.text = text
        this.result = []
        this.err = []
        this.current = token.SS
        this.key = ['if', 'else', 'do', 'while', 'int', 'float', 'double', 'long', 'char', 'bool', 'return', 'for', 'while', 'public', 'void', 'private', 'protected'];
    }
    // 启动词法分析
    run() {
        let wordStart = 0
        for (let i = 0; i < this.text.length; i++) {
            let r = this.transform(this.text[i])
            if (r == 'run') {
                continue
            } else if (r == 'err') {
                let rs = this.text.substring(wordStart, i)
                this.err.push(rs)
            } else {
                let rs = this.text.substring(wordStart, i)
                if (this.key.indexOf(rs) >= 0)
                    r = rs
                this.result.push([r, rs])
                wordStart = i
                i--
                this.current = token.SS
            }
        }
        // 过滤掉空格和回车
        this.result = this.result.filter(item => item[0] !== 'ENTER' && item[0] !== 'SPACE')
    }
    transform(c) {
        let iIndex = this.getIindex(c)
        if (iIndex != -1 && token.T[this.current] && token.T[this.current][iIndex]) {
            this.current = token.T[this.current][iIndex]
            return 'run'
        } else {
            if (token.FS.indexOf(this.current) >= 0) {
                return token.S[this.current]
            } else {
                return 'err'
            }
        }

    }
    // 输入单个字符, 根据这个字符找到token表I项中这个字符所在的数组编号
    getIindex(c) {
        for (let i = 0; i < token.I.length; i++) {
            if (token.I[i].indexOf(c) >= 0) {
                return i
            }
        }
        return -1
    }
}

export default TextLex
