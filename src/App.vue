<template>
<div>
    <el-row class="title">
        <el-col :span=3>
            <el-tooltip class="switch" :content="isCollapse=='true'?'扩展侧边栏':'缩小侧边栏'" placement="top">
              <el-switch
                v-model="isCollapse"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-value=false
                inactive-value=true>
              </el-switch>
            </el-tooltip>
        </el-col>
        <el-col :span=21>
            <titleProgress :step="$store.state.step"></titleProgress>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="isCollapse=='true'?3:6">
            <el-menu :default-active="$route.path" router class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse=='true'">
            <el-menu-item index="/home">
                <i class="el-icon-location"></i>
                <span slot="title">主界面</span>
            </el-menu-item>
            <el-menu-item index="/lex">
                <i class="el-icon-menu"></i>
                <span slot="title">词法分析</span>
            </el-menu-item>
            <el-menu-item index="/parsing">
                <i class="el-icon-document"></i>
                <span slot="title">语法分析</span>
            </el-menu-item>
            <el-menu-item index="/semantic">
                <i class="el-icon-setting"></i>
                <span slot="title">语义分析</span>
            </el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="isCollapse=='true'?21:18">
            <router-view></router-view>
        </el-col>
    </el-row>

</div>
</template>

<style>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 180px;
    min-height: 500px;
  }
  .el-menu-vertical-demo.el-menu--collapse {
    min-height: 400px;
  }
  .title{
      margin-bottom:20px;
  }
  .switch{
      margin: 10px;
  }
</style>

<script>
import titleProgress from './components/util/progress.vue'
  export default {
    data() {
      return {
        isCollapse: true,
        text: ''
      };
    },
    components:{
        titleProgress
    },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
    }
  }
</script>
