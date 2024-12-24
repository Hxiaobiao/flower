<template>
  <NavigationPage />
  <div class="main">
    <h1>我的订单</h1>

    <!-- 展示订单列表 -->
    <div v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-summary">
        <p><strong>订单编号:</strong> {{ order.id }}</p>
        <p><strong>订单状态:</strong> {{ order.status }}</p>
        <p><strong>商品名称:</strong> {{ order.flowerName }}</p>
        <p><strong>商品价格:</strong> {{ order.flowerPrice }} 元</p>
        <p><strong>数量:</strong> {{ order.quantity }} </p>
        <p><strong>总价:</strong> {{ order.totalPrice }} 元</p>
        <p><strong>购买时间:</strong> {{ formatDate(order.createAt) }}</p>
        <p><strong>收货人:</strong> {{ order.customerName }}</p>
        <p><strong>联系方式:</strong> {{ order.phoneNumber }}</p>
        <p><strong>收货地址:</strong> {{ order.deliveryAddress }}</p>
      </div>
    </div>
    <div v-else>
      <p>暂无订单。</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import NavigationPage from "@/components/NavigationPage.vue";

const orders = ref([]); // 用来存储所有订单
const userId = 1; // 假设当前用户的 ID 为 1（可以根据实际情况调整）

// 获取当前用户所有订单
const fetchAllOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/orders/all?userId=${userId}`);
    console.log(response.data);  // 打印响应数据
    orders.value = response.data;
  } catch (error) {
    console.error('获取订单列表失败:', error);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // 以本地格式展示日期
};

onMounted(fetchAllOrders);
</script>

<style scoped>
.main {
  margin-top: 50px;
  padding: 0 20px;
}

.order-summary {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.order-summary p {
  font-size: 18px;
}

.order-page ul {
  list-style-type: none;
  padding: 0;
}

.order-page li {
  margin-bottom: 20px;
}
</style>
