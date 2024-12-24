<template>
  <NavigationPage/>
  <div>
    <div class="regcontainer">
      <div class="form-side">
        <h1 class="navh">注册</h1>
        <form @submit.prevent="register">
          <div >
            <input type="text" v-model="username" required placeholder="用户名" class="formsys "/>
          </div>
          <div>
            <input type="password" v-model="password" required placeholder="密码" class="formsys"/>
          </div>
          <div>
            <input type="password" v-model="confirmPassword" required placeholder="确认密码" class="formsys"/>
          </div>
          <div>
            <input type="email" v-model="email" required placeholder="邮箱地址" class="formsys"/>
          </div>
          <p v-if="message" class="regmsg">{{ message }}</p>
          <button type="submit" class="submit-btn">注册账号</button>
        </form>
      </div>
    </div>
  </div>
  <FooterPage/>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const email = ref('');
const message = ref('');

const register = async () => {
  try {
    if (password.value !== confirmPassword.value) {
      message.value = '两次输入的密码不一致!';
      return;
    }
    const response = await axios.post('http://localhost:8080/api/users/register', {
      username: username.value,
      password: password.value,
      email: email.value
    });
    alert('注册成功!');
    router.push('/login');
    console.log(response.data);
  }
  catch (error) {
    if (error.response) {
      message.value = '注册失败: ' + error.response.data.message;
    } else if (error.request) {
      message.value = '请求已发送，但没有收到响应';
    } else {
      message.value = '注册失败: ' + error.message;
    }
  }
};

</script>


<style scoped>
.background-image {
  position: absolute;
  z-index: -5;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: 20px;
  font-size: larger;
}

.nav ul li {
  margin: 0 15px;
  margin-left: 20px;
}

.nav ul li a {
  color: white;
  text-decoration: none;
}

.regcontainer {
  display: flex;
  justify-content: center;
  align-items: stretch;
  margin-top: 200px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.image-side {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.side-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px 0 0 10px;
}

.form-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.navh {
  font-size: 2em;
  color: #FA7A48;
  font-weight: bold;
  letter-spacing: 10px;

}

.regmsg {
  color: red;
  font-size: 14px;
}

.formsys {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  font-size: 14px;
  color: #FA7A48;
  padding: 8px 0;
  margin-bottom: 15px;
  box-sizing: border-box;
  transition: border-color 0.4s ease;
  position: relative;
}

.formsys::placeholder {
  color: #ccc;
}

.formsys:focus {
  border-bottom: 2px solid #FA7A48;
}

.submit-btn {
  width: 300px;
  height: 40px;
  background-color: #FA7A48;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 3px 12px 0 rgba(255, 255, 255, 0.5);
  transition: background-color 0.3s ease;
  margin-bottom: 15px;
  transition: background-color 0.3s ease;
}

.submit-btn:hover, .back-btn:hover {
  background-color: #FA7A48;
  transform: scale(1.02);
}
</style>