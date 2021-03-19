<template>
  <NavLeft>
    <div slot="menuItem">
      <el-menu-item index="/console/userManagement">
        <i class="el-icon-edit-outline"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-menu-item index="/console/projectManagement">
        <i class="el-icon-edit-outline"></i>
        <span slot="title">项目管理</span>
      </el-menu-item>
    </div>
  </NavLeft>
</template>
<script>
import NavLeft from "@/components/NavLeft";

export default {
  components: {
    NavLeft,
  },
};
</script>
