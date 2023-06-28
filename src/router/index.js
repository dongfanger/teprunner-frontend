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
    redirect: "teprunner/workspace",
    children: [
      {
        path: "teprunner",
        name: "teprunner",
        meta: {
          title: "接口自动化",
        },
        component: teprunner,
        redirect: "teprunner/workspace",
        children: [
          {
            path: "workspace",
            meta: {
              title: "工作台",
            },
            component: () => import("@/views/teprunner/Workspace.vue"),
          },
          {
            path: "case",
            name: "case",
            meta: {
              title: "用例管理",
            },
            component: () => import("@/views/teprunner/case/CaseManagement.vue"),
            children: [
              {
                path: "caseView",
                name: "caseView",
                meta: {
                  title: "查看用例",
                },
                component: () => import("@/views/teprunner/case/CaseView"),
              },
              {
                path: "caseResult",
                name: "case.caseResult",
                meta: {
                  title: "用例运行结果",
                },
                component: () => import("@/views/teprunner/case/CaseResult"),
              },
            ],
          },
          {
            path: "plan",
            name: "plan",
            meta: {
              title: "测试计划",
            },
            component: () => import("@/views/teprunner/plan/PlanManagement.vue"),
            children: [
              {
                path: "addPlan",
                name: "addPlan",
                meta: {
                  title: "添加计划",
                },
                component: () => import("@/views/teprunner/plan/PlanEditor"),
              },
              {
                path: "editPlan",
                name: "editPlan",
                meta: {
                  title: "编辑计划",
                },
                component: () => import("@/views/teprunner/plan/PlanEditor"),
              },
              {
                path: "caseList",
                name: "caseList",
                meta: {
                  title: "用例列表",
                },
                component: () => import("@/views/teprunner/plan/CaseList"),
              },
              {
                path: "planResult",
                name: "planResult",
                meta: {
                  title: "计划运行结果",
                },
                component: () => import("@/views/teprunner/plan/PlanResult"),
                children: [
                  {
                    path: "caseResult",
                    name: "plan.caseResult",
                    meta: {
                      title: "用例运行结果",
                    },
                    component: () => import("@/views/teprunner/plan/CaseResult"),
                  },
                ],
              },
            ],
          },
          {
            path: "gitSync",
            meta: {
              title: "Git同步",
            },
            component: () => import("@/views/teprunner/GitSync.vue"),
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
