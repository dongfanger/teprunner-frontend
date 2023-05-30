<template>
  <div class="page-wrap">
    <el-dialog :title="writeDownDialogTitle" :visible="writeDownDialogFormVisible" width="500px"
      :close-on-click-modal="false" @close="onResetForm">
      <div style="text-align: left; font-size: 14px; margin: 20px">
        <h3>
          <span style="background-color:#FFE500;">Step1</span>
        </h3>
        <br />
        <p>
          选择项目和环境。
        </p>
        <br />
        <h3>
          <span style="background-color:#FFE500;">Step2</span>
        </h3>
        <br />
        <p>
          点击下载zip文件并解压。
        </p>
        <br />
        <h3>
          <span style="background-color:#FFE500;">Step3</span>
        </h3>
        <br />
        <p>
          在tests目录编写pytest用例。
        </p>
        <br />
        <br />
        <p style="color: darkred">
          说明：所有环境变量和fixtures均会导出，不包括测试用例。
        </p>
        <br />
        <br />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onResetForm">取 消</el-button>
        <el-button type="primary" @click="download" :loading="loading">下 载</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "WriteDown",
  props: {
    writeDownDialogTitle: {
      type: String,
      default: "",
    },
    writeDownDialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    onResetForm() {
      this.$emit("update:writeDownDialogFormVisible", false);
    },
    download() {
      this.loading = true;
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let params = {
        curEnvName: curProjectEnv.curEnvName,
      };
      this.$http
        .post(`/teprunner/projects/${curProjectEnv.curProjectId}/export`, params, { responseType: "blob" })
        .then(res => {
          let blob = new Blob([res.data], { type: "application/zip" });
          let url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = res.headers["content-disposition"].split("=")[1];
          link.click();
          URL.revokeObjectURL(url);
          window.URL.revokeObjectURL(url);
        })
        .finally(() => {
          this.loading = false;
          this.onResetForm();
        });
    },
  },
};
</script>

<style>
.role-list ::v-deep.el-tag {
  margin-bottom: 15px;
}

.ace_editor {
  position: relative;
  overflow: hidden;
  font: 18px / normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace !important;
  direction: ltr;
  text-align: left;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
