<template>
  <div style="clear: both;" class="content-info">
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
          style="width: 300px;"
        ></el-input>
      </el-form-item>
      <el-form-item label="说明" prop="desc">
        <el-input
          v-model="fixtureForm.desc"
          placeholder="请输入 fixture 说明"
          :rows="1"
          style="width: 350px"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style="margin-left: 30px" type="primary" @click="onSubmit" :loading="isLoading">保 存</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="onResetForm">取 消</el-button>
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
      fixtureForm: {
        name: "",
        desc: "",
        code: "",
      },
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        desc: [{ required: true, message: "说明不能为空", trigger: "blur" }],
      },
      id: null,
    };
  },
  created() {
    let fixtureInfo = localStorage.getItem("fixtureInfo");
    if (fixtureInfo) {
      fixtureInfo = JSON.parse(fixtureInfo);
      this.id = fixtureInfo.id;
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
      this.$refs.fixtureFormRef.resetFields();
      this.isLoading = false;
      this.fixtureForm.name = "";
      this.fixtureForm.desc = "";
      this.fixtureForm.code = "";
      this.back();
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
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    back() {
      this.$router.go(-1);
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
