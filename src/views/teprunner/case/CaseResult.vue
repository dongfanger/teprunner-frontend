<template>
  <div>
    <div class="content-info">
      <div class="content-header">
        <div class="info-name">用例运行结果</div>
      </div>
      <div class="case-info-list">
        <div class="info-txt clear">
          <span class="label">用例描述：</span>
          {{ this.caseForm.desc }}
          <br />
          <p>
            <span class="label">创建人：</span>
            {{ this.caseForm.creatorNickname }}
          </p>
          <p>
            <span class="label">运行结果：</span>
            {{ this.caseForm.result }}
          </p>
          <p>
            <span class="label">运行耗时：</span>
            {{ this.caseForm.elapsed }}
          </p>
          <p>
            <span class="label">运行环境：</span>
            {{ this.caseForm.runEnv }}
          </p>
          <p>
            <span class="label">运行人：</span>
            {{ this.caseForm.runUserNickname }}
          </p>
          <p>
            <span class="label">运行时间：</span>
            {{ this.caseForm.runTime }}
          </p>
        </div>
      </div>
    </div>
    <editor :value="this.caseForm.output" @init="editorInit" lang="text" theme="monokai" width="100%"
      :height="codeHeight"></editor>
  </div>
</template>
<script>
export default {
  name: "CaseResult",
  data() {
    return {
      codeHeight: window.innerHeight - 315,
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
      id: null,
      caseInfo: null,
    };
  },
  components: {
    editor: require("vue2-ace-editor"),
  },
  created() {
    let info = localStorage.getItem("caseInfo");
    this.caseInfo = JSON.parse(info) || {};
    this.id = this.caseInfo.id;
    if (this.id) {
      if (this.caseInfo.caseResultType === "run") {
        this.runCase();
        this.caseInfo.caseResultType = "view";
        localStorage.setItem("caseInfo", JSON.stringify(this.caseInfo));
      } else if (this.caseInfo.caseResultType === "view") {
        this.getResult();
      }
    }
  },
  methods: {
    editorInit: function (editor) {
      require("brace/theme/monokai");
      editor.setReadOnly(true);
      editor.getSession().setUseWrapMode(true);
    },
    onResetForm() {
      this.caseForm.desc = "";
      this.caseForm.creatorNickname = "";
      this.caseForm.result = "";
      this.caseForm.elapsed = "";
      this.caseForm.output = "";
      this.caseForm.runEnv = "";
      this.caseForm.runUserNickname = "";
      this.caseForm.runTime = "";
      this.$router.push("/teprunner/case");
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
        .finally(() => { });
    },
    getResult() {
      const _this = this;
      if (typeof WebSocket == "undefined") {
        this.$notifyMessage("当前浏览器不支持WebSocket，请使用谷歌浏览器！", { type: "warning" });
      } else {
        const socketUrl = `${process.env.VUE_APP_wsServer}/ws/teprunner/cases/${this.id}/result/`;
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = function () {
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
        this.socket.onerror = function () {
          _this.$notifyMessage("WebSocket Error", { type: "error" });
        };
        this.socket.onclose = function () {
          // console.log("WebSocket Close");
        };
      }
    },
    destroyed() {
      this.socket.close();
      this.onResetForm();
    },
  },
};
</script>
<style>
.form-box {
  margin-top: 16px;
}

.form-box .custom-size .el-form-item__content,
.custom-size .el-select,
.custom-size .el-select>.el-input {
  width: 380px;
}

.case-info-list {
  margin: 0 24px;
}

.case-name {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  margin-top: 10px;
}

.case-info-list {
  font-size: 14px;
  line-height: 20px;
  padding-bottom: 32px;
  color: rgba(0, 0, 0, 0.65);
}

.case-info-list span.label {
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}

.info-txt {
  margin-top: 16px;
  line-height: 28px;
}

.info-txt p {
  padding-right: 30px;
  position: relative;
  float: left;
}

.info-txt p ::after {
  content: "";
  display: block;
  position: absolute;
  right: 15px;
  top: 6px;
  width: 1px;
  height: 16px;
  background: #e6e6ea;
}

.info-txt p :first-child {
  padding-left: 0;
}

.info-txt p :last-child::after {
  width: 0;
}

.ace_editor {
  position: relative;
  overflow: hidden;
  font: 18px / normal "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace !important;
  direction: ltr;
  text-align: left;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}</style>
