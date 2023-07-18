<template>
  <div>
    <div class="content-info">
      <div class="content-header">
        <div class="info-name">任务信息</div>
      </div>
      <div class="task-info-list">
        <div class="info-txt clear">
          <p>
            <span class="label">任务名称：</span>
            {{ taskInfo.name }}
          </p>
          <p>
            <span class="label">所属项目：</span>
            {{ projectName }}
          </p>
        </div>
      </div>
    </div>
    <div class="content-info case-list" :loading="isLoading">
      <div class="content-header clear">
        <div class="info-name self-left">
          用例列表
        </div>
        <div class="self-right add-case">
          <el-button type="primary" size="medium" icon="el-icon-plus" :loading="addCase.loading" @click="panelToggle">
            添加用例
          </el-button>
        </div>
      </div>
      <el-form size="medium" :inline="true" :model="searchForm" class="search-form" ref="searchForm">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="searchForm.keyword" placeholder="请输入用例ID或用例描述" style="width: 400px"></el-input>
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
          <el-table-column prop="caseId" label="用例ID" width="300px" align="center"
            show-overflow-tooltip></el-table-column>
          <el-table-column prop="caseDesc" label="用例描述" show-overflow-tooltip></el-table-column>
          <el-table-column prop="caseCreatorNickname" label="创建人" width="300px" align="center"
            show-overflow-tooltip></el-table-column>
          <el-table-column label="操作" width="200px">
            <template slot-scope="scope">
              <div>
                <el-button type="danger" size="mini" @click="removeCase(scope.row)" plain>移除</el-button>
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
    <selection-panel title="选择用例" ref="addCase" :selectedItem="addCase.selectedItem" :singleChoice="false"
      placeholder="请输入用例ID或用例描述" :columns="addCase.tableColumns" :tableData="addCase.tableData" :show="addCase.show"
      :pageSize="10" :total="addCase.total" :loading="addCase.loading" @confirm="addCaseSelection"
      @dataChange="dataChange"></selection-panel>
  </div>
</template>
<script>
import SelectionPanel from "@/components/SelectionPanel";

export default {
  components: { SelectionPanel },
  data() {
    return {
      isLoading: false,
      addCase: {
        loading: false,
        tableColumns: [
          {
            prop: "id",
            label: "用例ID",
            width: "100px",
            align: "center",
          },
          {
            prop: "desc",
            label: "用例描述",
          },
          {
            prop: "creatorNickname",
            label: "创建人",
            width: "120px",
            align: "center",
          },
        ],
        tableData: [],
        show: false,
        total: 0,
        selectedItem: [],
      },
      searchForm: {
        page: 1,
        perPage: 10,
        keyword: "",
      },
      tableData: [],
      currentPage: 1,
      taskInfo: null,
      total: 0,
      projectName: "",
    };
  },
  created() {
    let info = localStorage.getItem("taskInfo");
    info = JSON.parse(info) || {};
    this.taskInfo = {
      name: info.name,
      caseNum: info.caseNum,
      id: info.id,
    };
    let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
    this.projectName = curProjectEnv.curProjectName;
    this.getTableData();
  },
  methods: {
    async getTableData() {
      let url = `/teprunner/tasks/${this.taskInfo.id}/cases`;
      let params = [];
      let keys = Object.keys(this.searchForm);
      keys.forEach(key => {
        let value = this.searchForm[key];
        if (value) {
          params.push(`${key}=${this.searchForm[key]}`);
        }
      });
      url = url + "?" + params.join("&");
      this.isLoading = true;
      try {
        let { data } = await this.$http.get(url);
        this.tableData = data.items || [];
        this.total = data.totalNum || 0;
        this.isLoading = false;
      } catch (err) {
        console.log(err);
        this.isLoading = false;
      }
    },
    removeCase(row) {
      this.$confirm("确认移除该用例吗？", "提示", {
        confirmButtonText: "移除",
        cancelButtonText: "取消",
        confirmButtonClass: "el-button--danger",
        type: "warning",
      })
        .then(async () => {
          this.isLoading = true;
          let url = `/teprunner/tasks/${this.taskInfo.id}/cases/${row.caseId}`;
          await this.$http
            .delete(url)
            .then(async res => {
              if (res.status === 204) {
                this.$notify.success({
                  title: "提示",
                  message: "移除成功",
                });
                await this.getTableData();
              }
            })
            .finally(() => {
              this.isLoading = false;
            });
        })
        .catch(() => { });
    },
    async panelToggle() {
      this.addCase.loading = true;
      try {
        await this.getCaseData(1);
        this.addCase.show = true;
      } catch (err) {
        console.log(err);
      }
      this.addCase.loading = false;
    },
    addCaseSelection(data) {
      if (data && data.length) {
        let url = `/teprunner/tasks/${this.taskInfo.id}/cases`;
        let addCaseIds = data.map(item => item.id);
        let params = {
          caseIds: addCaseIds,
        };
        this.$http
          .post(url, params)
          .then(res => {
            if (res.status === 201) {
              this.$notify.success({ title: "提示", message: `添加用例成功` });
              this.getTableData();
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
      this.addCase.show = false;
      this.addCase.selectedItem = [];
    },
    async dataChange(data) {
      await this.getCaseData(data.page, data.searchInfo);
    },
    async getCaseData(page, keyword) {
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let projectId = curProjectEnv.curProjectId;
      let params = {
        page,
        keyword: keyword,
        perPage: 10,
        excludeTaskId: this.taskInfo.id,
        projectId,
      };
      let url = `/teprunner/cases`;
      try {
        let { data } = await this.$http.get(url, { params: params });
        if (data) {
          let dataList =
            data.items &&
            data.items.map(item => ({
              id: item.id,
              desc: item.desc,
              creatorNickname: item.creatorNickname,
            }));
          this.addCase.tableData = dataList || [];
          this.addCase.total = data.totalNum;
        }
      } catch (err) {
        console.log(err);
      }
    },
    search() {
      this.searchForm.page = 1;
      this.getTableData();
    },
    pageSizeChange(val) {
      this.searchForm.perPage = val;
      this.searchForm.page = 1;
      this.getTableData();
    },
    pageChange(val) {
      this.searchForm.page = val;
      this.getTableData();
    },
    resetSearchForm() {
      this.searchForm.keyword = "";
      this.getTableData();
    },
  },
};
</script>
<style>
.form-box {
  margin-top: 16px;
}

.form-box .custom-size .el-form-item__content,
.custom-size .el-select,
.custom-size .el-select>.el-input {
  width: 380px;
}

.task-info-list {
  margin: 0 24px;
}

.task-name {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  margin-top: 10px;
}

.task-info-list {
  font-size: 14px;
  line-height: 20px;
  padding-bottom: 32px;
  color: rgba(0, 0, 0, 0.65);
}

.task-info-list span.label {
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}

.info-txt {
  margin-top: 16px;
  line-height: 28px;
}

.info-txt p {
  padding-right: 30px;
  position: relative;
  float: left;
}

.info-txt p ::after {
  content: "";
  display: block;
  position: absolute;
  right: 15px;
  top: 6px;
  width: 1px;
  height: 16px;
  background: #e6e6ea;
}

.info-txt p :first-child {
  padding-left: 0;
}

.info-txt p :last-child::after {
  width: 0;
}

.task-describe {
  margin-top: 15px;
}

.task-describe .task-describe-txt {
  margin-left: 70px;
}

.case-list {
  margin-top: 24px;
}

.add-case .el-button {
  padding: 11px 20px;
}
</style>
