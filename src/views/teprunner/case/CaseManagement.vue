<template>
  <div>
    <WrapComponent v-if="$route.name === 'case'" tableTitle="全部用例">
      <ProjectEnv slot="projectEnv" @changeProject="changeProject"></ProjectEnv>
      <el-button type="primary" class="pri-add-btn" icon="el-icon-plus" @click="addCase" slot="operate">
        新增用例
      </el-button>
      <el-button type="info" class="pri-add-btn" icon="el-icon-download" @click="writeDown" slot="operate">
        下载环境
      </el-button>
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
        <el-table-column prop="desc" label="用例描述" show-overflow-tooltip></el-table-column>
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
              <el-button
                type="info"
                icon="el-icon-edit-outline"
                size="mini"
                plain
                @click="gotoCaseEditor(scope.row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-document-delete"
                size="mini"
                plain
                @click="onDel('删除', scope.row)"
              ></el-button>
              <el-button
                type="warning"
                icon="el-icon-document-copy"
                size="mini"
                plain
                @click="onCopy(scope.row.id)"
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

    <writeDownDialog
      :writeDownDialogFormVisible.sync="writeDownDialogFormVisible"
      :writeDownDialogTitle="writeDownDialogTitle"
    />
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue, isProjectExisted, resultColor } from "@/utils/commonMethods";
import ProjectEnv from "@/components/ProjectEnv";
import writeDown from "@/views/teprunner/case/WriteDown";

export default {
  name: "CaseManagement",
  components: {
    WrapComponent,
    ProjectEnv,
    writeDownDialog: writeDown,
  },
  data() {
    return {
      loading: false,
      writeDownDialogFormVisible: false,
      writeDownDialogTitle: "下载环境",
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
        ...this.searchForm,
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
    addCase() {
      if (isProjectExisted()) {
        this.$notifyMessage(`请先创建项目`, { type: "error" });
        return;
      }
      localStorage.removeItem("caseInfo");
      this.$router.push({
        name: "addCase",
      });
    },
    gotoCaseEditor(row) {
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("caseInfo", rowInfo);
      this.$router.push({
        name: "editCase",
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
    onDel(btnText, row) {
      delConfirm(
        `是否${btnText}此用例？`,
        () => {
          this.operateRow(btnText, row);
        },
        {
          confirmButtonText: btnText,
        },
      );
    },
    operateRow(btnText, { id }) {
      let $url;
      let $method;
      let params = {};
      if (btnText === "删除") {
        $url = `/teprunner/cases/${id}`;
        $method = "delete";
      }
      this.$http[$method]($url, params).then(() => {
        this.$notifyMessage(`${btnText}成功`, { type: "success" });
        this.getCaseList();
      });
    },
    getResultColor(res) {
      return resultColor(res);
    },
    writeDown() {
      if (isProjectExisted()) {
        this.$notifyMessage(`请先创建项目`, { type: "error" });
        return;
      }
      this.writeDownDialogFormVisible = true;
    },
    onCopy(id = "") {
      this.isLoading = true;
      let creatorNickname = JSON.parse(localStorage.getItem("userInfo")).nickname;
      let params = {
        creatorNickname,
      };
      this.$http
        .post(`/teprunner/cases/${id}/copy`, params)
        .then(() => {})
        .finally(() => {
          this.isLoading = false;
          this.getCaseList();
        });
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
