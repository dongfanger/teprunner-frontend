const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: process.env.NODE_ENV === "development" ? "./" : "/",
  chainWebpack: config => {
    config.resolve.alias.set("@", resolve("src")).set("src", resolve("src"));
    config.plugin("html").tap(args => {
      args[0].title = "teprunner";
      return args;
    });
  },
  devServer: {
    publicPath: process.env.NODE_ENV === "development" ? "/" : "./",
    proxy: {
      "/api": {
        // target: "https://bf80bb80-b543-422e-b05c-28350a90c0aa.mock.pstmn.io",
        target: process.env.VUE_APP_apiServer,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
  },
};
