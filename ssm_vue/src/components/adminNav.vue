<template>
  <div class="app">
    <div class="sidebar">
      <div class="sidebar-header">
        <img src="../assets/images/logo.png" alt="花韵心语" class="logo" />
        <h2>花韵心语</h2>
      </div>
      <ul>
        <li><router-link to="/adminHome" active-class="active">首页</router-link></li>
        <li><router-link to="/userManage" active-class="active">用户管理</router-link></li>
        <li><router-link to="/flowerManage" active-class="active">鲜花管理</router-link></li>
        <li><router-link to="/orderManage" active-class="active">订单管理</router-link></li>
        <li><router-link to="/flowerHome">退出登录</router-link></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  display: flex;
}

.sidebar {
  position: fixed;  /* 固定在页面左侧 */
  top: 0;
  left: 0;
  width: 230px;
  background: linear-gradient(135deg, #ec6975, #fcb3b3); /* 渐变背景 */
  color: white;
  height: 100vh;
  padding-top: 30px;
  padding-bottom: 30px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  border-radius: 10px 0 0 10px;  /* 圆角 */
}

.sidebar-header {
  display: flex;
  align-items: center;  /* 垂直居中对齐 */
  justify-content: flex-start;  /* 将内容靠左对齐 */
  margin-bottom: 30px;
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 0 10px;  /* 在图片和标题之间添加一些间距 */
  color: #fff;
}

.sidebar-header img {
  width: 50px;
  height: 50px;
  border-radius: 50%;  /* 图片圆形 */
  margin-left: 20px;
}

.sidebar ul {
  list-style-type: none;  /* 去除默认小圆点 */
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 18px;
  text-align: center;
  margin-bottom: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.sidebar li:hover {
  background-color: #f84d5d;
  transform: translateZ(10px);
}

.sidebar li a {
  color: white;
  text-decoration: none;
  display: block;
  font-size: 16px;
  font-weight: 500;
}

/* 高亮当前链接 */
.sidebar li a.active {
  background-color: #f84d5d;
  color: white;
  font-size: 18px;  /* 高亮时字体大小和悬停时一致 */
  font-weight: 600;  /* 增强高亮的字体粗细 */
  display: block;
  border-radius: 5px;
}

.sidebar li a:hover {
  color: #fff;
}
</style>
