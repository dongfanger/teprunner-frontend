import Vue from "vue";
import VueRouter from "vue-router";
import login from "@/views/login";
import home from "@/views/home";
import console from "@/views/console";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    meta: {
      title: "测试平台登录",
    },
    component: login,
  },
  {
    path: "/",
    name: "home",
    meta: {
      requireAuth: true,
    },
    component: home,
    redirect: "console/userManagement",
    children: [
      {
        path: "console",
        name: "console",
        meta: {
          title: "后台管理",
        },
        component: console,
        redirect: "console/userManagement",
        children: [
          {
            path: "userManagement",
            meta: {
              title: "用户管理",
            },
            component: () => import("@/views/console/userManagement.vue"),
          },
        ],
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(auth => auth.meta.requireAuth)) {
    let token = localStorage.getItem("token");
    if (token) {
      next();
    } else {
      next({
        path: "/login",
      });
    }
  } else {
    next();
  }
});
export default router;
