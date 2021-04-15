<template>
  <div>
    <div v-if="$route.name === 'planResult'">
      <div class="content-info">
        <div class="content-header">
          <div class="info-name">计划运行结果</div>
        </div>
        <div class="plan-info-list">
          <div class="info-txt clear">
            <p>
              <span class="label">计划名称：</span>
              {{ planInfo.name }}
            </p>
            <p>
              <span class="label">所属项目：</span>
              {{ projectName }}
            </p>
            <p>
              <span class="label">查询类型：</span>
              {{ this.searchTypeName }}
            </p>
          </div>
        </div>
      </div>
      <el-table
        :data="tableData"
        v-loading="loading"
        :header-cell-style="{
          background: 'rgba(144, 147, 153, 0.06)',
          color: 'rgba(0, 0, 0, 0.65)',
          fontSize: '14px',
        }"
      >
        <el-table-column
          prop="caseId"
          label="用例ID"
          width="120px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="caseDesc" label="用例描述" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="caseCreatorNickname"
          label="创建人"
          width="120px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="result" label="运行结果" width="200px" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              @click="gotoCaseResult(scope.row.caseId, scope.row.planId)"
              style="cursor: pointer; text-decoration: underline;"
            >
              {{ scope.row.result }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="elapsed"
          label="运行耗时"
          width="120px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="runEnv"
          label="运行环境"
          width="120px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="runTime"
          label="运行时间"
          width="180px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
      <div class="content-footer clear">
        <div class="block page-list self-right">
          <vue-pagination v-bind="pageParams" @sizeChange="changeSize" @currentPageChange="changeCurrentPage" />
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "PlanResult",
  data() {
    return {
      loading: false,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      },
      tableData: [],
      searchTypeName: "",
    };
  },
  created() {
    let info = localStorage.getItem("planInfo");
    this.planInfo = JSON.parse(info) || {};
    const nameMap = {
      case: "用例",
      passed: "成功",
      failed: "失败",
      error: "错误",
    };
    this.searchTypeName = nameMap[this.planInfo.searchType];
    let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
    this.projectName = curProjectEnv.curProjectName;
    this.getTableData();
  },
  methods: {
    getTableData() {
      this.loading = true;
      let params = [];
      params.push(`searchType=${this.planInfo.searchType}`);
      this.$http
        .get(`/teprunner/plans/${this.planInfo.id}/result?` + params.join("&"))
        .then(({ data }) => {
          if (data.items) {
            this.tableData = data.items || [];
            this.pageParams.totalNum = data.totalNum;
          } else {
            if (data.totalNum > 0 && this.pageParams.currentPage > 1) {
              this.pageParams.currentPage--;
              this.getProjectList();
            }
            this.tableData = [];
          }
        })
        .finally(() => {
          {
            this.loading = false;
          }
        });
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getTableData();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getTableData();
    },
    gotoCaseResult(caseId, planId) {
      let caseInfo = {
        caseId,
        planId,
      };
      localStorage.setItem("caseInfo", JSON.stringify(caseInfo));
      this.$router.push({
        name: "caseResult",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/ .form-box {
  margin-top: 16px;
  .custom-size .el-form-item__content,
  .custom-size .el-select,
  .custom-size .el-select > .el-input {
    width: 380px;
  }
}
.plan-info-list {
  margin: 0 24px;
}
.plan-name {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  margin-top: 10px;
}
.plan-info-list {
  font-size: 14px;
  line-height: 20px;
  padding-bottom: 32px;
  color: rgba(0, 0, 0, 0.65);
  span.label {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
  }
}
.info-txt {
  margin-top: 16px;
  line-height: 28px;
  p {
    padding-right: 30px;
    position: relative;
    &::after {
      content: "";
      display: block;
      position: absolute;
      right: 15px;
      top: 6px;
      width: 1px;
      height: 16px;
      background: #e6e6ea;
    }
    float: left;
    &:first-child {
      padding-left: 0;
    }
    &:last-child::after {
      width: 0;
    }
  }
}
</style>
