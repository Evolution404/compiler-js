<template>
<div>
<el-select v-model="selected" placeholder="请选择">
    <el-option
      key="1"  
      label="构建分析表"
      value="1">
    </el-option>
    <el-option
      key="2"  
      label="进行语法分析"
      :disabled="!canPar"
      value="2">
    </el-option>
    <el-option
      key="3"  
      label="显示语法树"
      :disabled="!canTree"
      value="3">
    </el-option>
</el-select>
    <el-button @click="run" v-if="selected==1||selected==2" type="warning">执行</el-button>
    <el-table v-if="selected==1"
    :data="tableData"
    style="width: 100%">
        <el-table-column
          prop="state"
          align="center"
          label="状态"
          >
        </el-table-column>
        <el-table-column
          prop="state"
          align="center"
          label="action">
            <el-table-column align="center" v-for="t in T" :prop="t" :label="t"></el-table-column>
        </el-table-column>
        <el-table-column
          prop="state"
          align="center"
          label="goto">
            <el-table-column align="center" v-for="t in V" :prop="t" :label="t"></el-table-column>
        </el-table-column>
    </el-table>
  <div v-else-if="selected==2">
      <el-table
        :data="tableData2"
        border
        style="width: 100%">
        <el-table-column
          prop="state"
          align="center"
          label="状态栈">
        </el-table-column>
        <el-table-column
          prop="symbol"
          align="center"
          label="符号栈">
        </el-table-column>
        <el-table-column
          prop="msg"
          align="center"
          label="语法分析执行步骤">
        </el-table-column>
      </el-table>
  </div>

  <TreeChart :data="tree" v-else></TreeChart>
    
</div>
</template>

<script charset="utf-8">
    import Parser from '../parsing/main.js'
    import TreeChart from './util/treeChart.vue'

    export default {
        created() {
            if (this.$store.state.par) {
                let p = this.$store.state.par
                this.parser = p
                this.tableData = p.table
                this.T = p.T
                this.V = p.V
                this.selected = '2'
                this.tree = p.tree
                this.canPar = true
            }
        },
        components: {
            TreeChart,
        },
        data() {
            return {
                selected: '1',
                T: ['终结符未分析'],
                V: ['非终结符未分析'],
                tableData: [],
                parser: '',
                tableData2: [],
                tree: [],
                canPar:false,
                canTree: false,
            }
        },
        methods: {
            run() {
                if(this.$store.state.lex.length==0){
                    this.$notify({
                        title: '警告',
                        message: '请先完成词法分析',
                        type: 'warning'
                    })
                    return
                }
                if (this.selected == '1') {
                    let p = new Parser(this.$store.state.lex)
                    p.init()
                    this.tableData = p.table
                    this.T = p.T
                    this.V = p.V
                    this.$store.commit('setPar', p)
                    this.parser = p
                    this.canPar = true
                } else if (this.selected == '2') {
                    this.parser.lex = this.$store.state.lex
                    let rs = this.parser.run()
                    if(!rs){
                        this.$notify({
                            title: '错误',
                            message: this.parser.err,
                            type: 'error'
                        })
                        return
                    }
                    this.tree = this.parser.tree
                    console.log(this.tree)
                    this.tableData2 = this.parser.msg
                    this.$notify({
                        title: '成功',
                        message: '语法分析完成',
                        type: 'success'
                    })
                    this.$store.commit('setStep', 3)
                    this.canTree = true
                }
            }
        }
    }
</script>

<style scoped>
</style>
