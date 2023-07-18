<template>
  <div style="clear: both;" class="content-info">
    <el-form :model="caseForm" ref="caseFormRef" label-width="100px" class="form-common" :inline="true">
      <el-form-item label="用例描述" prop="desc">
        <el-input
          disabled
          type="textarea"
          v-model="caseForm.desc"
          placeholder="请输入用例描述"
          :rows="1"
          style="width:680px;"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onResetForm">返 回</el-button>
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
      id: "",
      caseForm: {
        desc: "",
        code: "",
      },
    };
  },
  created() {
    let caseViewId = localStorage.getItem("caseViewId");
    if (caseViewId) {
      this.id = caseViewId;
    }
    if (this.id) {
      this.getDetail();
    }
  },
  methods: {
    editorInit: function(editor) {
      require("brace/theme/monokai");
      require("brace/mode/python");
      editor.setReadOnly(true);
    },
    onResetForm() {
      this.$router.push("/teprunner/case");
    },
    getDetail() {
      this.$http.get(`/teprunner/cases/${this.id}`).then(({ data }) => {
        this.caseForm.desc = data.desc;
        this.caseForm.code = data.code + "\n";
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
