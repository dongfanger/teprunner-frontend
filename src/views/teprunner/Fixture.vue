<template>
  <div>
    <WrapComponent v-if="$route.name === 'fixture'" tableTitle="fixtures">
      <ProjectEnv slot="projectEnv" @changeProject="changeProject" :showEnv="false"></ProjectEnv>
      <el-button type="primary" class="pri-add-btn" icon="el-icon-plus" @click="addFixture" slot="operate">
        新增 fixture
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
        <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="desc" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="creatorNickname" label="创建人" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <div>
              <el-button type="info" size="mini" plain @click="gotoFixtureEditor(scope.row)">编辑</el-button>
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
    <router-view></router-view>
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";
import { delConfirm, filterNullValue, isProjectExisted } from "@/utils/commonMethods";
import ProjectEnv from "@/components/ProjectEnv";

export default {
  name: "Fixtures",
  components: {
    WrapComponent,
    ProjectEnv: ProjectEnv,
  },
  data() {
    return {
      loading: false,
      tableData: [],
      pageParams: {
        currentPage: 1,
        pageSize: 10,
        totalNum: 0,
      },
    };
  },
  created() {
    this.getFixtureList();
  },
  methods: {
    getFixtureList() {
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      if (curProjectEnv) {
        this.loading = true;
        let curProjectId = curProjectEnv.curProjectId;
        let params = {
          page: this.pageParams.currentPage,
          perPage: this.pageParams.pageSize,
          sortField: "id",
          curProjectId: curProjectId,
        };
        this.$http
          .get("/teprunner/fixtures", { params: filterNullValue(params) })
          .then(({ data: { items, totalNum } }) => {
            this.pageParams.totalNum = totalNum;
            if (items) {
              this.tableData = items.map(item => {
                return {
                  id: item.id,
                  desc: item.desc,
                  name: item.name,
                  creatorNickname: item.creatorNickname,
                };
              });
            } else {
              if (totalNum > 0 && this.pageParams.currentPage > 1) {
                this.pageParams.currentPage--;
                this.getFixtureList();
              }
              this.tableData = [];
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    addFixture() {
      if (!isProjectExisted()) {
        this.$notifyMessage(`请先创建项目`, { type: "error" });
        return;
      }
      localStorage.removeItem("fixtureInfo");
      this.$router.push({
        name: "addFixture",
      });
    },
    gotoFixtureEditor(row) {
      let rowInfo = JSON.stringify(row);
      localStorage.setItem("fixtureInfo", rowInfo);
      this.$router.push({
        name: "editFixture",
      });
    },
    onDel(btnText, row) {
      delConfirm(
        `是否${btnText}此 fixture？`,
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
        $url = `/teprunner/fixtures/${id}`;
        $method = "delete";
      }
      this.$http[$method]($url, params).then(() => {
        this.$notifyMessage(`${btnText}成功`, { type: "success" });
        this.getFixtureList();
      });
    },
    changeSize(val) {
      this.pageParams.pageSize = val;
      this.pageParams.currentPage = 1;
      this.getFixtureList();
    },
    changeCurrentPage(val) {
      this.pageParams.currentPage = val;
      this.getFixtureList();
    },
    changeProject() {
      this.getFixtureList();
    },
  },
  watch: {
    $route: {
      handler(to) {
        if (to.name === "fixture") {
          this.getFixtureList();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped></style>
