<template>
  <div>
    <NavigationPage />
    <div class="main">
      <h1>我的收藏</h1>

      <div v-if="collections.length > 0" class="collection-list">
        <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-item"
            @click="goToFlowerDetail(collection.flowerId)"
        >
          <img :src="collection.imageUrl || '../assets/images/default-flower.png'" alt="鲜花图片" class="cart-image" />
          <div class="collection-details">
            <h2>{{ collection.flowerName }}</h2>
            <p>价格：{{ collection.price }} 元</p>
            <p>花语：{{ collection.flowerLanguage }}</p>
            <p>分类：{{ collection.category }}</p>
            <p>用途：{{ collection.purpose }}</p>
            <button @click="removeFromCollection(collection.flowerId)" class="remove-btn">移除收藏</button>
          </div>
        </div>
      </div>

      <div v-else>
        <p>没有收藏任何商品</p>
      </div>
    </div>
    <FooterPage />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NavigationPage from '@/components/NavigationPage.vue';
import FooterPage from '@/components/FooterPage.vue';
import router from "@/router/index.js";

// 存储收藏列表
const collections = ref([]);

// 获取当前登录用户的ID
// const userId = 5; // 需要替换为动态获取当前登录用户的ID
const userId = sessionStorage.getItem('userId');
console.log(userId);  // 打印用户ID

// 获取收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/collections/user/${userId}`);
    collections.value = response.data;
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  }
};

// 根据鲜花ID获取鲜花详细信息
const getFlowerImage = async (flowerId) => {
  const response = await axios.get(`http://localhost:8080/api/flowers/${flowerId}`);
  return response.data.imageUrl || '../assets/images/default-flower.png';
};

// 移除收藏
const removeFromCollection = async (flowerId) => {
  try {
    await axios.delete(`http://localhost:8080/api/collections/remove/${userId}/${flowerId}`);
    // 从列表中移除已删除的收藏
    collections.value = collections.value.filter((collection) => collection.flowerId !== flowerId);
  } catch (error) {
    console.error('移除收藏失败:', error);
  }
};

// 跳转到鲜花详情页
const goToFlowerDetail = (id) => {
  router.push({ name: 'flowerDetail', params: { id } });
};


// 在组件挂载后加载数据
onMounted(fetchCollections);
</script>

<style scoped>
.main {
  margin-top: 100px;
  padding: 0 20px;
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.collection-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.collection-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.collection-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.cart-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #ec6975;
}

.collection-details {
  padding: 15px;
  text-align: center;
}

.collection-details h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.collection-details p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.remove-btn {
  margin-top: 15px;
  background-color: #ec6975;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background-color: #d95e6a;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
  }

  .collection-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
