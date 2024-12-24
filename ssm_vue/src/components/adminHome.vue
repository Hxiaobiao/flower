<script setup>

import AdminNav from "@/components/adminNav.vue";
</script>

<template>
  <adminNav/>

  <div class="content">
    <h1>管理员首页</h1>
  </div>
  
  <img src="../assets/images/adminHome.png">

</template>

<style scoped>
.content {
  margin-left: 200px; /* 给内容区域添加左边距以避开固定侧边栏 */
  flex-grow: 1;
  overflow-y: auto; /* 内容区可以滚动 */
  padding: 20px;
  background-color: #f5f5f5;
}
</style>