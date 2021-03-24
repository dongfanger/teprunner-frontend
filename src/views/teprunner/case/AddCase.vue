<template>
  <div class="page-wrap">
    <el-dialog
      :title="addCaseDialogTitle"
      :visible="visible"
      width="90%"
      style="margin-left: 5%; margin-top: -6%; margin-bottom: -5%"
      :close-on-click-modal="false"
      @close="onResetForm"
    >
      <el-form :model="caseForm" ref="caseFormRef" :rules="rules" label-width="100px" class="form-common">
        <el-form-item label="用例描述" prop="desc">
          <el-input
            type="textarea"
            v-model="caseForm.desc"
            placeholder="请输入用例描述"
            :rows="1"
            style="width: 97%;"
          ></el-input>
        </el-form-item>
      </el-form>
      <editor
        v-model="caseForm.code"
        @init="editorInit"
        lang="python"
        theme="monokai"
        width="100%"
        height="680px"
        :options="{
          enableSnippets: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
        }"
      ></editor>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="onRunCase" :loading="isLoading" style="float: left">运 行</el-button>
        <el-button @click="onResetForm">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isLoading">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AddCase",
  props: {
    addCaseDialogTitle: {
      type: String,
      default: "",
    },
    addCaseDialogFormVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      default: "",
    },
  },
  computed: {
    visible() {
      return this.addCaseDialogFormVisible;
    },
  },
  watch: {
    addCaseDialogFormVisible(val) {
      if (val && this.id) {
        this.getDetail();
      }
    },
  },
  components: {
    editor: require("vue2-ace-editor"),
  },
  data() {
    return {
      isLoading: false,
      caseForm: {
        desc: "",
        code: "",
      },
      rules: {
        desc: [{ required: true, message: "用例描述不能为空", trigger: "blur" }],
      },
      savedId: "",
    };
  },
  methods: {
    editorInit() {
      require("brace/ext/language_tools");
      require("brace/mode/python");
      require("brace/theme/monokai");
      require("brace/snippets/python");
    },
    onResetForm() {
      this.$refs.caseFormRef.resetFields();
      this.isLoading = false;
      this.caseForm.desc = "";
      this.caseForm.code = "";
      this.$emit("update:addCaseDialogFormVisible", false);
    },
    getDetail() {
      this.$http.get(`/teprunner/cases/${this.id}`).then(({ data }) => {
        this.caseForm.desc = data.desc;
        this.caseForm.code = data.code + "\n";
      });
    },
    onSubmit() {
      this.$refs.caseFormRef.validate(valid => {
        if (valid) {
          this.isLoading = true;
          this.onRequest();
        }
      });
    },
    onRequest(type = "") {
      const { desc, code } = this.caseForm;
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let projectId = curProjectEnv.curProjectId;
      let creatorNickname = JSON.parse(localStorage.getItem("userInfo")).nickname;
      let params = {
        desc,
        code,
        creatorNickname,
        projectId,
      };
      let $method = "post";
      let $url = "/teprunner/cases";
      if (this.id) {
        $method = "put";
        $url = `/teprunner/cases/${this.id}`;
      }
      this.$http[$method]($url, params)
        .then(({ data: { id } }) => {
          this.savedId = id;
          this.$notifyMessage("保存成功", { type: "success" });
          this.onResetForm();
          this.$emit("success");
        })
        .finally(() => {
          this.isLoading = false;
          if (type === "run") {
            this.$emit("onRunCase", this.savedId);
          }
        });
    },
    onRunCase() {
      this.$refs.caseFormRef.validate(valid => {
        if (valid) {
          this.isLoading = true;
          this.onRequest("run");
        }
      });
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
