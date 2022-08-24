<template>
<div>
<el-row>
    <el-button @click="run" type="primary">开始分析</el-button>
</el-row>
<el-table
:data="tableData"
border
style="width: 100%">
<el-table-column
  prop="key"
  label="序号">
</el-table-column>
<el-table-column
  prop="value"
  label="三元组">
</el-table-column>
</el-table>
</div>
</template>

<script charset="utf-8">
  import Semantic from '../semantic/main.js'
  export default {
    created() {},
    data() {
      return {
        tableData: [],
      }
    },
    methods: {
      run() {
        if (!this.$store.state.par) {
          this.$notify({
            title: '警告',
            message: '请先完成语法分析',
            type: 'warning'
          })
          return
        }
        let p = this.$store.state.par
        let sem = new Semantic(p)
        let triple = sem.run()
        console.log(triple)
        for (let i = 0; i < triple.length; i++) {
          let item = {
            key: 'L' + i,
            value: triple[i]
          }
          this.tableData.push(item)
        }
        this.$notify({
          title: '成功',
          message: '语义分析完成',
          type: 'success'
        })
        this.$store.commit('setStep', 4)
      }
    }
  }
</script>

<style scoped>
</style>
