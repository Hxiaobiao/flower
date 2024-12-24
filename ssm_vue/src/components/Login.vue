<template>
  <div class="ctr">
    <NavigationPage/>
    <div class="container">
      <h1 class="h">用户登录</h1>
      <input type="text" v-model="username" required placeholder="用户名" class="name">
      <input type="password" v-model="password" required placeholder="密码" class="name">
      <p v-if="message" class="err">{{ message }}</p>
      <button @click="login" class="butt">登录</button>
      <span class="mm"><a href="#">忘记密码</a> | <router-link to="/register">注册账号</router-link></span>
    </div>
  </div>
  <div class="loginInfo" v-if="showLoginInfo">登录成功，即将跳转至首页,若没有自动跳转请单击<router-link :to="'/main'">此处</router-link></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios';
import NavigationPage from "@/components/NavigationPage.vue";

const router = useRouter()
const username = ref('')
const password = ref('')
const message = ref('')
const showLoginInfo = ref(false)

const login = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/users/login', {
      username: username.value,
      password: password.value
    });

    alert('登录成功');
    showLoginInfo.value = true;

    // 存储用户名到sessionStorage
    sessionStorage.setItem('username', username.value);

    const data = response.data;
    console.log(data);

    // 获取用户的 ID
    const userId = data.userId;
    if (userId) {
      // 将用户ID存储到sessionStorage
      sessionStorage.setItem('userId', userId);
    }

    // 根据用户角色进行页面跳转
    if (data.role === 'ADMIN') {
      router.push('/adminHome');
    } else if (data.role === 'USER') {
      router.push('/flowerHome');
    }

  } catch (error) {
    console.log("用户名:", username.value);
    console.log("密码:", password.value);

    if (error.response && error.response.status === 401) {
      message.value = error.response.data.message;
    } else if (error.request) {
      message.value = '登录失败: ' + error.message;
    } else {
      message.value = '登录失败: ' + error.message;
    }
  }
}


</script>


<style scoped>
.err{
  color: red;
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.background-image {
  position: absolute;
  z-index: -5;
  top: 0;
  left: 0;
  right: 0;
  bottom: -23px;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 20px;
  opacity: 0.9;
}

.h {
  color: #439D9E;
  margin-left: 15px;
  margin-bottom: 30px;
  font-weight: bold;
  letter-spacing: 3px;
}

.ctr{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  border: 5px solid #439D9E;
  margin-top: 26%;
  margin-left: 15%;
  padding: 12px;
  background-color: rgba(244, 248, 247, 0.6);
}

.butt {
  width: 300px;
  height: 3em;
  background: #439D9E;
  background-size: cover;
  border-radius: 10px;
  font-size: 18px;
  color: #ffffff;
  outline: none;
  margin-top: 5px;
  cursor: pointer;
  border: none;
  margin-bottom: 20px;
  transition: all 0.3s ease-in-out;
}

.butt:hover {
  background-color: #0f8688;
  transform: scale(1.02);
}

.name {
  width: 300px;
  height: 3em;
  vertical-align: top;
  background: #FFFFFF;
  border: 1.5px solid #439D9E;
  outline: none;
  font-size: 16px;
  color: #439D9E;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.name:focus{
  border: 2px solid #439D9E;
}

.mm{
  color: #439D9E !important;
  font-size: large;
  font-weight: bold;
}

.mm a,router-link{
  color: #439D9E !important;
  font-size: large;
  font-weight: bold;
}

/* ********************    媒体查询     *******************************************/
@media all and (max-width:768px) {
  * {
    box-sizing: border-box;
  }

  .bd {
    color: #300;
    font-size: 14px;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 20px;
  }

  .loading {
    margin-top: auto;
    width: 80%;
    display: flex;
  }

  .imageLoad {
    width: 80%;
    display: flex;
    justify-content: center;
  }

  .imageLoad img {
    width: 80%;
    max-width: 100%;
    height: auto;
  }

  .butt {
    width: 8em;
    height: 2em;
  }

  .name {
    width: 9em;
    height: 1em;
    vertical-align: top;
    background: #FFFFFF;
    border: 1px solid #d4d6d9;
    box-shadow: 0 3px 12px 0 rgba(19, 190, 44, 0.3);
    outline: none;
    font-size: 16px;
    color: #181e33;
    border-radius: 24px;
    padding: 1em;
    margin-bottom: 10px;
    box-sizing: border-box;
  }
}
</style>