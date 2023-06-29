<template>
  <el-form :inline="true">
    <el-form-item label="" v-if="showProject">
      <el-select v-model="curProjectName" @change="changeProject" @click.native="getProjectList">
        <el-option v-for="(item, index) in projectList" :key="index" :label="item" :value="item"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="" v-if="showEnv">
      <el-select v-model="curEnvName" @change="changeEnv" @click.native="getEnvList">
        <el-option v-for="(item, index) in envList" :key="index" :label="item" :value="item"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "ProjectEnv",
  props: {
    showEnv: {
      type: Boolean,
      default: true,
    },
    showProject: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      projectEnvList: [],
      projectList: [],
      envList: [],
      curProjectId: "",
      curProjectName: "",
      curEnvName: "",
    };
  },
  created() {
    this.getProjectEnv();
    this.getCurProjectEnv();
  },
  methods: {
    getProjectEnv() {
      let localProjectEnvList = JSON.parse(localStorage.getItem("projectEnvList"));
      if (localProjectEnvList) {
        this.projectEnvList = localProjectEnvList;
      }
    },
    getCurProjectEnv() {
      let localCurProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      if (localCurProjectEnv) {
        this.curProjectId = localCurProjectEnv.curProjectId;
        this.curProjectName = localCurProjectEnv.curProjectName;
        this.curEnvName = localCurProjectEnv.curEnvName;
      }
    },
    getProjectList() {
      let projectList = [];
      this.projectEnvList.forEach(item => {
        projectList.push(item.projectName);
      });
      this.projectList = projectList;
    },
    getEnvList() {
      this.projectEnvList.forEach(item => {
        if (item.projectId === this.curProjectId) {
          this.envList = item.envList;
        }
      });
    },
    changeProject() {
      let curProjectEnv = {};
      this.projectEnvList.forEach(item => {
        if (item.projectName === this.curProjectName) {
          this.curProjectId = item.projectId;
        }
      });
      curProjectEnv["curProjectId"] = this.curProjectId;
      curProjectEnv["curProjectName"] = this.curProjectName;
      this.getEnvList();
      this.curEnvName = this.envList[0];
      curProjectEnv["curEnvName"] = this.curEnvName;
      localStorage.setItem("curProjectEnv", JSON.stringify(curProjectEnv));
      this.$emit("changeProject");
    },
    changeEnv() {
      let curProjectEnv = {};
      curProjectEnv["curProjectId"] = this.curProjectId;
      curProjectEnv["curProjectName"] = this.curProjectName;
      curProjectEnv["curEnvName"] = this.curEnvName;
      localStorage.setItem("curProjectEnv", JSON.stringify(curProjectEnv));
      this.$emit("changeEnv");
    },
  },
};
</script>

<style scoped></style>
