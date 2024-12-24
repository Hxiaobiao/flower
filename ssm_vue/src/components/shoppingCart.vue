<template>
  <NavigationPage />
  <h1 class="main">购物车页面</h1>
  <div v-if="cartItems.length === 0" class="empty-cart">
    <p>您的购物车为空。</p>
  </div>

  <div v-else>
    <ul class="cart-list">
      <li v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="cart-item-image">
          <img :src="item.imageUrl || '../assets/images/default-flower.png'" alt="flower image" class="cart-image" />
        </div>
        <div class="cart-item-details">
          <h2 class="cart-item-name">{{ item.flowerName || '未知鲜花' }}</h2>
          <p class="cart-item-price">{{ item.price || '未定价' }} 元</p>
          <p class="cart-item-quantity">数量: {{ item.quantity || 0 }}</p>
          <p class="cart-item-flowerLanguage">花语: {{ item.flowerLanguage || 0 }}</p>
          <p class="cart-item-category">种类: {{ item.category || 0 }}</p>
          <p class="cart-item-purpose">用途: {{ item.purpose || 0 }}</p>
          <p class="cart-item-material">花材: {{ item.material || 0 }}</p>
          <p class="cart-item-packing">包装: {{ item.packing || 0 }}</p>
          <p class="cart-item-stock">库存: {{ item.stock || 0 }}</p>
          <div class="cart-item-actions">
            <!-- 增加数量 -->
            <button @click="updateQuantity(item.id, item.quantity + 1)" class="update-btn">增加数量</button>
            <!-- 减少数量 -->
            <button @click="updateQuantity(item.id, item.quantity > 1 ? item.quantity - 1 : 0)" class="update-btn">减少数量</button>
            <button @click="removeFromCart(item.id)" class="remove-btn">删除</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import NavigationPage from "@/components/NavigationPage.vue";

const cartItems = ref([]);
// const userId = ref(5);
// 假设用户ID为1，实际应从登录状态中获取
// 从 sessionStorage 获取存储的 userId
const userId = ref(sessionStorage.getItem('userId')); // 如果 sessionStorage 中没有 userId，则使用默认值 5
console.log(userId.value);  // 打印用户ID

// 获取用户购物车
const fetchCart = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/cart/${userId.value}`);
    console.log(response.data);  // 打印返回的数据
    cartItems.value = response.data;
  } catch (error) {
    console.error('加载购物车失败:', error);
    alert('加载购物车失败，请稍后再试。');
  }
};

// 删除购物车项
const removeFromCart = async (id) => {
  try {
    await axios.delete(`http://localhost:8080/api/cart/${id}`);
    fetchCart();  // Reload cart after deletion
  } catch (error) {
    console.error('删除购物车项失败:', error);
    alert('删除失败，请稍后再试。');
  }
};

// 更新购物车项数量
const updateQuantity = async (id, newQuantity) => {
  try {
    await axios.put(`http://localhost:8080/api/cart/${id}`, {
      quantity: newQuantity,
    });
    fetchCart();  // Reload cart after updating quantity
  } catch (error) {
    console.error('更新数量失败:', error);
    alert('更新数量失败，请稍后再试。');
  }
};

onMounted(fetchCart);
</script>

<style scoped>
.main {
  margin-top: 50px;
  font-size: 24px;
  text-align: center;
}

.empty-cart {
  text-align: center;
  font-size: 18px;
}

.cart-list {
  list-style-type: none;
  padding: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 20px;
  margin: 10px 0;
}

.cart-item-image {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.cart-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item-details {
  flex-grow: 1;
}

.cart-item-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.cart-item-price {
  font-size: 18px;
  color: #ec6975;
  margin-bottom: 10px;
}

.cart-item-quantity {
  font-size: 16px;
  margin-bottom: 10px;
}

.cart-item-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.remove-btn {
  background-color: #ec6975;
  color: white;
}

.update-btn {
  background-color: #4caf50;
  color: white;
}

button:hover {
  opacity: 0.8;
}
</style>
