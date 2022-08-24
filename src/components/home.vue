<template>
<div>
    <el-input
      type="textarea"
      :rows="10"
      placeholder="请输入内容"
      v-model="textarea">
    </el-input>
    <el-row>
        <el-col :span=2 :offset=20>
            <el-tooltip class="item" effect="dark" content="保存代码" placement="left">
                <el-button @click=run class="success" type="success" icon="el-icon-check" circle></el-button>
            </el-tooltip>
        </el-col>
    </el-row>
</div>
</template>

<script charset="utf-8">
    export default {
      data() {
        return {
          textarea: ''
        }
      },
      created(){
        this.textarea = this.$store.state.text
      },
      methods: {
        run(){
            this.$store.commit('change', this.textarea)
            this.$notify({
              title: '成功',
              message: '程序代码已保存',
              type: 'success'
            })
            this.$store.commit('setStep',1)
            this.$store.commit('reset')
        }
      }
    }
</script>

<style scoped>
.success{
    margin-top: 10px;
}
</style>
