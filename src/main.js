import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "./service/axios";
import Element from "element-ui";

import 'element-ui/lib/theme-chalk/index.css';
import "./assets/css/common.css";
import "./assets/css/font.css";

import IconFont from "@/components/IconFont.vue";
import "@/assets/iconfont/iconfont";
Vue.component("icon-font", IconFont);

import { onResponse, notifyMessage } from "./utils/commonMethods";
Vue.prototype.$notifyMessage = notifyMessage;
Vue.prototype.$handleResponese = onResponse;

import Pagination from "@/components/Pagination";
Vue.component("vue-pagination", Pagination);

import Highlight from "@/assets/js/highlight.js";
Vue.use(Highlight);

Vue.config.productionTip = false;

Vue.use(Element);
Vue.use(axios);

new Vue({
  router,
  render: h => h(App),
}).$mount("#app");
