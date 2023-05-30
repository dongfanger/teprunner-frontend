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

    <div style="text-align: left; font-size: 14px; margin-left: 20px">
      <br />
      <br />
      <h3>
        <span style="background-color:#FFE500;">同步说明</span>
      </h3>
      <br />
      <p>
        1.单向同步：只能从Git拉取用例到平台，平台用例无法上传到Git。
      </p>
      <br />
      <span>2.Git用例是缓存数据，与平台用例数据独立：</span>
      <table width="300px" border="0" cellspacing="1" cellpadding="4" bgcolor="#cccccc" class="tabtop13" align="center">
        <tr>
          <td class="btbg font-center titfont">操作</td>
          <td class="btbg font-center titfont">Git用例</td>
          <td class="btbg font-center titfont">平台用例</td>
        </tr>
        <tr>
          <td class="font-center">查看</td>
          <td class="font-center">√</td>
          <td class="font-center">√</td>
        </tr>
        <tr>
          <td class="font-center">运行</td>
          <td class="font-center">√</td>
          <td class="font-center">√</td>
        </tr>
        <tr>
          <td class="font-center">编辑</td>
          <td class="font-center">×</td>
          <td class="font-center">√</td>
        </tr>
        <tr>
          <td class="font-center">删除</td>
          <td class="font-center">×</td>
          <td class="font-center">√</td>
        </tr>
        <tr>
          <td class="font-center">复制</td>
          <td class="font-center">√</td>
          <td class="font-center">√</td>
        </tr>
      </table>

      <br />
      <span>（Git用例→复制→平台用例）</span>
      <br />
      <br />
      <p>
        3.同步内容：只同步测试用例，不同步环境变量和fixtures。
        <br />
      </p>
      <br />
      4.文件模板推荐设置：
      <br />
      <pre v-highlightA><code>#!/usr/bin/python
# encoding=utf-8

"""
@Author  :  Don
@Date    :  ${DATE} ${TIME}
@Desc    :
"""</code></pre>
      <br />
      <img :src="require('@/assets/image/file-template.png')" />
      <br />
      <br />
      <ul style="margin-left: 40px">
        <li>文件：tests目录下test_开头或_test结尾的.py文件</li>
        <li>用例描述：@Desc，否则为文件名</li>
        <li>创建人：@Author，否则为“git”</li>
      </ul>
      <br />
      <br />
      <br />
      <br />
    </div>
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
