<template>
  <div style="height: 100%; overflow: auto;">
    <div style="text-align: left; font-size: 14px; margin-left: 20px">
      <br />
      <br />
      <h1><span style="color: darkred">本平台只支持用例编排运行，无法编辑，真正实现接口自动化80%本地编写，20%交由平台管理的平衡、高效理念</span></h1>
      <br />
      <br />
      <h3>
        <span style="background-color:#FFE500;">教程</span>
      </h3>
      <br />
      <p>
        <a href="https://dongfanger.gitee.io/blog/" target="_blank">https://dongfanger.gitee.io/blog/</a>
      </p>
      <br />
      <h3>
        <span style="background-color:#FFE500;">下载</span>
      </h3>
      <br />
      <p>
        <a href="#" @click="scaffold"><b>项目脚手架</b></a>，开启pytest本地编写接口自动化用例之旅！
        <br />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Workspace",
  methods: {
    scaffold() {
      let params = {};
      this.$http
          .post(`/teprunner/scaffold`, params, { responseType: "blob" })
          .then(res => {
            let blob = new Blob([res.data], { type: "application/zip" });
            let url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = res.headers["content-disposition"].split("=")[1];
            link.click();
            URL.revokeObjectURL(url);
            window.URL.revokeObjectURL(url);
          })
    },
  },
};
</script>

<style>
pre {
  width: 800px;
  margin-top: 10px;
}
</style>
