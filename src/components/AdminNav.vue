<script setup>
const logout = () => {
  sessionStorage.clear();
};
</script>

<template>
  <div class="app">
    <div class="sidebar">
      <div class="sidebar-header">
        <img src="../assets/logo.png" alt="花韵心语" class="logo" />
      </div>
      <ul>
        <li><router-link to="/adminHome" active-class="active">首页</router-link></li>
        <li><router-link to="/userManage" active-class="active">用户管理</router-link></li>
        <li><router-link to="/flowerManage" active-class="active">花卉管理</router-link></li>
        <li><router-link to="/orderManage" active-class="active">订单管理</router-link></li>
        <li><router-link to="/flowerHome" @click="logout()">退出登录</router-link></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 230px;
  background: linear-gradient(135deg, #ec6975, #fcb3b3);
  color: white;
  height: 100vh;
  padding-top: 30px;
  padding-bottom: 30px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  border-radius: 10px 0 0 10px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.sidebar-header img {
  width: 180px;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 0;
}

.sidebar li a {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
  width: 100%;
  font-size: 18px;
  transition: background-color 0.3s ease, font-size 0.2s ease;
}

.sidebar li a:hover {
  background-color: #f84d5d;
  color: #fff;
}

.sidebar li a.active {
  background-color: #f84d5d;
  color: white;
  font-size: 20px;
  font-weight: 600;
}
</style>