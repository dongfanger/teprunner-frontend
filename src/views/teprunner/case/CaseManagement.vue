<template>
  <div>
    <div class="container">
      <div class="left-panel">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">{{ selectedLabel }}<i class="el-icon-arrow-down el-icon--right"></i></span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="option in options" :key="option.value" :command="option.value">
              {{ option.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-input v-model="searchText" placeholder="搜索" @input="handleSearch"></el-input>
        <el-tree :data="filteredTreeData" :props="defaultProps" node-key="id" @node-click="handleNodeClick"></el-tree>
      </div>
      <div class="right-panel">
        <div v-if="selectedNode">
          <h3>{{ selectedNode.label }}</h3>
          <!-- 根据选中节点的内容进行展示 -->
          <p v-html="selectedNode.content"></p>
        </div>
        <div v-if="$route.name === 'case'">
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
                <div style="cursor:pointer;text-decoration: underline;color: dodgerblue"
                     @click="gotoCaseView(scope.row)">
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
            <el-table-column prop="runEnv" label="环境" width="50px" align="center"
                             show-overflow-tooltip></el-table-column>
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
              <vue-pagination v-bind="pageParams" @sizeChange="changeSize" @currentPageChange="changeCurrentPage"/>
            </div>
          </div>
        </div>
      </div>
    </div>


    <router-view></router-view>

  </div>
</template>

<script>
import {filterNullValue, resultColor, trimStr} from "@/utils/commonMethods";

export default {
  name: "CaseManagement",
  components: {},
  data() {
    return {
      searchText: '',
      treeData: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
          children: [{
            label: '三级 1-1-1'
          }]
        }]
      }, {
        label: '一级 2',
        children: [{
          label: '二级 2-1',
          children: [{
            label: '三级 2-1-1'
          }]
        }, {
          label: '二级 2-2',
          children: [{
            label: '三级 2-2-1'
          }]
        }]
      }, {
        label: '一级 3',
        children: [{
          label: '二级 3-1',
          children: [{
            label: '三级 3-1-1'
          }]
        }, {
          label: '二级 3-2',
          children: [{
            label: '三级 3-2-1'
          }]
        }]
      }],
      selectedOption: '',
      selectedLabel: '',
      options: [
        {
          value: 'option1',
          label: '选项一'
        },
        {
          value: 'option2',
          label: '选项二'
        },
        // 其他选项
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
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
  computed: {
    filteredTreeData() {
      if (!this.searchText) {
        return this.treeData;
      }
      return this.filterTree(this.treeData, this.searchText);
    }
  },
  created() {
    this.getCaseList();
  },
  methods: {
    filterTree(nodes, searchText) {
      const filteredNodes = [];
      for (const node of nodes) {
        const clonedNode = {...node};
        if (clonedNode.label.toLowerCase().includes(searchText.toLowerCase())) {
          filteredNodes.push(clonedNode);
        }
        if (node.children) {
          clonedNode.children = this.filterTree(node.children, searchText);
          if (clonedNode.children.length > 0) {
            filteredNodes.push(clonedNode);
          }
        }
      }
      return filteredNodes;
    },
    handleSearch() {
      // 处理搜索输入事件
      // 这里可以进行一些搜索结果的处理，如更新展示区域等操作
    },
    handleCommand(command) {
      this.selectedOption = command;
      this.selectedLabel = this.options.find(option => option.value === command)?.label || '';
    },
    handleOptionChange() {
      // 处理下拉框选项变化事件
      // 根据下拉框的选择，更新树的数据
      if (this.selectedOption === 'option1') {
        this.treeData = [
          // 更新为选项1对应的树结构数据
        ];
      } else if (this.selectedOption === 'option2') {
        this.treeData = [
          // 更新为选项2对应的树结构数据
        ];
      } else if (this.selectedOption === 'option3') {
        this.treeData = [
          // 更新为选项3对应的树结构数据
        ];
      }
    },
    handleNodeClick(data) {
      // 处理节点被点击的事件
      this.selectedNode = data;
    },
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
          .get("/teprunner/cases", {params: filterNullValue(params)})
          .then(({data: {items, totalNum}}) => {
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

<style scoped>
.container {
  display: flex;
}

.left-panel {
  flex: 1;
  padding: 20px;
}

.right-panel {
  flex: 2;
  padding: 20px;
}

.custom-select .el-input__inner,
.custom-select .el-select__tags-text {
  border: none !important;
  box-shadow: none !important;
}

.custom-select .el-select__caret {
  display: none;
}
</style>
