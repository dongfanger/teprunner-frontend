<template>
  <div>
    <WrapComponent v-if="$route.name === 'case'" tableTitle="全部用例">
      <ProjectEnv slot="projectEnv" @changeProject="changeProject"></ProjectEnv>
      <el-form slot="form" :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
        <el-form-item label="用例ID" prop="id">
          <el-input v-model="searchForm.id" placeholder="精确匹配" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="用例描述" prop="desc">
          <el-input v-model="searchForm.desc" placeholder="模糊匹配" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="API" prop="api">
          <el-input v-model="searchForm.api" placeholder="接口路径" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="searchCase" type="primary" icon="el-icon-search">搜索</el-button>
          <el-button @click="resetForm" icon="el-icon-refresh-left">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        slot="table"
        :data="tableData"
        v-loading="loading"
        :header-cell-style="{
          background: 'rgba(144, 147, 153, 0.06)',
          color: 'rgba(0, 0, 0, 0.65)',
          fontSize: '14px',
        }"
      >
        <el-table-column prop="id" label="用例ID" width="80px" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="desc" label="用例描述" show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="cursor:pointer;text-decoration: underline;color: dodgerblue" @click="gotoCaseView(scope.row)">
              {{ scope.row.desc }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="creatorNickname"
          label="创建人"
          width="80px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="result" label="运行结果" width="120px" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              :style="{ color: getResultColor(scope.row.result) }"
              @click="gotoCaseResult('view', scope.row)"
              style="cursor: pointer; text-decoration: underline;"
            >
              {{ scope.row.result }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="elapsed"
          label="耗时"
          width="80px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="runEnv" label="环境" width="50px" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="runUserNickname"
          label="运行人"
          width="80px"
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

        <el-table-column label="操作" width="230px" align="center">
          <template slot-scope="scope">
            <div>
              <el-button
                type="success"
                icon="el-icon-video-play"
                size="mini"
                plain
                @click="gotoCaseResult('run', scope.row)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="content-footer clear" slot="footer">
        <div class="block page-list self-right">
          <vue-pagination v-bind="pageParams" @sizeChange="changeSize" @currentPageChange="changeCurrentPage" />
        </div>
      </div>
    </WrapComponent>

    <router-view></router-view>

  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { filterNullValue, resultColor, trimStr } from "@/utils/commonMethods";
import ProjectEnv from "@/components/ProjectEnv";

export default {
  name: "CaseManagement",
  components: {
    WrapComponent,
    ProjectEnv,
  },
  data() {
    return {
      loading: false,
      searchForm: {
        id: "",
        desc: "",
        api: "",
      },
      tableData: [],
      pageParams: {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      },
      result: "",
      elapsed: "",
      runEnv: "",
      runUserNickname: "",
      runTime: "",
    };
  },
  created() {
    this.getCaseList();
  },
  methods: {
    searchCase() {
      this.pageParams.currentPage = 1;
      this.getCaseList();
    },
    getCaseList() {
      this.loading = true;
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let projectId = curProjectEnv.curProjectId;
      let params = {
        id: trimStr(this.searchForm.id),
        desc: trimStr(this.searchForm.desc),
        api: trimStr(this.searchForm.api),
        page: this.pageParams.currentPage,
        perPage: this.pageParams.pageSize,
        sortField: "id",
        projectId: projectId,
      };
      this.$http
        .get("/teprunner/cases", { params: filterNullValue(params) })
        .then(({ data: { items, totalNum } }) => {
          this.pageParams.totalNum = totalNum;
          if (items) {
            this.tableData = items.map(item => {
              return {
                id: item.id,
                desc: item.desc,
                creatorNickname: item.creatorNickname,
                result: item.result,
                elapsed: item.elapsed,
                runEnv: item.runEnv,
                runUserNickname: item.runUserNickname,
                runTime: item.runTime,
                source: item.source,
              };
            });
          } else {
            if (totalNum > 0 && this.pageParams.currentPage > 1) {
              this.pageParams.currentPage--;
              this.getCaseList();
            }
            this.tableData = [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    gotoCaseResult(type, row) {
      row.caseResultType = type;
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("caseInfo", rowInfo);
      this.$router.push({
        name: "case.caseResult",
      });
    },
    getResultColor(res) {
      return resultColor(res);
    },
    changeProject() {
      this.pageParams = {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      };
      this.getCaseList();
    },
    resetForm() {
      this.$refs.searchFormRef.resetFields();
      this.searchForm.api = "";
      this.searchForm.desc = "";
      this.searchForm.id = "";
      this.getCaseList();
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getCaseList();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getCaseList();
    },
    gotoCaseView(row) {
      localStorage.setItem("caseViewId", row.id);
      this.$router.push({
        name: "caseView",
      });
    },
  },
  watch: {
    $route: {
      handler(to) {
        if (to.name === "case") {
          this.getCaseList();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped></style>
