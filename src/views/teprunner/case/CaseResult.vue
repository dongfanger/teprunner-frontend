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
      socket: null,
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
        if (this.caseResultType === "run") {
          this.runCase();
        } else if (this.caseResultType === "view") {
          this.getResult();
        }
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
    runCase() {
      this.caseForm.result = "";
      this.caseForm.elapsed = "";
      this.caseForm.output = "";
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
        .then(({ data: { msg } }) => {
          this.$notifyMessage(msg, { type: "success" });
          this.getResult();
        })
        .finally(() => {});
    },
    getResult() {
      const _this = this;
      if (typeof WebSocket == "undefined") {
        this.$notifyMessage("当前浏览器不支持WebSocket，请使用谷歌浏览器！", { type: "warning" });
      } else {
        const socketUrl = `${process.env.VUE_APP_wsServer}/ws/teprunner/cases/${this.id}/result/`;
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = function() {
          // console.log("WebSocket Open");
          _this.socket.send(
            JSON.stringify({
              token: localStorage.getItem("token"),
            }),
          );
        };
        this.socket.onmessage = ({ data }) => {
          data = JSON.parse(data);
          _this.caseForm.desc = data.desc;
          _this.caseForm.creatorNickname = data.creatorNickname;
          _this.caseForm.result = data.result;
          _this.caseForm.elapsed = data.elapsed;
          _this.caseForm.output = data.output + "\n";
          _this.caseForm.runEnv = data.runEnv;
          _this.caseForm.runUserNickname = data.runUserNickname;
          _this.caseForm.runTime = data.runTime;
        };
        this.socket.onerror = function() {
          _this.$notifyMessage("WebSocket Error", { type: "error" });
        };
        this.socket.onclose = function() {
          // console.log("WebSocket Close");
        };
      }
    },
    getResultColor(res) {
      return resultColor(res);
    },
    close() {
      this.socket.close();
      this.onResetForm();
      this.$emit("onCloseCaseResult");
    },
    cancel() {
      this.socket.close();
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
