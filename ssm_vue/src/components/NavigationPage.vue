<template>
  <nav class="navbar navbar-default nav navbar-fixed-top h">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="#">
          <img src="../assets/images/logo11.png" alt="花韵心语" class="logo" />
        </a>
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>

      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <form class="navbar-form navbar-left" @submit.prevent="performSearch">
          <div class="form-group search-group">
            <input type="text" class="form-control search-input" placeholder="请输入鲜花名称" v-model="searchQuery">
            <button type="submit" class="glyphicon glyphicon-search search-icon" style="cursor: pointer;"></button>
          </div>
        </form>
        <ul class="nav navbar-nav">
          <li class="nav-title sr-only">花韵心语</li>
          <li>
            <RouterLink to="/flowerHome" class="nav-link">首页</RouterLink>
          </li>
          <li>
            <RouterLink to="/category" class="nav-link">分类</RouterLink>
          </li>
          <li>
            <RouterLink to="/community" class="nav-link">花语社区</RouterLink>
          </li>
          <li>
            <RouterLink to="/shoppingCart" class="nav-link">购物车</RouterLink>
          </li>
          <li>
            <RouterLink to="/order" class="nav-link">订单</RouterLink>
          </li>
          <li>
            <RouterLink to="/collection" class="nav-link">收藏</RouterLink>
          </li>
          <li>
            <RouterLink to="/userProfile" class="nav-link">个人中心</RouterLink>
          </li>
          <li>
            <RouterLink to="/login" class="nav-link">登录</RouterLink>
          </li>
          <li>
            <RouterLink to="/register" class="nav-link">注册</RouterLink>
          </li>
        </ul>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useStore } from 'vuex';

const searchQuery = ref('');
const router = useRouter();
// const store = useStore();

const performSearch = () => {
  if (searchQuery.value.trim()) {
    // store.dispatch('search', searchQuery.value);
    // router.push({ path: '/searchResultsPage', query: { q: searchQuery.value } });
  }
};

const logout = () => {
  sessionStorage.clear();
};
</script>

<style scoped>
.logo {
  height: 60px;
  margin-top: 3px;
  margin-left: 60px;
}

.nav {
  background: linear-gradient(135deg, #ec6975, #fcb3b3); /* 渐变背景 */
}

.navbar {
  min-height: 70px;
}

.navbar {
  min-height: 80px;
  padding: 10px 20px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.navbar-brand {
  height: 80px;
  display: flex;
  align-items: center;
}

.navbar-nav > li > .nav-link {
  color: white !important;
  font-size: 18px;
  font-weight: bold;
  line-height: 80px;
  padding: 0 20px;
  transition: color 0.3s, background-color 0.3s;
  outline: none;
}

.navbar-nav > li > .nav-link:hover,
.navbar-nav > li > .nav-link:focus {
  color: #ec6975 !important;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.router-link-active {
  color: #ec6975 !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 5px;
}

.router-link-exact-active {
  color: #ec6975 !important;
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 5px;
}

.navbar-form {
  display: flex !important;
  align-items: center !important;
  margin-top: 20px !important;
}

.search-group {
  display: flex !important;
  position: relative !important;
}

.search-input {
  border-radius: 20px !important;
  padding: 10px 20px !important;
  border: 1px solid #ccc !important;
  box-shadow: none !important;
  outline: none !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
  padding-right: 40px !important;
  font-size: 14px !important;
  color: #ec6975 !important;
  width: 400px !important;
}

.search-input:focus {
  box-shadow: 0 0 20px rgba(215, 156, 230, 0.6) !important;
  border: 3px solid #ec6975 !important;
}

.search-icon {
  position: absolute !important;
  right: 15px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  color: #ec6975 !important;
  cursor: pointer !important;
  transition: color 0.3s !important;
  border: #fff;
  background-color: #fff;
}

.search-icon:hover {
  color: #ec6975 !important;
  border: 3px solid #ec6975 !important;
}

</style>
