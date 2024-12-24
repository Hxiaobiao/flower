<template>
  <NavigationPage />
  <div class="main">
    <h1>鲜花首页</h1>

    <div v-if="flowers.length > 0" class="flower-list">
      <div
          v-for="flower in flowers"
          :key="flower.id"
          class="flower-item"
          @click="goToFlowerDetail(flower.id)"
      >
        <img :src="flower.imageUrl || '../assets/images/default-flower.png'" alt="鲜花图片" class="flower-image" />
        <div class="flower-details">
          <h2 class="flower-name">{{ flower.flowerName }}</h2>
          <p class="flower-price">{{ flower.price }} 元</p>
          <div class="button-group">
            <button @click.stop="addToCart(flower)" class="add-to-cart-btn">添加到购物车</button>
            <button @click.stop="addToCollection(flower)" class="add-to-collection-btn">
              {{ isFlowerInCollection(flower.id) ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>正在加载鲜花...</p>
    </div>
  </div>
  <FooterPage />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import axios from 'axios';

// 存储鲜花数据和收藏列表
const flowers = ref([]);
const collections = ref([]);
const router = useRouter();

// 获取当前用户ID
// const userId = 5; // 需要动态获取当前用户ID
const userId = sessionStorage.getItem('userId');

// 获取所有鲜花数据
const fetchFlowers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/flowers/all');
    flowers.value = response.data;
  } catch (error) {
    console.error('获取鲜花数据失败:', error);
  }
};

// 获取当前用户的收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/collections/user/${userId}`);
    // collections.value = response.data;
    // 确保 collections 是一个数组
    collections.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  }
};

// 判断商品是否已经收藏
const isFlowerInCollection = (flowerId) => {
  // return collections.value.some((collection) => collection.flowerId === flowerId);
  // 确保 collections 是一个数组
  return Array.isArray(collections.value) && collections.value.some((collection) => collection.flowerId === flowerId);

};

// 跳转到鲜花详情页
const goToFlowerDetail = (id) => {
  router.push({ name: 'flowerDetail', params: { id } });
};

// 添加到购物车
const addToCart = async (flower) => {
  try {
    const cartItem = {
      userId: userId,
      flowerId: flower.id,
      quantity: 1,
    };
    const response = await axios.post('http://localhost:8080/api/cart/add', cartItem);
    if (response.status === 200) {
      alert(`${flower.flowerName} 已添加到购物车！`);
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加到购物车失败，请重试。');
  }
};

// 添加到收藏
const addToCollection = async (flower) => {
  try {
    if (isFlowerInCollection(flower.id)) {
      alert(`${flower.flowerName} 已经在您的收藏中！`);
      return;
    }

    const collectionItem = {
      userId: userId,
      flowerId: flower.id,
    };

    const response = await axios.post('http://localhost:8080/api/collections/add', collectionItem);
    if (response.status === 200) {
      alert(`${flower.flowerName} 已收藏！`);
      fetchCollections();  // 更新收藏列表
    }
  } catch (error) {
    console.error('收藏失败:', error);
    alert('收藏失败，请重试。');
  }
};

// 在组件挂载后加载数据
onMounted(() => {
  fetchFlowers();
  fetchCollections();  // 获取用户的收藏列表
});
</script>

<style scoped>
.main {
  margin-top: 50px;
  padding: 0 20px;
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.flower-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  justify-items: center;
}

.flower-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flower-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.flower-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 2px solid #ec6975;
}

.flower-details {
  padding: 15px;
  text-align: center;
}

.flower-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.flower-price {
  font-size: 1rem;
  color: #ec6975;
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.add-to-cart-btn,
.add-to-collection-btn {
  padding: 8px 15px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn {
  background-color: #4caf50;
  color: white;
}

.add-to-cart-btn:hover {
  background-color: #45a049;
}

.add-to-collection-btn {
  background-color: #ec6975;
  color: white;
}

.add-to-collection-btn:hover {
  background-color: #d95e6a;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
  }

  .flower-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }

  .flower-item {
    width: 100%;
  }
}
</style>
