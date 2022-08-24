<template>
<div>
    <el-button @click="run" type="warning">开始分析</el-button>
    <el-table
    :data="tableData"
    border
    style="width: 100%">
    <el-table-column
      prop="key"
      label="词法类型">
    </el-table-column>
    <el-table-column
      prop="value"
      label="词法值">
    </el-table-column>
  </el-table>

</div>
</template>

<script charset="utf-8">
    
import TextLex from '../lexical_analysis/main.js'
    export default {
        created(){
            if(this.$store.state.lex.length>0){
                this.tableData = this.$store.state.lex
            }
        },
        data() {
          return {
            tableData: []
          }
        },
        methods:{
            run(){
                this.tableData = []
                if(this.$store.state.text.length>0){
                    let t = new TextLex(this.$store.state.text)
                    t.run()
                    t.result.forEach(val=>{
                        this.tableData.push(
                            {key:val[0],
                            value:val[1] })
                    })
                    this.$store.commit('changeLex', this.tableData)
                    if(t.err.length>0){
                        t.err.forEach(val=>{
                            this.$notify({
                              title: '错误',
                              message: '发现错误,位置在:"'+val+'"',
                              type: 'error'
                            });
                        })
                        return
                    }
                }
                 else{
                    this.$notify({
                      title: '警告',
                      message: '请先保存程序代码再进行分析',
                      type: 'warning'
                    });
                    return
                }
                this.$notify({
                  title: '成功',
                  message: '词法分析完成',
                  type: 'success'
                })
                this.$store.commit('setStep', 2)
            }
        } 
    }
</script>

<style scoped>
</style>
