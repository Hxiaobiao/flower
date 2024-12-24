<template>
  <div>
    <NavigationPage />

    <!-- 鲜花详情展示 -->
    <div class="flower-detail">
      <h1>鲜花详情</h1>

      <div v-if="flower" class="flower-info">
        <img :src="flower.imageUrl || '../assets/images/default-flower.png'" alt="鲜花图片" class="flower-image" />
        <div class="flower-details">
          <h2>{{ flower.flowerName }}</h2>
          <p class="flower-price">{{ flower.price }} 元</p>
          <p><strong>花语:</strong> {{ flower.flowerLanguage }}</p>
          <p><strong>种类:</strong> {{ flower.category }}</p>
          <p><strong>用途:</strong> {{ flower.purpose }}</p>
          <p><strong>花材:</strong> {{ flower.material }}</p>
          <p><strong>包装:</strong> {{ flower.packing }}</p>

          <button @click.stop="addToCollection(flower)" class="add-to-collection-btn">
            {{ isFlowerInCollection(flower.id) ? '已收藏' : '收藏' }}
          </button>

          <button @click.stop="addToCart(flower)" class="add-to-cart-btn">添加到购物车</button>

          <!-- 提交订单按钮 -->
          <button @click="openOrderModal" class="submit-order-btn">提交订单</button>
        </div>
      </div>

      <div v-else>
        <p>正在加载鲜花详情...</p>
      </div>
    </div>

    <!-- 订单弹窗 -->
    <div v-if="showOrderModal" class="order-modal">
      <div class="modal-content">
        <h2>订单详情</h2>

        <label for="address"><strong>送货信息:</strong></label>
        <!-- 送货下拉选择 -->
        <select v-model="order.addressId" id="address" required>
          <option v-for="address in userAddresses" :key="address.id" :value="address.id">
            {{ address.name }} - {{ address.phoneNumber }} - {{ address.address }}
          </option>
        </select>
        <br>
        <label for="quantity"><strong>数量:</strong></label>
        <input type="number" id="quantity" v-model="order.quantity" min="1" />

        <p><strong>价格:</strong> {{ flower.price }} 元</p>
        <p><strong>总价:</strong> {{ calculateTotalPrice() }} 元</p>

        <button @click="confirmOrder" class="confirm-order-btn">确认订单</button>
        <button @click="closeOrderModal" class="close-modal-btn">关闭</button>
      </div>
    </div>

    <FooterPage />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import axios from 'axios';

// 获取当前鲜花的 ID
const route = useRoute();
const flowerId = route.params.id;  // 从路由参数中获取鲜花 ID

// 存储鲜花详情数据
const flower = ref(null);
const collections = ref([]);
const order = ref({
  customerName: '',
  phoneNumber: '',
  addressId: null,
  quantity: 1,  // 默认数量为 1
  flowerName: '',
  flowerPrice: 0,
});
const showOrderModal = ref(false);

// 用户地址
const selectedAddressId = ref(null); // 当前选中的地址ID
const userAddresses = ref([]); // 用户的所有地址

// 获取鲜花详细信息
const fetchFlowerDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/flowers/${flowerId}`);
    flower.value = response.data;
  } catch (error) {
    console.error('获取鲜花详情失败:', error);
  }
};

// 获取当前用户的收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/collections/user/${userId}`);
    collections.value = response.data;
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  }
};

// 获取用户地址列表
const fetchUserAddresses = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/addresses/user/${userId}`);
    userAddresses.value = response.data;
    if (userAddresses.value.length > 0) {
      order.value.addressId = userAddresses.value[0].id; // 默认选择第一个地址
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
};

// 判断商品是否已经收藏
const isFlowerInCollection = (flowerId) => {
  return collections.value.some((collection) => collection.flowerId === flowerId);
};

// 获取当前用户ID
const userId = sessionStorage.getItem('userId');

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

// 提交订单时打开弹窗
// 提交订单时打开弹窗
const openOrderModal = async () => {
  try {
    if (!order.value.addressId) {
      alert('请先选择送货地址');
      return;
    }

    // 确保鲜花数据已加载
    if (!flower.value || !flower.value.flowerName || !flower.value.price) {
      alert('鲜花信息未加载完全，请稍后再试');
      return;
    }

    // 获取用户选择的地址信息
    const selectedAddress = userAddresses.value.find(address => address.id === order.value.addressId);
    order.value.customerName = selectedAddress.name;
    order.value.phoneNumber = selectedAddress.phoneNumber;
    order.value.deliveryAddress = selectedAddress.address;

    // 自动填充订单中的鲜花信息
    order.value.flowerName = flower.value.flowerName;
    order.value.flowerPrice = flower.value.price;

    // 设置订单的其他信息
    order.value.createAt = new Date();  // 设置当前时间为订单创建时间
    order.value.status = "PENDING";  // 设置订单状态为待处理

    showOrderModal.value = true;  // 打开订单弹窗
  } catch (error) {
    console.error('创建订单失败:', error);
  }
};

// 计算订单总价
const calculateTotalPrice = () => {
  return flower.value.price * order.value.quantity;  // 计算总价格
};

// 确认订单提交
const confirmOrder = async () => {
  try {
    console.log('提交到后端的订单对象:', orderRequest);
    console.log('订单信息:', order.value);  // 打印订单信息，确保鲜花信息已填充
    // 创建订单详情
    const orderDetails = [
      {
        flowerId: flower.value.id,
        quantity: order.value.quantity,
        price: flower.value.price,
      }
    ];

    // 创建完整的订单对象
    const orderRequest = {
      order: {
        customerName: order.value.customerName,
        phoneNumber: order.value.phoneNumber,
        addressId: order.value.addressId,
        quantity: order.value.quantity,
        deliveryAddress: order.value.deliveryAddress,
        flowerName: order.value.flowerName,
        flowerPrice: order.value.flowerPrice,
        createAt: new Date(),
        status: "PENDING",
        userId: userId  // 添加当前用户的ID
      },
      orderDetails: orderDetails  // 订单详情
    };

    // 发送请求到后端创建订单
    const response = await axios.post('http://localhost:8080/api/orders/add', orderRequest);
    if (response.status === 200) {
      alert('订单提交成功！');
      showOrderModal.value = false;  // 关闭订单弹窗
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    alert('订单提交失败，请稍后再试。');
  }
};

// 关闭订单弹窗
const closeOrderModal = () => {
  showOrderModal.value = false;
};

// 在组件挂载后获取数据
onMounted(() => {
  fetchFlowerDetail();
  fetchCollections();  // 获取用户的收藏列表
  fetchUserAddresses(); // 获取用户地址列表
});
</script>




<style scoped>
/* 样式部分 */
.flower-detail {
  margin: 20px;
}

.flower-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flower-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
}

.flower-details h2 {
  font-size: 24px;
}

.flower-price {
  font-size: 20px;
  color: green;
}

.submit-order-btn {
  padding: 10px;
  background-color: #ff5e00;
  color: white;
  border: none;
  cursor: pointer;
}

.submit-order-btn:hover {
  background-color: #e04a00;
}

.order-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 400px;
}

.confirm-order-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.confirm-order-btn:hover {
  background-color: #45a049;
}

.close-modal-btn {
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

.close-modal-btn:hover {
  background-color: #e53935;
}
</style>
