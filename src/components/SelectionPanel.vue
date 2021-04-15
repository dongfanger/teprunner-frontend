<template>
  <div>
    <el-dialog
      :title="title"
      :visible="dialogVisible"
      :destroy-on-close="true"
      :width="dialogWidth"
      :close-on-click-modal="false"
      @close="onCancel(selectedItem)"
    >
      <div class="select-panel-list-box" :loading="loading">
        <div class="search-box clear">
          <span class="self-left select-panel-num">{{ total }}项</span>
          <el-input
            size="small"
            :placeholder="placeholder"
            class="self-right select-panel-info-input"
            prefix-icon="el-icon-search"
            v-model="searchInfo"
            @keyup.enter.native="emitDataChange('search')"
          ></el-input>
        </div>
        <el-table
          ref="table"
          height="305px"
          class="has-checkbox select-panel-list-table"
          :data="tableData"
          :row-key="rowKey"
          @selection-change="selectionChange"
        >
          <el-table-column v-if="singleChoice" width="48">
            <template slot-scope="scope">
              <el-radio
                :label="scope.row[rowKey]"
                v-model="templateRadio"
                @change.native="getTemplateRow(scope.row[rowKey], scope.row)"
              >
                &nbsp;
              </el-radio>
            </template>
          </el-table-column>

          <el-table-column v-else type="selection" width="48" :reserve-selection="true"></el-table-column>

          <el-table-column
            v-for="col in columns"
            :key="col.prop"
            :label="col.label"
            show-overflow-tooltip
            :width="col.width"
            :align="col.align"
          >
            <template slot-scope="scope">
              <span>{{ scope.row[col.prop] ? scope.row[col.prop] : "-" }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="page-box clear" v-if="total && pageSize !== 10000">
          <el-button
            type="text"
            v-if="otherOperation"
            :icon="otherOperation.icon"
            @click="doOperation"
            class="self-left add-btn"
          >
            {{ otherOperation.text }}
          </el-button>
          <el-pagination
            class="self-right"
            small
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="total"
            :current-page.sync="page"
            @current-change="pageChange"
          ></el-pagination>
        </div>
        <div class="page-box clear" v-if="!total && otherOperation">
          <el-button type="text" :icon="otherOperation.icon" @click="doOperation" class="self-left add-btn">
            {{ otherOperation.text }}
          </el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onCancel(selectedItem)">取消</el-button>
        <el-button type="primary" @click="onConfirm">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      templateRadio: "",
      searchInfo: "",
      page: 1,
      selections: [],
    };
  },
  props: {
    dialogWidth: {
      type: String,
      default: "800px",
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    title: {
      type: String,
      default: "",
    },
    columns: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    selectedItem: {
      type: Array,
      default: () => [],
    },
    show: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    singleChoice: {
      type: Boolean,
      default: false,
    },
    dataChange: {
      type: Function,
    },
    rowKey: {
      type: String,
      default: "id",
    },
    otherOperation: {
      type: Object,
    },
    otherOperationFunction: {
      type: Function,
      default: () => {},
    },
  },
  methods: {
    onConfirm() {
      this.onCancel(this.selections);
    },
    onCancel(data) {
      this.searchInfo = "";
      this.pageChange(1);
      this.$emit("confirm", data);
    },
    initData() {
      if (this.selectedItem && this.selectedItem.length) {
        this.initSelection(this.selectedItem);
      } else {
        this.templateRadio = "";
      }
    },
    initSelection(selectedArr) {
      selectedArr.forEach(row => {
        const findRow = this.tableData.find(item => {
          if (item[this.rowKey] === row[this.rowKey]) {
            return item;
          }
        });
        if (findRow) {
          if (!this.singleChoice) {
            this.$refs.table.toggleRowSelection(findRow, true);
          } else {
            this.templateRadio = findRow[this.rowKey];
            this.selections[0] = findRow;
          }
        }
      });
    },
    selectionChange(val) {
      this.selections = val;
    },
    pageChange(page) {
      this.page = page;
      this.emitDataChange();
    },
    emitDataChange(type = null) {
      if (type) {
        this.page = 1;
      }
      this.$emit("dataChange", {
        page: this.page,
        searchInfo: this.searchInfo,
      });
    },
    getTemplateRow(id, row) {
      this.selections[0] = row;
    },
    doOperation() {
      this.$emit("otherOperationFunction");
    },
  },
  computed: {
    dialogVisible() {
      return this.show;
    },
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.searchInfo = "";
      }
    },
  },
  updated() {
    this.dialogVisible && this.initData();
  },
};
</script>
<style lang="scss" scoped>
::v-deep.el-dialog__body {
  padding-top: 24px;
  padding-left: 24px;
  padding-right: 24px;
  // padding-bottom: 0px;
}
::v-deep.el-table tr:last-child td {
  border-bottom: 0;
}
.select-panel-list-box {
  border-radius: 4px;
  border: 1px solid #e6e6ea;
  .search-box {
    padding: 12px;
    border-bottom: 1px solid #e6e6ea;
  }
  .select-panel-info-input {
    width: 300px;
  }
  .select-panel-num {
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
    line-height: 32px;
  }
  .select-panel-list-table {
    margin-top: 12px;
  }
  .page-box {
    text-align: right;
    border-top: 1px solid #e6e6ea;
    padding: 17px 0;
    margin: 0 12px;
    .el-pagination {
      font-weight: 100 !important;
      color: #606266;
    }
  }
  ::v-deep.el-table td:first-child::after {
    left: 12px;
  }
  ::v-deep.el-table td:last-child::after {
    right: 12px;
  }
  ::v-deep.el-table tbody::after {
    left: 12px;
    right: 12px;
  }
}
.add-btn {
  padding: 0;
  line-height: 26px;
  margin-left: 12px;
  ::v-deep span {
    padding-left: 8px;
  }
}
</style>
