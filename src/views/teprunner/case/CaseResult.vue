<template>
  <div class="page-wrap">
    <el-dialog
      :title="caseResultDialogTitle"
      :visible="visible"
      width="90%"
      style="margin-left: 5%; margin-top: -6%; margin-bottom: -5%"
      :close-on-click-modal="false"
      @close="close"
    >
      <el-form :model="caseForm" ref="caseFormRef" label-width="100px" class="form-common" :inline="true">
        <el-form-item label="用例描述:" style="margin-top: -20px">
          <span>{{ this.caseForm.desc }}</span>
        </el-form-item>
        <div style="margin-top: -30px; margin-left: -14px">
          <el-form-item label="创建人:">
            <span>{{ this.caseForm.creatorNickname }}</span>
          </el-form-item>
          <el-form-item label="运行结果:">
            <span
              :style="{
                color: this.getResultColor(this.caseForm.result),
                fontWeight: 700,
              }"
            >
              {{ this.caseForm.result }}
            </span>
          </el-form-item>
          <el-form-item label="运行耗时:">
            <span>{{ this.caseForm.elapsed }}</span>
          </el-form-item>
          <el-form-item label="运行环境:">
            <span>{{ this.caseForm.runEnv }}</span>
          </el-form-item>
          <el-form-item label="运行人:">
            <span>{{ this.caseForm.runUserNickname }}</span>
          </el-form-item>
          <el-form-item label="运行时间:">
            <span>{{ this.caseForm.runTime }}</span>
          </el-form-item>
        </div>
      </el-form>
      <editor
        :value="this.caseForm.output"
        @init="editorInit"
        lang="text"
        theme="monokai"
        width="100%"
        :height="codeHeight"
      ></editor>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onEditCase" :loading="isLoading">编辑用例</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { resultColor } from "@/utils/commonMethods";

export default {
  name: "CaseResult",
  props: {
    caseResultDialogTitle: {
      type: String,
      default: "",
    },
    caseResultDialogFormVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      default: "",
    },
    caseResultType: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      codeHeight: 680,
      isLoading: false,
      caseForm: {
        desc: "",
        creatorNickname: "",
        result: "",
        elapsed: "",
        output: "",
        runEnv: "",
        runUserNickname: "",
        runTime: "",
      },
    };
  },
  computed: {
    visible() {
      return this.caseResultDialogFormVisible;
    },
  },
  watch: {
    caseResultDialogFormVisible(val) {
      if (val && this.id) {
        this.getDetail();
      }
    },
  },
  components: {
    editor: require("vue2-ace-editor"),
  },
  methods: {
    editorInit: function(editor) {
      require("brace/theme/monokai");
      editor.setReadOnly(true);
      editor.getSession().setUseWrapMode(true);
    },
    onResetForm() {
      this.$refs.caseFormRef.resetFields();
      this.isLoading = false;
      this.caseForm.desc = "";
      this.caseForm.creatorNickname = "";
      this.caseForm.result = "";
      this.caseForm.elapsed = "";
      this.caseForm.output = "";
      this.caseForm.runEnv = "";
      this.caseForm.runUserNickname = "";
      this.caseForm.runTime = "";
      this.$emit("update:caseResultDialogFormVisible", false);
    },
    getDetail() {
      this.$http.get(`/teprunner/cases/${this.id}`).then(({ data }) => {
        this.caseForm.desc = data.desc;
        this.caseForm.creatorNickname = data.creatorNickname;
      });
      if (this.caseResultType === "run") {
        this.runCase();
      } else if (this.caseResultType === "view") {
        this.getResult();
      }
    },
    runCase() {
      this.caseForm.result = "";
      this.caseForm.elapsed = "";
      this.caseForm.output = "用例运行中...";
      this.caseForm.runTime = "";
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let runEnv = curProjectEnv.curEnvName;
      this.caseForm.runEnv = runEnv;
      let runUserNickname = JSON.parse(localStorage.getItem("userInfo")).nickname;
      this.caseForm.runUserNickname = runUserNickname;
      let params = {
        runEnv,
        runUserNickname,
      };
      this.$http
        .post(`/teprunner/cases/${this.id}/run`, params)
        .then(({ data: { result, elapsed, output, runEnv, runUserNickname, runTime } }) => {
          this.caseForm.result = result;
          this.caseForm.elapsed = elapsed;
          this.caseForm.output = output + "\n";
          this.caseForm.runEnv = runEnv;
          this.caseForm.runUserNickname = runUserNickname;
          this.caseForm.runTime = runTime;
        })
        .finally(() => {});
    },
    getResult() {
      this.$http.get(`/teprunner/cases/${this.id}/result`).then(({ data }) => {
        this.caseForm.result = data.result;
        this.caseForm.elapsed = data.elapsed;
        this.caseForm.output = data.output + "\n";
        this.caseForm.runEnv = data.runEnv;
        this.caseForm.runUserNickname = data.runUserNickname;
        this.caseForm.runTime = data.runTime;
      });
    },
    getResultColor(res) {
      return resultColor(res);
    },
    close() {
      this.onResetForm();
      this.$emit("onCloseCaseResult");
    },
    cancel() {
      this.$emit("update:caseResultDialogFormVisible", false);
    },
    onEditCase() {
      this.$emit("update:caseResultDialogFormVisible", false);
      this.$emit("onEditCase", this.id);
    },
  },
};
</script>

<style scoped lang="scss">
.role-list {
  ::v-deep.el-tag {
    margin-bottom: 15px;
  }
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
