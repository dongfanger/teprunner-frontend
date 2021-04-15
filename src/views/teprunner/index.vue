<template>
  <NavLeft>
    <div slot="menuItem">
      <el-menu-item index="/teprunner/grammar">
        <i class="el-icon-s-opportunity"></i>
        <span slot="title">语法说明</span>
      </el-menu-item>
      <el-menu-item index="/teprunner/envVar">
        <i class="el-icon-coin"></i>
        <span slot="title">环境变量</span>
      </el-menu-item>
      <el-menu-item index="/teprunner/fixture">
        <i class="el-icon-magic-stick"></i>
        <span slot="title">fixtures</span>
      </el-menu-item>
      <el-menu-item index="/teprunner/case">
        <i class="el-icon-edit-outline"></i>
        <span slot="title">用例管理</span>
      </el-menu-item>
      <el-menu-item index="/teprunner/plan">
        <i class="el-icon-alarm-clock"></i>
        <span slot="title">测试计划</span>
      </el-menu-item>
    </div>
  </NavLeft>
</template>
<script>
import NavLeft from "@/components/NavLeft";

export default {
  components: {
    NavLeft,
  },
  mounted() {
    this.saveProjectEnv();
  },
  methods: {
    saveProjectEnv() {
      let localProjectEnvList = JSON.parse(localStorage.getItem("projectEnvList"));
      if (!localProjectEnvList) {
        this.$http
          .get("/teprunner/projects/env")
          .then(({ data: { projectEnvList, curProjectEnv } }) => {
            if (projectEnvList) {
              this.projectEnvList = projectEnvList;
              localStorage.setItem("projectEnvList", JSON.stringify(projectEnvList));
              let localCurProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
              if (!localCurProjectEnv) {
                this.curProjectId = curProjectEnv.curProjectId;
                this.curProjectName = curProjectEnv.curProjectName;
                this.curEnvName = curProjectEnv.curEnvName;
                localStorage.setItem("curProjectEnv", JSON.stringify(curProjectEnv));
              }
            }
          })
          .finally(() => {});
      }
    },
  },
};
</script>
