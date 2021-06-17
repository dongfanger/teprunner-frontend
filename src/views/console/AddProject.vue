<template>
  <div class="page-wrap">
    <el-dialog :title="dialogTitle" :visible="visible" width="600px" :close-on-click-modal="false" @close="onResetForm">
      <el-form :model="projectForm" ref="projectFormRef" :rules="rules" label-width="100px" class="form-common">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" class="input-380"></el-input>
        </el-form-item>
        <el-form-item label="环境配置" prop="envConfig">
          <el-input
            v-model="projectForm.envConfig"
            placeholder="请输入环境英文名（多个环境英文逗号分隔）"
            class="input-380"
          ></el-input>
        </el-form-item>
        <el-form-item label="Git仓库" prop="gitRepository">
          <el-input v-model="projectForm.gitRepository" placeholder="请输入代码仓库地址" class="input-380"></el-input>
        </el-form-item>
        <el-form-item label="Git分支" prop="gitBranch">
          <el-input v-model="projectForm.gitBranch" placeholder="请输入代码拉取分支" class="input-380"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onResetForm">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="isLoading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AddProject",
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
  data() {
    return {
      isLoading: false,
      projectForm: {
        name: "",
        desc: "",
        leader: "",
        envConfig: "",
        gitRepository: "",
        gitBranch: "",
      },
      rules: {
        name: [{ required: true, message: "项目名称不能为空", trigger: "blur" }],
        envConfig: [{ required: true, message: "环境配置不能为空", trigger: "blur" }],
      },
    };
  },
  methods: {
    getDetail() {
      this.$http.get(`/teprunner/projects/${this.id}`).then(({ data }) => {
        this.projectForm.name = data.name;
        this.projectForm.envConfig = data.envConfig;
        this.projectForm.gitRepository = data.gitRepository;
        this.projectForm.gitBranch = data.gitBranch;
      });
    },
    onResetForm() {
      this.$refs.projectFormRef.resetFields();
      this.isLoading = false;
      this.projectForm.name = "";
      this.projectForm.env = "";
      this.projectForm.gitRepository = "";
      this.projectForm.gitBranch = "";
      this.$emit("update:dialogFormVisible", false);
    },
    onSubmit() {
      this.$refs.projectFormRef.validate(valid => {
        if (valid) {
          this.projectForm.name = this.projectForm.name.trim();
          this.projectForm.envConfig = this.projectForm.envConfig.trim();
          this.projectForm.gitRepository = this.projectForm.gitRepository.trim();
          this.projectForm.gitBranch = this.projectForm.gitBranch.trim();
          this.isLoading = true;
          this.onRequest();
        }
      });
    },
    onRequest() {
      const { name, envConfig, gitRepository, gitBranch } = this.projectForm;
      let params = {
        name,
        envConfig,
        gitRepository,
        gitBranch,
      };
      let $method = "post";
      let $url = "/teprunner/projects";
      if (this.id) {
        $method = "put";
        $url = `/teprunner/projects/${this.id}`;
      }
      this.$http[$method]($url, params)
        .then(() => {
          this.$notifyMessage("项目保存成功，请重新登录", { type: "success" });
          this.onResetForm();
          this.$emit("success");
          this.logout();
        })
        .finally(() => {
          this.isLoading = false;
          localStorage.removeItem("projectEnvList");
        });
    },
    logout() {
      let loginInfo = localStorage.getItem("loginInfo");
      let oldLoginTime = localStorage.getItem("loginTime");
      localStorage.clear();
      if (oldLoginTime) {
        localStorage.setItem("loginTime", new Date().getTime().toLocaleString());
      }
      if (loginInfo) {
        loginInfo = JSON.parse(loginInfo);
        loginInfo.userPWD = "";
        localStorage.setItem("loginInfo", JSON.stringify(loginInfo));
      }
      this.$router.push("/login");
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
</style>
