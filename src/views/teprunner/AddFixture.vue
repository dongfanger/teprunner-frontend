<template>
  <div class="page-wrap">
    <el-dialog
      :title="dialogTitle"
      :visible="visible"
      width="70%"
      style="margin-left: 5%; margin-top: -5%;"
      :close-on-click-modal="false"
      @close="onResetForm"
    >
      <el-form
        :model="fixtureForm"
        ref="fixtureFormRef"
        :rules="rules"
        label-width="100px"
        class="form-common"
        :inline="true"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="fixtureForm.name"
            placeholder="请输入 fixture 名称"
            :rows="1"
            style="width: 300px"
          ></el-input>
        </el-form-item>
        <el-form-item label="说明" prop="desc">
          <el-input
            v-model="fixtureForm.desc"
            placeholder="请输入 fixture 说明"
            :rows="1"
            style="width: 700px"
          ></el-input>
        </el-form-item>
      </el-form>
      <editor
        v-model="fixtureForm.code"
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="onResetForm">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isLoading">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AddFixture",
  props: {
    dialogTitle: {
      type: String,
      default: "新增",
    },
    dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    id: {
      default: "",
    },
  },
  computed: {
    visible() {
      return this.dialogFormVisible;
    },
  },
  watch: {
    dialogFormVisible(val) {
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
      codeHeight: 700,
      isLoading: false,
      fixtureForm: {
        name: "",
        desc: "",
        code: "",
      },
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        desc: [{ required: true, message: "说明不能为空", trigger: "blur" }],
      },
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
      this.$refs.fixtureFormRef.resetFields();
      this.isLoading = false;
      this.fixtureForm.name = "";
      this.fixtureForm.desc = "";
      this.fixtureForm.code = "";
      this.$emit("update:dialogFormVisible", false);
    },
    getDetail() {
      this.$http.get(`/teprunner/fixtures/${this.id}`).then(({ data }) => {
        this.fixtureForm.name = data.name;
        this.fixtureForm.desc = data.desc;
        this.fixtureForm.code = data.code;
      });
    },
    onSubmit() {
      this.$refs.fixtureFormRef.validate(valid => {
        if (valid) {
          this.isLoading = true;
          this.onRequest();
        }
      });
    },
    onRequest() {
      const { name, desc, code } = this.fixtureForm;
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));
      let creatorNickname = userInfo.nickname;
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let curProjectId = curProjectEnv.curProjectId;
      let params = {
        curProjectId,
        name,
        desc,
        code,
        creatorNickname,
      };
      let $method = "post";
      let $url = "/teprunner/fixtures";
      if (this.id) {
        $method = "put";
        $url = `/teprunner/fixtures/${this.id}`;
      }
      this.$http[$method]($url, params)
        .then(() => {
          this.$notifyMessage("保存成功", { type: "success" });
          this.onResetForm();
          this.$emit("success");
        })
        .finally(() => {
          this.isLoading = false;
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
