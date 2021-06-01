<template>
  <div>
    <WrapComponent tableTitle="全部项目">
      <el-button type="primary" class="pri-add-btn" icon="el-icon-circle-plus" @click="onOperate('new')" slot="operate">
        新增项目
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
        <el-table-column prop="projectName" label="项目名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="envConfig" label="环境配置"></el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <div>
              <el-button type="info" size="mini" plain @click="onOperate('edit', scope.row.id)">编辑</el-button>
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

    <AddProjectDialog :dialogFormVisible.sync="dialogFormVisible" :dialogTitle="dialogTitle" :id="curId" />
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue } from "@/utils/commonMethods";
import AddProject from "./AddProject";

export default {
  name: "ProjectManagement",
  components: {
    WrapComponent,
    AddProjectDialog: AddProject,
  },
  data() {
    return {
      loading: false,
      dialogFormVisible: false,
      dialogTitle: "新增项目",
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
    this.getProjectList();
  },
  methods: {
    onOperate(type, id = "") {
      const titleMap = {
        new: "新增项目",
        edit: "编辑项目",
      };
      this.dialogTitle = titleMap[type];
      this.dialogFormVisible = true;
      this.curId = id;
    },
    onDel(btnText, row) {
      delConfirm(
        `是否${btnText}此项目？`,
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
        $url = `/teprunner/projects/${id}`;
        $method = "delete";
      }
      this.$http[$method]($url, params).then(() => {
        this.$notifyMessage(`${btnText}成功`, { type: "success" });
        this.getProjectList();
        localStorage.removeItem("projectEnvList");
      });
    },
    getProjectList() {
      this.loading = true;
      let params = {
        page: this.pageParams.currentPage,
        perPage: this.pageParams.pageSize,
        sortField: "id",
      };
      this.$http
        .get("/teprunner/projects", { params: filterNullValue(params) })
        .then(({ data: { items, totalNum } }) => {
          this.pageParams.totalNum = totalNum;
          if (items) {
            this.tableData = items.map(item => {
              return {
                id: item.id,
                projectName: item.name,
                envConfig: item.envConfig,
              };
            });
          } else {
            if (totalNum > 0 && this.pageParams.currentPage > 1) {
              this.pageParams.currentPage--;
              this.getProjectList();
            }
            this.tableData = [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getProjectList();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getProjectList();
    },
  },
};
</script>
