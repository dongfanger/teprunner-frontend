<template>
  <div>
    <WrapComponent tableTitle="全部用例">
      <ProjectEnv slot="projectEnv" @changeProject="changeProject"></ProjectEnv>
      <el-button type="primary" class="pri-add-btn" icon="el-icon-plus" @click="onOperate('new')" slot="operate">
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
        <el-table-column prop="id" label="用例ID" width="120px" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="desc" label="用例描述" show-overflow-tooltip></el-table-column>
        <el-table-column
          prop="creatorNickname"
          label="创建人"
          width="120px"
          align="center"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="result" label="运行结果" width="120px" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              :style="{ color: getResultColor(scope.row.result) }"
              @click="onOpenCaseResult('view', scope.row.id)"
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
          prop="runUserNickname"
          label="运行人"
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

        <el-table-column label="操作" width="320px" align="center">
          <template slot-scope="scope">
            <div>
              <el-button type="success" size="mini" plain @click="onOpenCaseResult('run', scope.row.id)">
                运行
              </el-button>
              <el-button type="info" size="mini" plain @click="onOperate('edit', scope.row.id)">编辑</el-button>
              <el-button type="danger" size="mini" plain @click="onDel('删除', scope.row)">删除</el-button>
              <el-button type="warning" size="mini" plain @click="onCopy(scope.row.id)">复制</el-button>
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

    <AddCaseDialog
      :addCaseDialogFormVisible.sync="addCaseDialogFormVisible"
      :addCaseDialogTitle="addCaseDialogTitle"
      :id="curCaseId"
      @onRunCase="onRunCase"
      @success="resetForm"
    />

    <CaseResultDialog
      :caseResultDialogFormVisible.sync="caseResultDialogFormVisible"
      :caseResultDialogTitle="caseResultDialogTitle"
      :id="curCaseId"
      :caseResultType.sync="caseResultType"
      @onEditCase="onEditCase"
      @onCloseCaseResult="onCloseCaseResult"
    />

    <writeDownDialog
      :writeDownDialogFormVisible.sync="writeDownDialogFormVisible"
      :writeDownDialogTitle="writeDownDialogTitle"
    />
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue, resultColor } from "@/utils/commonMethods";
import AddCase from "@/views/teprunner/case/AddCase";
import CaseResult from "@/views/teprunner/case/CaseResult";
import ProjectEnv from "@/components/ProjectEnv";
import writeDown from "@/views/teprunner/case/WriteDown";

export default {
  name: "CaseManagement",
  components: {
    WrapComponent,
    ProjectEnv,
    AddCaseDialog: AddCase,
    CaseResultDialog: CaseResult,
    writeDownDialog: writeDown,
  },
  data() {
    return {
      loading: false,
      addCaseDialogFormVisible: false,
      addCaseDialogTitle: "",
      caseResultDialogFormVisible: false,
      caseResultDialogTitle: "",
      caseResultType: "",
      afterCloseRefreshList: false,
      writeDownDialogFormVisible: false,
      writeDownDialogTitle: "下载环境",
      curCaseId: "",
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
    onOperate(type, id = "") {
      const titleMap = {
        new: "新增用例",
        edit: "编辑用例",
      };
      this.addCaseDialogTitle = titleMap[type];
      this.addCaseDialogFormVisible = true;
      this.curCaseId = id;
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
    onOpenCaseResult(type, id = "") {
      const titleMap = {
        run: "运行用例结果",
        view: "查看用例结果",
      };
      this.caseResultDialogTitle = titleMap[type];
      this.caseResultDialogFormVisible = true;
      this.curCaseId = id;
      this.caseResultType = type;
      if (type === "run") {
        this.afterCloseRefreshList = true;
      } else if (type === "view") {
        this.afterCloseRefreshList = false;
      }
    },
    onCloseCaseResult() {
      if (this.afterCloseRefreshList === true) {
        this.getCaseList();
      }
    },
    writeDown() {
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
    onEditCase(id) {
      this.onOperate("edit", id);
    },
    onRunCase(id) {
      this.onOpenCaseResult("run", id);
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
};
</script>

<style scoped></style>
