const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "teprunner";
      return args;
    });
  },
  devServer: {
    proxy: {
      "/api": {
        target: process.env.VUE_APP_apiServer,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
  },
};
