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

// 检查是否登录
const isUserLoggedIn = () => {
  return !!sessionStorage.getItem('userId');
};

const ensureLoggedIn = () => {
  if (!isUserLoggedIn()) {
    alert('请先登录！');
    return false;
  }
  return true;
};

// 获取鲜花详细信息
const fetchFlowerDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/flowers/${flowerId}`);
    flower.value = response.data;
    console.log("当前库存:", flower.value ? flower.value.stock : "未加载");

  } catch (error) {
    console.error('获取鲜花详情失败:', error);
  }
};

// 获取当前用户的收藏列表
const fetchCollections = async () => {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await axios.get(`http://localhost:8080/api/collections/user/${userId}`);
    collections.value = response.data;
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  }
};

// 判断商品是否已经收藏
const isFlowerInCollection = (flowerId) => {
  // 确保 collections.value 是数组
  if (Array.isArray(collections.value)) {
    return collections.value.some((collection) => collection.flowerId === flowerId);
  }
  return false;  // 如果 collections.value 不是数组，返回 false
};

// 添加到收藏
const addToCollection = async (flower) => {
  if (!ensureLoggedIn()) return;

  try {
    const userId = sessionStorage.getItem('userId');
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
  if (!ensureLoggedIn()) return;

  try {
    const userId = sessionStorage.getItem('userId');
    const cartItem = {
      userId: userId,
      flowerId: flower.id,
      quantity: 1,
    };
    const response = await axios.post('http://localhost:8080/api/ShoppingCart/add', cartItem);
    if (response.status === 200) {
      alert(`${flower.flowerName} 已添加到购物车！`);
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加到购物车失败，请重试。');
  }
};

const order = ref({
  customerName: '',
  phoneNumber: '',
  address:'',
  quantity: 1,
  flowerName:'',
  price:'',
  imageUrl:'',
  category:'玫瑰',
  material:'花材',
  packing:'包装',
});

const showOrderModal = ref(false);

// 用户地址
const userAddresses = ref([]);

// 获取用户地址列表
const fetchUserAddresses = async () => {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await axios.get(`http://localhost:8080/api/addresses/user/${userId}`);
    userAddresses.value = response.data;
    if (userAddresses.value.length > 0) {
      order.value.addressId = userAddresses.value[0].id; // 默认选择第一个地址
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
};

// 提交订单时打开弹窗
const openOrderModal = async () => {
  if (!ensureLoggedIn()) return;

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
    order.value.address = selectedAddress.address;

    // 自动填充订单中的鲜花信息
    order.value.flowerName = flower.value.flowerName;
    order.value.price = flower.value.price;
    order.value.imageUrl = flower.value.imageUrl;
    order.value.category = flower.value.category;
    order.value.material = flower.value.material;
    order.value.packing = flower.value.packing;
    order.value.createAt = new Date();  // 设置当前时间为订单创建时间
    order.value.status = "PENDING";  // 设置订单状态为待处理

    showOrderModal.value = true;  // 打开订单弹窗
  } catch (error) {
    console.error('创建订单失败:', error);
  }
};

// 计算订单总价
const calculateTotalPrice = () => {
  const totalPrice = flower.value.price * order.value.quantity; // 计算总价格
  return totalPrice.toFixed(2); // 格式化为两位小数
};

// 确认订单提交
const confirmOrder = async () => {
  try {
    if (!flower.value || flower.value.stock < order.value.quantity) {
      alert(`库存不足，当前库存为 ${flower.value.stock}。`);
      return;
    }

    const orderRequest = {
      order: {
        userId: sessionStorage.getItem('userId'),
        status: "PENDING",  // 初始订单状态
        totalPrice: calculateTotalPrice(),
        createAt: new Date(),
        customerName:order.value.customerName,
        phoneNumber:order.value.phoneNumber,
        address:order.value.address,
      },
      orderDetails: [
        {
          quantity: order.value.quantity,
          price: order.value.price,
          flowerName:order.value.flowerName,
          imageUrl:order.value.imageUrl,
          category:order.value.category,
          material:order.value.material,
          packing:order.value.packing,
        },
      ],
    };
    console.log(orderRequest); // 检查 orderRequest 数据
    // 发送请求到后端创建订单
    const response = await axios.post('http://localhost:8080/api/orders/add', orderRequest);
    if (response.status === 201) {
      alert('支付成功！');
      showOrderModal.value = false;  // 关闭订单弹窗
      await fetchFlowerDetail(); // 确保库存刷新
      flower.value = { ...flower.value }; // 强制响应式触发
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    alert('订单提交失败，请稍后再试。');
  }
};

// 控制按钮状态
const isOutOfStock = () => {
  return flower.value && flower.value.stock === '0';
};


// 关闭订单弹窗
const closeOrderModal = () => {
  showOrderModal.value = false;
};

// 取消收藏
const removeFromCollection = async (flower) => {
  try {
    const userId = sessionStorage.getItem('userId');
    if (!isFlowerInCollection(flower.id)) {
      alert(`${flower.flowerName} 不在您的收藏中！`);
      return;
    }

    const response = await axios.delete(`http://localhost:8080/api/collections/remove/${userId}/${flower.id}`);
    if (response.status === 200) {
      alert(`${flower.flowerName} 已取消收藏！`);
      fetchCollections(); // 更新收藏列表
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    alert('取消收藏失败，请重试。');
  }
};

// 在组件挂载后获取数据
onMounted(() => {
  fetchFlowerDetail();
  fetchCollections();  // 获取用户的收藏列表
  fetchUserAddresses(); // 获取用户地址列表
});
</script>

<template>
  <div>
    <NavigationPage />

    <!-- 花卉详情展示 -->
    <div class="flower-detail">
      <div v-if="flower" class="flower-info-container">
        <!-- 左侧图片展示 -->
        <div class="flower-image-container">
          <img :src="flower.imageUrl || '../assets/images/default-flower.png'" alt="花卉图片" class="flower-image" />
        </div>

        <!-- 右侧花卉详情 -->
        <div class="flower-details">
          <h2 class="flower-title">{{ flower.flowerName }}</h2>
          <h3 class="flowerPrice">￥{{ flower.price }}</h3>
          <p><strong>库存:</strong> {{ flower.stock > 0 ? flower.stock : '已售空' }}</p>
          <p><strong>花语:</strong> {{ flower.flowerLanguage }}</p>
          <p><strong>种类:</strong> {{ flower.category }}</p>
          <p><strong>用途:</strong> {{ flower.purpose }}</p>
          <p><strong>包装:</strong> {{ flower.packing }}</p>
          <p><strong>描述:</strong> {{ flower.material }}</p>

          <div class="button-group">
            <button @click.stop="addToCart(flower)" class="add-to-cart-btn">
              <shopping-cart-add theme="outline" class="custom-icon" />
              加入购物车
            </button>
            <button
                :disabled="isOutOfStock()"
                :class="isOutOfStock() ? 'disabled-btn' : 'submit-order-btn'"
                @click="openOrderModal"
            >
              {{ isOutOfStock() ? '已售空' : '立即购买' }}
            </button>
            <button
                @click.stop="isFlowerInCollection(flower.id) ? removeFromCollection(flower) : addToCollection(flower)"
                class="add-to-collection-btn"
            >
              {{ isFlowerInCollection(flower.id) ? '取消收藏' : '收藏' }}
            </button>

          </div>
        </div>
      </div>

      <div v-else>
        <p class="loading-text">正在加载鲜花详情...</p>
      </div>
    </div>

    <!-- 订单弹窗 -->
    <div v-if="showOrderModal" class="order-modal">
      <div class="modal-content">
        <h2 class="modal-title">订单详情</h2>
        <div class="modal-body">
          <div class="modal-flower">
            <img :src="flower.imageUrl || '../assets/images/default-flower.png'" alt="鲜花图片" class="modal-flower-img" />
          </div>
          <div class="modal-info">
            <div class="form-row">
              <label for="address"><strong>送货地址:</strong></label>
              <select v-model="order.addressId" id="address" required class="address-select">
                <option v-for="address in userAddresses" :key="address.id" :value="address.id">
                  {{ address.name }} - {{ address.phoneNumber }} - {{ address.address }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <label for="flowerName"><strong>鲜花名称:</strong></label>
              <p id="flowerName">{{ flower.flowerName }}</p>
            </div>
            <div class="form-row">
              <label for="category"><strong>种类:</strong></label>
              <p id="category">{{ flower.category }}</p>
            </div>
            <div class="form-row">
              <label for="packing"><strong>包装:</strong></label>
              <p id="packing">{{ flower.packing }}</p>
            </div>
            <div class="form-row">
              <label for="material"><strong>描述:</strong></label>
              <p id="material">{{ flower.material }}</p>
            </div>
            <div class="form-row">
              <label for="price"><strong>单价:</strong></label>
              <p id="price">￥{{ flower.price }}</p>
            </div>
            <div class="form-row">
              <label for="quantity"><strong>数量:</strong></label>
              <input type="number" id="quantity" v-model="order.quantity" min="1" class="quantity-input" />
            </div>
            <div class="form-row">
              <label for="total"><strong>总价:</strong></label>
              <p id="total">￥{{ calculateTotalPrice() }}</p>
            </div>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="closeOrderModal" class="close-modal-btn">关闭</button>
          <button @click="confirmOrder" class="confirm-order-btn">确认支付</button>
        </div>
      </div>
    </div>
    <FooterPage />
  </div>
</template>


<style scoped>
.flower-detail {
  margin: 40px auto;
  max-width: 1200px;
  padding: 50px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 150px;
}

.flower-info-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  align-items: center;
}

.flower-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flower-image {
  width: 450px;
  height: 500px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.flower-details {
  padding: 20px;
  border-radius: 10px;
}

.flower-title {
  font-size: 40px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.flowerPrice {
  font-size: 25px;
  color: #ec6975;
  font-weight: bold;
  margin-bottom: 20px;
}

.flower-details p {
  font-size: 20px;
  color: #555;
  margin-bottom: 10px;
  line-height: 1.8;
}

.button-group {
  display: flex;
  gap: 15px;
}

.add-to-collection-btn {
  padding: 10px 50px;
  font-size: 16px;
  font-weight: bold;
  color: #ec6975;
  background-color: #fff;
  border: 2px solid #ec6975;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-collection-btn:hover {
  background-color: #ec6975;
  color: #FFFFFF;
  font-size: 18px;
}

.add-to-cart-btn {
  padding: 10px 25px;
  font-size: 16px;
  font-weight: bold;
  color: #ec6975;
  background-color: #fff;
  border: 2px solid #ec6975;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #ec6975;
  color: #FFFFFF;
  border-color: #ec6975;
  font-size: 18px;
}

.custom-icon {
  margin-right: 5px;
  width: 30px;
  height: 30px;
  fill: #ec6975;
}

.custom-icon:hover {
  background-color: #ec6975;
  color: #FFFFFF;
}

.submit-order-btn {
  padding: 10px 50px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #ec6975, #e35a66);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-order-btn:hover {
  background-color: #ec6975;
  color: #FFFFFF;
  border-color: #ec6975;
  font-size: 18px;
}

.disabled-btn {
  padding: 10px 50px;
  font-size: 16px;
  font-weight: bold;
  color: white !important;
  background-color: #b1afaf !important;
  border: none;
  border-radius: 30px;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.loading-text {
  text-align: center;
  font-size: 18px;
  color: #888;
}

.order-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 24px;
  color: #ec6975;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  padding-bottom: 10px;
}

.modal-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.modal-flower {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-flower-img {
  width: 330px;
  height: 330px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.modal-info {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.form-row label {
  width: 100px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.form-row p {
  margin: 0;
  font-size: 16px;
  color: #555;
  flex: 1;
}

.quantity-input,
.address-select {
  padding: 8px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ccc;
  flex: 1;
  transition: all 0.3s ease;
  max-width: 350px;
  width: 100%;
}

.quantity-input:focus,
.address-select:focus {
  outline: none;
  border: 2px solid #ec6975;
  background-color: #fff;
  transform: scale(1.02);
}

.modal-buttons {
  display: flex;
  justify-content: space-evenly;
  margin-top: 10px;
  gap: 30px;
}

.confirm-order-btn {
  flex: 1;
  margin-right: 20px !important;
  padding: 12px 20px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #ec6975, #e35a66);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-order-btn:hover {
  background-color: #d94d5a;
  transform: scale(1.05);
}

.close-modal-btn {
  flex: 1;
  margin-left: 10px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #b1afaf, #9e9c9c);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background-color: #a9a6a6;
  transform: scale(1.05);
}
</style>
