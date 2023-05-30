<template>
  <el-container class="container">
    <el-aside class="aside" width="auto">
      <el-menu style="border: 0;" :default-active="activePath" class="auto-el-menu" :collapse="isCollapse"
        background-color="#00142a" text-color="white" active-text-color="white" :router="true">
        <slot name="menuItem"></slot>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <el-breadcrumb separator="/" style="margin-top: 20px">
          <el-breadcrumb-item @click.native="switchCollapse" style="cursor: pointer;">
            <icon-font iconClass="dakaisanshu"></icon-font>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-for="(crumb, index) in routePaths" :key="crumb.path"
            :to="!crumb.meta.disabled && index < routePaths.length - 1 && { path: changeUrl(crumb.path, index) }">
            {{ crumb.meta.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main style="padding: 0 20px!important;">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      isCollapse: false,
    };
  },
  computed: {
    activePath() {
      let pathArray = this.$route.path.split("/");
      return pathArray.slice(0, 3).join("/");
    },
    routePaths() {
      return this.$route.matched.filter(item => item.path && item.meta.title);
    },
  },
  methods: {
    switchCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    changeUrl(url, index) {
      if (index === this.routePaths.length - 1) {
        return "";
      }
      return url;
    },
  },
};
</script>
<style>
.container {
  height: 100%;
  text-align: left;
}

.container .aside {
  background-color: #00142a;
}

.container .aside .auto-el-menu:not(.el-menu--collapse) {
  width: 150px;
}
</style>
