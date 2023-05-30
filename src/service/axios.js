import axios from "axios";
import router from "@/router";
import { Notification } from "element-ui";
import { isJson } from "@/utils/commonMethods";

const clearCache = backCode => {
  let msg = backCode === 401 ? "登录失效，请重新登录" : "暂无权限，请重新登录";
  Notification({
    title: "请求失败",
    message: msg,
    type: "error",
  });
  localStorage.clear();
  router.push("/login");
};

export const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  responseType: "json",
  withCredentials: true,
  headers: {
    "content-type": "application/json;charset=UTF-8",
  },
});

axiosInstance.interceptors.request.use(config => {
  if (config.headers.Authorization !== "none") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    } else {
      clearCache(401);
    }
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (err.response) {
      let {
        response: { status, data },
      } = err;
      data = data || {};
      if ([401, 403].includes(status)) {
        setTimeout(() => {
          clearCache(status);
        }, 1000);
      } else {
        let msg = data.message || data.msg;
        if (isJson(data) && JSON.stringify(data) !== "{}") {
          msg = msg || data;
        }
        Notification({
          title: "提示",
          type: "error",
          message: msg || "服务器内部错误",
        });
      }
    }
    return Promise.reject(err);
  },
);

const install = Vue => {
  Object.defineProperty(Vue.prototype, "$http", { value: axiosInstance });
};

export default install;
