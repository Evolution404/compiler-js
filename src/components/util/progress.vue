<template>
<div>
<el-steps :active=parseInt(this.step) finish-status="success" simple style="">
  <el-step title="保存代码"></el-step>
  <el-step title="词法分析"></el-step>
  <el-step title="语法分析"></el-step>
  <el-step title="语义分析"></el-step>
</el-steps>
</div>
</template>

<script charset="utf-8">

export default {
    props:["step"],
}
</script>

<style scoped>
*{
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
}
</style>
