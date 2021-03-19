import Vue from "vue";
import VueRouter from "vue-router";
import login from "@/views/login";
import home from "@/views/home";
import console from "@/views/console";
import teprunner from "@/views/teprunner";

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
    redirect: "teprunner/grammar",
    children: [
      {
        path: "teprunner",
        name: "teprunner",
        meta: {
          title: "接口自动化",
        },
        component: teprunner,
        redirect: "teprunner/grammar",
        children: [
          {
            path: "grammar",
            meta: {
              title: "语法说明",
            },
            component: () => import("@/views/teprunner/Grammar.vue"),
          },
          {
            path: "envVar",
            meta: {
              title: "环境变量",
            },
            component: () => import("@/views/teprunner/EnvVar.vue"),
          },
          {
            path: "fixture",
            meta: {
              title: "fixture",
            },
            component: () => import("@/views/teprunner/Fixture.vue"),
          },
        ],
      },
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
          {
            path: "projectManagement",
            meta: {
              title: "项目管理",
            },
            component: () => import("@/views/console/ProjectManagement.vue"),
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
