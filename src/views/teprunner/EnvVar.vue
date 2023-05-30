<template>
  <div>
    <WrapComponent tableTitle="全部变量">
      <ProjectEnv slot="projectEnv" @changeProject="changeProject" @changeEnv="changeEnv"></ProjectEnv>
      <el-button type="primary" class="pri-add-btn" icon="el-icon-plus" @click="onOperate('new')" slot="operate">
        新增变量
      </el-button>
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
        <el-table-column prop="name" label="变量名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="value" label="变量值" show-overflow-tooltip></el-table-column>
        <el-table-column prop="desc" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <div>
              <el-button type="primary" size="mini" plain @click="onOperate('edit', scope.row.id)">编辑</el-button>
              <el-button type="danger" size="mini" plain @click="onDel('删除', scope.row)">删除</el-button>
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

    <AddEnvVarDialog
      :dialogFormVisible.sync="dialogFormVisible"
      :dialogTitle="dialogTitle"
      :id="curId"
      @success="resetForm"
    />
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue, isProjectExisted } from "@/utils/commonMethods";
import AddEnvVar from "@/views/teprunner/AddEnvVar";
import ProjectEnv from "@/components/ProjectEnv";

export default {
  name: "EnvVar",
  components: {
    WrapComponent,
    ProjectEnv,
    AddEnvVarDialog: AddEnvVar,
  },
  data() {
    return {
      loading: false,
      dialogFormVisible: false,
      dialogTitle: "新增变量",
      curId: "",
      tableData: [],
      pageParams: {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      },
    };
  },
  created() {
    this.getEnvVarList();
  },
  methods: {
    changeProject() {
      this.getEnvVarList();
    },
    changeEnv() {
      this.getEnvVarList();
    },
    onOperate(type, id = "") {
      if (!isProjectExisted()) {
        this.$notifyMessage(`请先创建项目`, { type: "error" });
        return;
      }
      const titleMap = {
        new: "新增变量",
        edit: "编辑变量",
      };
      this.dialogTitle = titleMap[type];
      this.dialogFormVisible = true;
      this.curId = id;
    },
    onDel(btnText, row) {
      delConfirm(
        `是否${btnText}此变量？`,
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
        $url = `/teprunner/envvars/${id}`;
        $method = "delete";
      }
      this.$http[$method]($url, params).then(() => {
        this.$notifyMessage(`${btnText}成功`, { type: "success" });
        this.getEnvVarList();
      });
    },
    getEnvVarList() {
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      if (curProjectEnv) {
        this.loading = true;
        let curProjectId = curProjectEnv.curProjectId;
        let curEnvName = curProjectEnv.curEnvName;
        let params = {
          page: this.pageParams.currentPage,
          perPage: this.pageParams.pageSize,
          sortField: "id",
          curProjectId: curProjectId,
          curEnvName: curEnvName,
        };
        this.$http
          .get("/teprunner/envvars", { params: filterNullValue(params) })
          .then(({ data: { items, totalNum } }) => {
            this.pageParams.totalNum = totalNum;
            if (items) {
              this.tableData = items.map(item => {
                return {
                  id: item.id,
                  name: item.name,
                  value: item.value,
                  desc: item.desc,
                };
              });
            } else {
              if (totalNum > 0 && this.pageParams.currentPage > 1) {
                this.pageParams.currentPage--;
                this.getEnvVarList();
              }
              this.tableData = [];
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    resetForm() {
      this.getEnvVarList();
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getEnvVarList();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getEnvVarList();
    },
  },
};
</script>

<style scoped></style>
