<template>
  <div>
    <project-env style="float: left; margin-right: 10px" v-if="$route.name === 'plan'"
      @changeProject="changeProject"></project-env>
    <project-env style="float: left; margin-right: 10px" v-if="$route.name === 'addPlan'" @changeProject="changeProject"
      :showEnv="false"></project-env>
    <project-env style="float: left; margin-right: 10px" v-if="$route.name === 'editPlan'" @changeProject="changeProject"
      :showEnv="false" :project-disabled="true"></project-env>
    <div class="plan-manage-index" v-if="$route.name === 'plan'">
      <div style="float: left" class="control-list">
        <el-button type="primary" icon="el-icon-plus" @click="addPlan">
          新增计划
        </el-button>
      </div>
      <div style="clear: both" class="content-info" :loading="tableLoading">
        <div class="content-header">
          <div class="info-name">
            全部计划
          </div>
        </div>

        <el-form size="medium" :inline="true" :model="searchForm" class="search-form" ref="searchForm">
          <el-form-item label="计划名称">
            <el-input v-model="searchForm.name" placeholder="模糊匹配" style="width: 400px"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" @click="search" type="primary">搜索</el-button>
            <el-button icon="el-icon-refresh-left" @click="resetSearchForm">重置</el-button>
          </el-form-item>
        </el-form>

        <div class="content-table">
          <el-table :header-cell-style="{
            background: 'rgba(144, 147, 153, 0.06)',
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: '14px',
          }" :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="计划ID" width="80px" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column label="计划名称" prop="name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="caseNum" label="用例" width="50px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div :style="numStyle('case', scope.row.caseNum)" @click="gotoPlanResult(scope.row, 'case')">
                  {{ scope.row.caseNum }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="failedPassed" label="成功" width="50px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div :style="numStyle('passed', scope.row.passedNum)" @click="gotoPlanResult(scope.row, 'passed')">
                  {{ scope.row.passedNum }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="failedPassed" label="失败" width="50px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div :style="numStyle('failed', scope.row.failedNum)" @click="gotoPlanResult(scope.row, 'failed')">
                  {{ scope.row.failedNum }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="failedPassed" label="错误" width="50px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div :style="numStyle('error', scope.row.errorNum)" @click="gotoPlanResult(scope.row, 'error')">
                  {{ scope.row.errorNum }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="elapsed" label="耗时" width="60px " align="center"
              show-overflow-tooltip></el-table-column>
            <el-table-column prop="runEnv" label="环境" width="60px" align="center" show-overflow-tooltip></el-table-column>
            <el-table-column prop="runUserNickname" label="运行人" width="80px" align="center"
              show-overflow-tooltip></el-table-column>
            <el-table-column prop="runTime" label="运行时间" width="180px" align="center"
              show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="230px">
              <template slot-scope="scope">
                <div>
                  <el-button v-if="scope.row.caseNum > 0" type="success" icon="el-icon-video-play" size="mini" plain
                    @click="runPlan(scope.row)" :loading="scope.row.loading"></el-button>
                  <el-button v-else disabled icon="el-icon-video-play" size="mini" plain></el-button>
                  <el-button type="info" icon="el-icon-edit-outline" size="mini" @click="gotoPlanEditor(scope.row)"
                    plain></el-button>
                  <el-button type="danger" icon="el-icon-document-delete" size="mini" @click="deletePlan(scope.row)"
                    plain></el-button>
                  <el-button type="info" icon="el-icon-tickets" size="mini" @click="gotoCaseList(scope.row)"
                    plain></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="content-footer clear">
          <div class="block page-list self-right">
            <vue-pagination :currentPage="searchForm.page" :pageSize="searchForm.perPage" :totalNum="total"
              @sizeChange="pageSizeChange" @currentPageChange="pageChange" />
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import ProjectEnv from "@/components/ProjectEnv";
import { isProjectExisted } from "@/utils/commonMethods";
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        perPage: 10,
        name: "",
      },
      total: 0,
      tableData: [],
      tableLoading: false,
    };
  },
  components: { ProjectEnv },
  methods: {
    async getTableData() {
      let keys = Object.keys(this.searchForm);
      let params = [];
      keys.forEach(key => {
        let value = this.searchForm[key];
        if (value) {
          params.push(`${key}=${this.searchForm[key]}`);
        }
      });
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let projectId = curProjectEnv.curProjectId;
      if (projectId) {
        params.push(`projectId=${projectId}`);
      }
      let url = "/teprunner/plans?" + params.join("&");
      this.tableLoading = true;
      await this.$http.get(url).then(async ({ data }) => {
        this.tableData = data.items || [];
        this.total = data.totalNum;
        if (!data.items && data.totalNum > 0 && this.searchForm.page > 1) {
          this.searchForm.page--;
          await this.getTableData();
        }
      });

      this.tableLoading = false;
    },
    addPlan() {
      if (!isProjectExisted()) {
        this.$notifyMessage(`请先创建项目`, { type: "error" });
        return;
      }
      localStorage.removeItem("planInfo");
      this.$router.push({
        name: "addPlan",
      });
    },
    search() {
      this.searchForm.page = 1;
      this.getTableData();
    },
    numStyle(type, num) {
      if (num === "0") {
        return {};
      }
      if (type === "case") {
        return { cursor: "pointer", "text-decoration": "underline" };
      }
      if (type === "passed") {
        return { color: "rgb(0,153,117)", cursor: "pointer", "text-decoration": "underline" };
      }
      if (type === "failed") {
        return { color: "rgb(236,76,71)", cursor: "pointer", "text-decoration": "underline" };
      }
      if (type === "error") {
        return { color: "red", cursor: "pointer", "text-decoration": "underline" };
      }
    },
    runPlan(row) {
      this.$set(row, "loading", true);
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let curProjectId = curProjectEnv.curProjectId;
      let runEnv = curProjectEnv.curEnvName;
      let runUserNickname = JSON.parse(localStorage.getItem("userInfo")).nickname;
      let params = {
        curProjectId,
        runEnv,
        runUserNickname,
      };
      this.$http.post(`/teprunner/plans/${row.id}/run`, params).then(({ data: { msg } }) => {
        this.$notifyMessage(msg, { type: "success" });
        this.getTableData();
        this.$set(row, "loading", false);
      });
    },
    deletePlan(row) {
      this.$confirm("确认删除该计划吗？", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger",
        type: "warning",
      }).then(async () => {
        this.tableLoading = true;
        let url = `/teprunner/plans/${row.id}`;
        await this.$http.delete(url).then(async () => {
          this.$notifyMessage("删除成功", { type: "success" });
          await this.getTableData();
        });
        this.tableLoading = false;
      });
    },
    resetSearchForm() {
      this.searchForm = {
        page: 1,
        perPage: 10,
        name: "",
      };
      this.getTableData();
    },
    changeProject() {
      this.resetSearchForm();
    },
    pageSizeChange(val) {
      this.searchForm.perPage = val;
      this.getTableData();
    },
    pageChange(val) {
      this.searchForm.page = val;
      this.getTableData();
    },
    gotoPlanEditor(row) {
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("planInfo", rowInfo);
      this.$router.push({
        name: "editPlan",
      });
    },
    gotoCaseList(row) {
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("planInfo", rowInfo);
      this.$router.push({
        name: "caseList",
      });
    },
    gotoPlanResult(row, searchType) {
      row.searchType = searchType;
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("planInfo", rowInfo);
      this.$router.push({
        name: "planResult",
      });
    },
  },
  watch: {
    $route: {
      handler(to) {
        if (to.name === "plan") {
          this.getTableData();
        }
      },
      immediate: true,
    },
  },
};
</script>
<style>
.content-table .el-table td {
  height: 64px;
  line-height: 64px;
}
</style>
