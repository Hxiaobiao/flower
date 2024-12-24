<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";

const userId = ref(sessionStorage.getItem('userId'));  // 从 sessionStorage 获取用户ID
const addresses = ref([]);  // 用于存储地址信息
const newAddress = ref({ name: '', phoneNumber: '', address: '', isDefault: 'false' });
const editedAddress = ref(null);

const router = useRouter();

console.log(userId)

// 获取用户的所有地址
const fetchAddresses = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/addresses/user/${userId.value}`);
    addresses.value = response.data;
  } catch (error) {
    console.error("获取地址失败:", error);
  }
};

// 添加新地址
const addAddress = async () => {
  try {
    const response = await axios.post("http://localhost:8080/api/addresses/add", newAddress.value);
    alert(response.data);
    fetchAddresses();  // 刷新地址列表
  } catch (error) {
    console.error("添加地址失败:", error);
  }
};

// 编辑地址
const editAddress = (address) => {
  editedAddress.value = { ...address };
};

// 更新地址
const updateAddress = async () => {
  try {
    const response = await axios.put(`http://localhost:8080/api/addresses/update/${editedAddress.value.id}`, editedAddress.value);
    alert(response.data);
    fetchAddresses();  // 刷新地址列表
  } catch (error) {
    console.error("更新地址失败:", error);
  }
};

// 删除地址
const deleteAddress = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/addresses/delete/${id}`);
    alert(response.data);
    fetchAddresses();  // 刷新地址列表
  } catch (error) {
    console.error("删除地址失败:", error);
  }
};

onMounted(() => {
  if (userId.value) {
    fetchAddresses();  // 加载用户地址
  } else {
    alert('用户未登录');
  }
});
</script>

<template>
  <NavigationPage />
  <div class="main">
    <h1>管理地址</h1>

    <div>
      <h3>新增地址</h3>
      <input v-model="newAddress.name" placeholder="收货人" />
      <input v-model="newAddress.phoneNumber" placeholder="手机号" />
      <input v-model="newAddress.address" placeholder="详细地址" />
      <select v-model="newAddress.isDefault">
        <option value="true">设为默认</option>
        <option value="false">不设为默认</option>
      </select>
      <button @click="addAddress">添加地址</button>
    </div>

    <div v-if="addresses.length > 0">
      <h3>已有地址</h3>
      <ul>
        <li v-for="address in addresses" :key="address.id">
          <p>{{ address.name }} - {{ address.phoneNumber }} - {{ address.address }} - {{ address.isDefault ? '默认' : '' }}</p>
          <button @click="editAddress(address)">编辑</button>
          <button @click="deleteAddress(address.id)">删除</button>
        </li>
      </ul>
    </div>

    <div v-if="editedAddress">
      <h3>编辑地址</h3>
      <input v-model="editedAddress.name" />
      <input v-model="editedAddress.phoneNumber" />
      <input v-model="editedAddress.address" />
      <select v-model="editedAddress.isDefault">
        <option value="true">设为默认</option>
        <option value="false">不设为默认</option>
      </select>
      <button @click="updateAddress">更新地址</button>
    </div>
  </div>
  <FooterPage />
</template>

<style scoped>
.main {
  margin-top: 50px;
  padding: 20px;
}

input, select {
  margin: 5px;
  padding: 8px;
  width: 300px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 15px;
}
</style>
