<template>
  <div style="height: 100%; overflow: auto;">
    <WrapComponent tableTitle="全部项目">
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
        <el-table-column prop="gitRepository" label="Git仓库"></el-table-column>
        <el-table-column prop="gitBranch" label="Git分支"></el-table-column>
        <el-table-column prop="lastSyncTime" label="上次同步时间"></el-table-column>
        <el-table-column label="操作" width="320px">
          <template slot-scope="scope">
            <div>
              <el-button type="info" size="mini" plain @click="onOperate(scope.row)" :loading="scope.row.buttonLoading">
                同步
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </WrapComponent>
  </div>
</template>

<script>
import WrapComponent from "@/components/WrapComponent";

export default {
  name: "GitSync",
  components: {
    WrapComponent,
  },
  data() {
    return {
      loading: false,
      tableData: [],
    };
  },
  created() {
    this.getProjectList();
  },
  methods: {
    onOperate(row) {
      this.$set(row, "buttonLoading", true);
      let $url;
      let $method;
      $url = `/teprunner/projects/${row.id}/gitSync`;
      $method = "post";
      this.$http[$method]($url)
        .then(() => {
          this.$notifyMessage(`同步成功`, { type: "success" });
          this.getProjectList();
        })
        .finally(() => {
          this.$set(row, "buttonLoading", false);
        });
    },
    getProjectList() {
      this.loading = true;
      this.$http
        .get("/teprunner/projects")
        .then(({ data: { items } }) => {
          if (items) {
            this.tableData = items.map(item => {
              return {
                id: item.id,
                projectName: item.name,
                envConfig: item.envConfig,
                gitRepository: item.gitRepository,
                gitBranch: item.gitBranch,
                lastSyncTime: item.lastSyncTime,
              };
            });
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

<style>
.tabtop13 {
  margin-top: 13px;
}
.tabtop13 td {
  background-color: #ffffff;
  height: 25px;
  line-height: 150%;
}
.font-center {
  text-align: center;
}
.biaoti {
  font-family: 微软雅黑, serif;
  font-size: 26px;
  font-weight: bold;
  border-bottom: 1px dashed #cccccc;
}
.titfont {
  font-family: 微软雅黑, serif;
  font-size: 16px;
  font-weight: bold;
  background-color: #e9faff;
}
.tabtxt2 {
  font-family: 微软雅黑, serif;
  font-size: 14px;
  font-weight: bold;
  text-align: right;
  padding-right: 10px;
}
.tabtxt3 {
  font-family: 微软雅黑, serif;
  font-size: 14px;
  padding-left: 15px;
  color: #000;
  margin-top: 10px;
  margin-bottom: 10px;
  line-height: 20px;
}
pre {
  width: 800px;
  margin-top: 10px;
}
</style>
