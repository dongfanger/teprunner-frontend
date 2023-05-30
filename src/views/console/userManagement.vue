<template>
  <div>
    <WrapComponent tableTitle="全部用户">
      <el-button type="primary" class="pri-add-btn" icon="el-icon-circle-plus" @click="onOperate('new')" slot="operate">
        新增用户
      </el-button>
      <el-form slot="form" :model="searchForm" ref="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名 / 昵称" prop="keyword">
          <el-input v-model="searchForm.keyword" placeholder="用户名 / 昵称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="getUserList" type="primary" icon="el-icon-search">搜索</el-button>
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
        <el-table-column prop="username" label="用户名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="nickname" label="昵称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="roleName" label="角色"></el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <div>
              <el-button type="info" size="mini" plain @click="resetPWD(scope.row.id)">重置密码</el-button>
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

    <AddUserDialog
      :dialogFormVisible.sync="dialogFormVisible"
      :dialogTitle="dialogTitle"
      :id="curId"
      @success="resetForm"
    />
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue } from "@/utils/commonMethods";
import addUser from "./addUser";

export default {
  name: "accountMgt",
  components: {
    WrapComponent,
    AddUserDialog: addUser,
  },
  data() {
    return {
      loading: false,
      dialogFormVisible: false,
      dialogTitle: "新增用户",
      curId: "",
      searchForm: {
        keyword: "",
        roleNames: "",
        status: "",
      },
      tableData: [],
      pageParams: {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    onOperate(type, id = "") {
      const titleMap = {
        new: "新增用户",
        edit: "编辑用户",
      };
      this.dialogTitle = titleMap[type];
      this.dialogFormVisible = true;
      this.curId = id;
    },
    resetPWD(id) {
      delConfirm(
        `确认重置此用户的密码？`,
        () => {
          this.$http.put(`/users/${id}/passwords/reset`).then(({ data }) => {
            if (data) {
              delConfirm(`登录密码已重置为默认密码“${data}”，请联系相关人员尽快修改。`, null, {
                confirmButtonText: "我已知晓",
                showCancelButton: false,
                confirmButtonClass: "el-button--primary",
                type: "success",
              });
            }
            this.getUserList();
          });
        },
        {
          confirmButtonText: "重置",
        },
      );
    },
    onDel(btnText, row) {
      if (btnText === "启用") {
        this.operateRow(btnText, row);
        return;
      }
      delConfirm(
        `是否${btnText}此账号？`,
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
        $url = `/users/${id}`;
        $method = "delete";
      }
      this.$http[$method]($url, params).then(() => {
        this.$notifyMessage(`${btnText}成功`, { type: "success" });
        this.getUserList();
      });
    },
    getUserList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        page: this.pageParams.currentPage,
        perPage: this.pageParams.pageSize,
        sortField: "id",
      };
      this.$http
        .get("/users", { params: filterNullValue(params) })
        .then(({ data: { items, totalNum } }) => {
          this.pageParams.totalNum = totalNum;
          if (items) {
            this.tableData = items.map(item => {
              let roleName = "-";
              if (item.roleNames) {
                roleName = item.roleNames.map(role => role.name).join("、");
              }
              return {
                id: item.id,
                username: item.username,
                nickname: item.nickname,
                roleName,
              };
            });
          } else {
            if (totalNum > 0 && this.pageParams.currentPage > 1) {
              this.pageParams.currentPage--;
              this.getUserList();
            }
            this.tableData = [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetForm() {
      this.$refs.searchForm.resetFields();
      this.getUserList();
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getUserList();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getUserList();
    },
  },
};
</script>
