<template>
  <div class="content-info">
    <div class="content-header">
      <div class="info-name">
        基本信息
      </div>
    </div>
    <el-form class="form-box" label-width="124px" ref="form" :model="form" :rules="rules">
      <el-form-item class="custom-size" prop="name" label="计划名称">
        <el-input v-model="form.name" placeholder="请输入计划名称"></el-input>
      </el-form-item>
      <el-form-item class="custom-size"></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :loading="saving">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        name: "",
      },
      rules: {
        name: [{ required: true, message: "请输入计划名称", trigger: "blur" }],
      },
      saving: false,
      planId: "",
    };
  },
  created() {
    let planInfo = localStorage.getItem("planInfo");
    if (planInfo) {
      planInfo = JSON.parse(planInfo);
      this.planId = planInfo.id;
      this.form.name = planInfo.name;
    }
  },
  methods: {
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saving = true;
          this.form.name = this.form.name.trim();
          let curProjectEnv = JSON.parse(localStorage.getItem("curProjectEnv"));
          let projectId = curProjectEnv.curProjectId;
          let param = {
            name: this.form.name,
            projectId,
          };
          if (this.planId) {
            let url = `/teprunner/plans/${this.planId}`;
            this.$http.put(url, param).then(() => {
              this.back();
              this.$notifyMessage("修改计划成功", { type: "success" });
            });
          } else {
            let url = `/teprunner/plans`;
            this.$http.post(url, param).then(() => {
              this.back();
              this.$notifyMessage("新增计划成功", { type: "success" });
            });
          }
          this.saving = false;
        } else {
          return false;
        }
      });
    },
    back() {
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/ .form-box {
  margin-top: 16px;
  .custom-size .el-form-item__content,
  .custom-size .el-select,
  .custom-size .el-select > .el-input {
    width: 380px;
  }
}
</style>
