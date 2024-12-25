<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const showLoginModal = ref(false);
const showRegisterModal = ref(false);

const username = ref('');
const password = ref('');
const registerUsername = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');
const email = ref('');
const message = ref('');
const showLoginInfo = ref(false);
const agreeTerms = ref(false); // 新增：是否同意协议

// 判断用户是否已登录
const isLoggedIn = () => sessionStorage.getItem('userId') !== null;

const handleLogin = async () => {
  // if (!agreeTerms.value) {
  //   alert("请先同意《用户协议》和《隐私协议》");
  //   return;
  // }

  try {
    const response = await axios.post('http://localhost:8080/api/users/login', {
      username: username.value,
      password: password.value
    });

    // 如果状态码为 200，表示登录成功
    const data = response.data;

    // 处理登录逻辑
    sessionStorage.setItem("username", username.value);
    sessionStorage.setItem("userId", data.userId);

    alert("登录成功");

    if (data.role === "ADMIN") {
      router.push("/adminHome");
    } else if (data.role === "USER") {
      showLoginModal.value = false;
    }
  } catch (error) {
    // 根据 HTTP 状态码处理错误
    if (error.response && error.response.status === 401) {
      alert("用户名或密码错误");
    } else {
      alert("登录失败，请检查网络");
    }
  }
};

// 带验证的导航
const navigateWithAuth = (path) => {
  if (isLoggedIn()) {
    router.push(path);
  } else {
    alert('请先登录！');
    showLoginModal.value = true;
  }
};

const handleRegisterClick = () => {
  showLoginModal.value = false; // 关闭登录弹窗
  showRegisterModal.value = true; // 打开注册弹窗
};

const handleLoginClick = () => {
  showRegisterModal.value = false; // 关闭注册弹窗
  showLoginModal.value = true; // 打开登录弹窗
};


// 注册逻辑
const register = async () => {
  if (registerPassword.value !== confirmPassword.value) {
    message.value = '两次输入的密码不一致！';
    return;
  }

  try {
    await axios.post('http://localhost:8080/api/users/register', {
      username: registerUsername.value,
      password: registerPassword.value,
      email: email.value,
    });
    alert('注册成功！');
    showRegisterModal.value = false;
    showLoginModal.value = true; // 打开登录弹窗
  } catch (error) {
    message.value = error.response?.data?.message || '注册失败，请重试。';
  }
};
</script>

<template>
  <nav class="navbar navbar-default nav navbar-fixed-top h">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="#">
          <img src="../assets/logo.png" alt="花韵心语" class="logo" />
        </a>
      </div>

      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav">
          <li class="nav-title sr-only">花韵心语</li>
          <h1>flower</h1>
          <li>
            <RouterLink to="/flowerHome" class="nav-link">首页</RouterLink>
          </li>
          <li>
            <RouterLink to="/category" class="nav-link">分类</RouterLink>
          </li>
          <li>
            <a href="#" @click="navigateWithAuth('/shoppingCart')" class="nav-link">购物车</a>
          </li>
          <li>
            <a href="#" @click="navigateWithAuth('/order')" class="nav-link">订单</a>
          </li>
          <li>
            <a href="#" @click="navigateWithAuth('/collection')" class="nav-link">收藏</a>
          </li>
          <li>
            <a href="#" @click="navigateWithAuth('/userProfile')" class="nav-link">个人中心</a>
          </li>
          <li>
            <button class="nav-link btn btn-link" @click="showLoginModal = true">登录</button>
          </li>
          <li>
            <button class="nav-link btn btn-link" @click="showRegisterModal = true">注册</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- 登录弹窗 -->
  <div v-if="showLoginModal" class="login-modal-mask">
    <div class="login-modal-container">
      <div class="login-modal-left">
        <img src="../assets/logo.png" alt="花韵心语" class="logo" />
        <p>花开之处浪漫与心意悄然绽放</p>
        <button class="register-button" @click="handleRegisterClick">注册</button>
      </div>
      <div class="login-modal-right">
        <h3 class="login-title">用户登录</h3>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input type="text" placeholder="输入用户名" v-model="username" class="form-input" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="输入密码" v-model="password" class="form-input" required />
          </div>
          <div class="form-options">
            <label>
              <input type="checkbox" v-model="agreeTerms" class="ty"/>
              同意《用户协议》和《隐私协议》
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showLoginModal = false">取消</button>
            <button type="submit" class="login-button">登录</button>
          </div>

        </form>
      </div>
    </div>
  </div>

  <!-- 注册弹窗 -->
  <div v-if="showRegisterModal" class="login-modal-mask">
    <div class="login-modal-container">
      <div class="login-modal-left">
        <img src="../assets/logo.png" alt="花韵心语" class="logo" />
        <p>花开之处浪漫与心意悄然绽放</p>
        <button class="register-button" @click="handleLoginClick">登录</button>
      </div>
      <div class="login-modal-right">
        <h3 class="login-title">用户注册</h3>
        <form @submit.prevent="register" class="login-form">
          <div class="form-group">
            <input type="text" placeholder="输入用户名" v-model="registerUsername" class="form-input" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="输入密码" v-model="registerPassword" class="form-input" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="确认密码" v-model="confirmPassword" class="form-input" required />
          </div>
          <div class="form-group">
            <input type="email" placeholder="输入邮箱地址" v-model="email" class="form-input" required />
          </div>
          <div v-if="message" class="text-danger">{{ message }}</div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showRegisterModal = false">取消</button>
            <button type="submit" class="login-button">注册</button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>

<style scoped>
.logo {
  height: 60px;
  margin-top: 3px;
  margin-left: 60px;
}

.nav {
  background: linear-gradient(135deg, #ec6975, #fcb3b3);
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
  margin-right: 500px;
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

.login-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-modal-container {
  display: flex;
  flex-direction: row;
  width: 700px;
  height: 450px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.login-modal-left {
  flex: 1;
  background: #ff8993;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 15px;
}

.login-modal-left img {
  width: 150px;
  height: auto;
  margin-bottom: 10px;
  margin-right: 50px;
}

.login-modal-left p {
  font-size: 16px;
  margin-bottom: 20px;
  margin-left: 20px;
}

.register-button {
  background: #fff;
  color: #ec6975;
  border: none;
  padding: 12px 40px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.register-button:hover {
  font-size: 18px;
  font-weight: bold;
}

.login-modal-right {
  flex: 2;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  font-size: 30px;
  font-weight: bold;
  color: #ec6975;
  margin-bottom: 40px;
  text-align: center;
}

.form-input {
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-input:focus {
  border:2px solid #ec6975;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.cancel-button {
  padding: 12px 40px;
  background-color: #f2f2f2;
  color: #333;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #e6e6e6;
}

.login-button {
  padding: 12px 40px;
  background-color: #ec6975;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #ec6672;
  font-size: 18px;
}

.forgot-password{
  margin-left: 60px;
  font-size: 12px;
}

.form-options{
  font-size: 12px;
}
</style>
