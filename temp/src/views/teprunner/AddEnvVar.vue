<template>
  <div class="page-wrap">
    <el-dialog :title="dialogTitle" :visible="visible" width="600px" :close-on-click-modal="false" @close="onResetForm">
      <el-form :model="envVarForm" ref="envVarFormRef" :rules="rules" label-width="100px" class="form-common">
        <el-form-item label="变量名" prop="name">
          <el-input v-model="envVarForm.name" placeholder="请输入变量名" class="input-380"></el-input>
        </el-form-item>
        <el-form-item label="变量值" prop="value">
          <el-input v-model="envVarForm.value" placeholder="请输入变量值" class="input-380"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="envVarForm.desc" placeholder="请输入描述" class="input-380"></el-input>
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
  name: "AddEnvVar",
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
      envVarForm: {
        name: "",
        value: "",
        desc: "",
      },
      rules: {
        name: [{ required: true, message: "变量名不能为空", trigger: "blur" }],
        value: [{ required: true, message: "变量值不能为空", trigger: "blur" }],
        desc: [{ required: true, message: "描述不能为空", trigger: "blur" }],
      },
    };
  },
  methods: {
    getDetail() {
      this.$http.get(`/teprunner/envvars/${this.id}`).then(({ data }) => {
        this.envVarForm.name = data.name;
        this.envVarForm.value = data.value;
        this.envVarForm.desc = data.desc;
      });
    },
    onResetForm() {
      this.$refs.envVarFormRef.resetFields();
      this.isLoading = false;
      this.envVarForm.name = "";
      this.envVarForm.value = "";
      this.envVarForm.desc = "";
      this.$emit("update:dialogFormVisible", false);
    },
    onSubmit() {
      this.$refs.envVarFormRef.validate(valid => {
        if (valid) {
          this.envVarForm.name = this.envVarForm.name.trim();
          this.envVarForm.value = this.envVarForm.value.trim();
          this.envVarForm.desc = this.envVarForm.desc.trim();
          this.isLoading = true;
          this.onRequest();
        }
      });
    },
    onRequest() {
      const { name, value, desc } = this.envVarForm;
      let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
      let curProjectId = curProjectEnv.curProjectId;
      let curEnvName = curProjectEnv.curEnvName;
      let params = {
        curProjectId,
        curEnvName,
        name,
        value,
        desc,
      };
      let $method = "post";
      let $url = "/teprunner/envvars";
      if (this.id) {
        $method = "put";
        $url = `/teprunner/envvars/${this.id}`;
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
</style>
