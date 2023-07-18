<template>
  <NavLeft>
    <div slot="menuItem">
      <el-menu-item index="/teprunner/workspace">
        <i class="el-icon-s-home"></i>
        <span slot="title">工作台</span>
      </el-menu-item>
      <el-menu-item index="/teprunner/gitSync">
        <i class="el-icon-attract"></i>
        <span slot="title">Git同步</span>
      </el-menu-item>
<!--      <el-menu-item index="/teprunner/case">-->
<!--        <i class="el-icon-s-management"></i>-->
<!--        <span slot="title">用例管理</span>-->
<!--      </el-menu-item>-->
      <el-menu-item index="/teprunner/task">
        <i class="el-icon-alarm-clock"></i>
        <span slot="title">任务管理</span>
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
