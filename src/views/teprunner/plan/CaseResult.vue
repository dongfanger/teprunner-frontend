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
    <editor
      :value="this.caseForm.output"
      @init="editorInit"
      lang="text"
      theme="monokai"
      width="100%"
      :height="codeHeight"
    ></editor>
  </div>
</template>
<script>
export default {
  name: "CaseResult",
  data() {
    return {
      codeHeight: 1000,
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
    };
  },
  components: {
    editor: require("vue2-ace-editor"),
  },
  created() {
    let info = localStorage.getItem("caseInfo");
    this.caseInfo = JSON.parse(info) || {};
    this.getCaseResult();
  },
  methods: {
    editorInit: function(editor) {
      require("brace/theme/monokai");
      editor.setReadOnly(true);
      editor.getSession().setUseWrapMode(true);
    },
    getCaseResult() {
      this.$http
        .get(`/teprunner/plans/${this.caseInfo.planId}/cases/${this.caseInfo.caseId}/result`)
        .then(({ data }) => {
          this.caseForm.desc = data.caseDesc;
          this.caseForm.creatorNickname = data.caseCreatorNickname;
          this.caseForm.result = data.result;
          this.caseForm.elapsed = data.elapsed;
          this.caseForm.output = data.output;
          this.caseForm.runEnv = data.runEnv;
          this.caseForm.runUserNickname = data.runUserNickname;
          this.caseForm.runTime = data.runTime;
        });
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
  span.label {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
  }
}
.info-txt {
  margin-top: 16px;
  line-height: 28px;
  p {
    padding-right: 30px;
    position: relative;
    &::after {
      content: "";
      display: block;
      position: absolute;
      right: 15px;
      top: 6px;
      width: 1px;
      height: 16px;
      background: #e6e6ea;
    }
    float: left;
    &:first-child {
      padding-left: 0;
    }
    &:last-child::after {
      width: 0;
    }
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
