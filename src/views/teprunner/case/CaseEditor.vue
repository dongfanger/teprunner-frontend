<template>
  <div style="clear: both;" class="content-info">
    <el-form :model="caseForm" ref="caseFormRef" :rules="rules" label-width="100px" class="form-common" :inline="true">
      <el-form-item label="用例描述" prop="desc">
        <el-input
          type="textarea"
          v-model="caseForm.desc"
          placeholder="请输入用例描述"
          :rows="1"
          style="width:680px;"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="isLoading" style="margin-left: 20px">保 存</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="onResetForm">取 消</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="onRunCase">运 行</el-button>
      </el-form-item>
    </el-form>
    <editor
      v-model="caseForm.code"
      @init="editorInit"
      lang="python"
      theme="monokai"
      width="100%"
      :height="codeHeight"
      :options="{
        enableSnippets: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
      }"
    ></editor>
  </div>
</template>
<script>
export default {
  components: {
    editor: require("vue2-ace-editor"),
  },
  data() {
    return {
      codeHeight: window.innerHeight - 225,
      isLoading: false,
      caseForm: {
        desc: "",
        code: "",
      },
      rules: {
        desc: [{ required: true, message: "用例描述不能为空", trigger: "blur" }],
      },
      caseInfo: {
        id: "",
        caseResultType: "",
      },
      createdCaseId: "",
    };
  },
  created() {
    let caseInfo = localStorage.getItem("caseInfo");
    if (caseInfo) {
      this.caseInfo = JSON.parse(caseInfo);
      this.id = this.caseInfo.id;
    }
    if (this.id) {
      this.getDetail();
    }
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
      this.$router.push("/teprunner/case");
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
        .then(({ data }) => {
          this.createdCaseId = data.id;
          this.$notifyMessage("保存成功", { type: "success" });
          this.onResetForm();
          this.$emit("success");
        })
        .finally(() => {
          this.isLoading = false;
          if (type === "run") {
            this.caseInfo.id = this.createdCaseId;
            this.caseInfo.caseResultType = "run";
            localStorage.setItem("caseInfo", JSON.stringify(this.caseInfo));
            this.$router.push({
              name: "case.caseResult",
            });
          }
        });
    },
    onRunCase() {
      console.log("run...");
      this.$refs.caseFormRef.validate(valid => {
        if (valid) {
          console.log("really>");
          this.onRequest("run");
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.ace_editor {
  position: relative;
  overflow: hidden;
  font: 18px / normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace !important;
  direction: ltr;
  text-align: left;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
