<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import axios from 'axios';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import {useRouter} from "vue-router";

// 数据部分
const cartItems = ref([]);
const router = useRouter();
const showOrderModal = ref(false);
const userAddresses = ref([]);
const selectedAddressId = ref(null);
const userId = ref(sessionStorage.getItem('userId'));
const selectedAddress = ref({
  customerName: '',
  phoneNumber: '',
  address: ''
});
const showConfirmModal = ref(false);
const itemToRemove = ref(null);

// 打开确认弹框
const confirmRemoveItem = (id) => {
  itemToRemove.value = id;
  showConfirmModal.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (itemToRemove.value) {
    await removeFromCart(itemToRemove.value);
    itemToRemove.value = null; // 重置
    showConfirmModal.value = false; // 关闭弹框
  }
};

// 取消删除
const cancelDelete = () => {
  itemToRemove.value = null; // 清空选择
  showConfirmModal.value = false; // 关闭弹框
};

// 获取购物车
const fetchCart = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/ShoppingCart/${userId.value}`);
    cartItems.value = response.data;
    console.log('User ID:', userId.value);

  } catch (error) {
    console.error('加载购物车失败:', error);
  }
};

// 获取用户地址
const fetchUserAddresses = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/addresses/user/${userId.value}`);
    userAddresses.value = response.data;
    if (userAddresses.value.length > 0) {
      selectedAddressId.value = userAddresses.value[0].id;
    }
  } catch (error) {
    console.error('获取地址失败:', error);
  }
};

// 更新购物车数量
const updateQuantity = async (id, newQuantity) => {
  if (newQuantity < 1) {
    return;
  }

  try {
    await axios.put(`http://localhost:8080/api/ShoppingCart/${id}`, { quantity: newQuantity });
    fetchCart();
  } catch (error) {
    console.error('更新数量失败:', error);
  }
};

// 监听地址选择变化
watch(selectedAddressId, (newId) => {
  const address = userAddresses.value.find(addr => addr.id === newId);
  if (address) {
    updateSelectedAddress(address);
  }
});

// 更新选中地址信息
const updateSelectedAddress = (address) => {
  selectedAddress.value = {
    customerName: address.name,
    phoneNumber: address.phoneNumber,
    address: address.address
  };
};

// 移除购物车商品
const removeFromCart = async (id) => {
  try {
    await axios.delete(`http://localhost:8080/api/ShoppingCart/${id}`);
    fetchCart();
  } catch (error) {
    console.error('删除购物车项失败:', error);
  }
};

// 计算总金额
const totalAmount = computed(() =>
    cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
);

// 打开订单弹窗
const openOrderModal = () => {
  if (!cartItems.value.length) {
    alert('购物车为空，请添加商品后结算。');
    return;
  }
  showOrderModal.value = true;
};

// 关闭订单弹窗
const closeOrderModal = () => {
  showOrderModal.value = false;
};

// 保存订单
const saveOrder = async () => {
  if (!selectedAddressId.value) {
    alert('请选择送货地址!');
    return;
  }

  const orderDetails = cartItems.value.map(item => ({
    flowerId: item.id,
    flowerName: item.flowerName,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    category:item.category,
    material:item.material,
    packing:item.packing,
  }));

  const newOrder = {
    order: {
      userId: sessionStorage.getItem('userId'),
      customerName: selectedAddress.value.customerName,
      phoneNumber: selectedAddress.value.phoneNumber,
      address: selectedAddress.value.address,
      status: 'PENDING',
      totalPrice: totalAmount.value,
      createAt: new Date().toISOString(),
    },
    orderDetails,
  };

  try {
    const response = await axios.post('http://localhost:8080/api/orders/add', newOrder);
    if (response.status === 201) {
      alert('订单提交成功！');
      showOrderModal.value = false;
      fetchCart();
    }
  } catch (error) {
    alert('订单提交失败，请稍后再试。');
    console.error('订单提交失败:', error);
  }
};

const navigateToCategory = () => {
  router.push('/category');
};

onMounted(() => {
  fetchCart();
  fetchUserAddresses();
});
</script>

<template>
  <NavigationPage />
  <div class="main">
  <div class="shopping-cart-container">
    <div v-if="cartItems.length === 0" class="empty-cart">
      <img src="../assets/images/shoppingCart.jpg" alt="暂无订单" class="empty-cart-image">
      <p class="empty-cart-text">您的购物车空空如也，快去挑选心仪的鲜花吧！</p>
      <button class="empty-cart-button" @click="navigateToCategory">去逛逛</button>
    </div>

    <div v-else>
      <table class="cart-table">
        <thead>
        <tr>
          <th>图片</th>
          <th>名称</th>
          <th>种类</th>
          <th>描述</th>
          <th>包装</th>
          <th>价格</th>
          <th>数量</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in cartItems" :key="item.id">
          <td class="cart-item-image">
            <img :src="item.imageUrl || '../assets/images/default-flower.png'" alt="flower image" class="cart-image" />
          </td>
          <td class="cart-item-name">{{ item.flowerName || '未知鲜花' }}</td>
          <td class="cart-item-name">{{ item.category || '未知种类' }}</td>
          <td class="cart-item-name">{{ item.material || '未知花材' }}</td>
          <td class="cart-item-name">{{ item.packing || '未知包装' }}</td>
          <td class="cart-item-price">￥{{ item.price || '0.00' }}</td>
          <td>
            <!-- 使用 el-input-number 控件来增加或减少数量 -->
            <el-input-number
                v-model="item.quantity"
                :min="1"
                @change="updateQuantity(item.id, item.quantity)"
                class="quantity-input"
            ></el-input-number>
          </td>

          <td>
            <button @click="confirmRemoveItem(item.id)" class="remove-btn">移除</button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="cart-footer">
        <button class="custom-button" @click="navigateToCategory">
          <i class="icon-back"></i> 继续挑选
        </button>
        <p class="total-price">应付金额: ￥{{ totalAmount }}</p>
        <button @click="openOrderModal" class="checkout-btn">去结算</button>
      </div>
    </div>
  </div>

  <!-- 订单弹窗 -->
    <div v-if="showOrderModal" class="order-modal">
      <div class="modal-content">
        <h2 class="modal-title">订单详情</h2>
        <div class="order-info">
          <div class="address-container">
            <label for="address" class="address-label"><strong>选择地址:</strong></label>
            <el-select
                v-model="selectedAddressId"
                placeholder="请选择送货地址"
                filterable
                clearable
                id="address"
                class="address-select">
              <el-option
                  v-for="address in userAddresses"
                  :key="address.id"
                  :label="`${address.name} - ${address.phoneNumber} - ${address.address}`"
                  :value="address.id">
              </el-option>
            </el-select>
          </div>
        </div>

        <!-- 花卉信息展示 -->
        <div class="flower-info">
          <table class="order-table">
            <thead>
            <tr>
              <th>图片</th>
              <th>名称</th>
              <th>种类</th>
              <th>描述</th>
              <th>包装</th>
              <th>单价</th>
              <th>数量</th>
              <th>小计</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in cartItems" :key="item.id">
              <td>
                <img :src="item.imageUrl || '../assets/images/default-flower.png'" alt="flower image" class="order-flower-image" />
              </td>
              <td>{{ item.flowerName || '未知鲜花' }}</td>
              <td>{{ item.category || '未知种类' }}</td>
              <td>{{ item.material || '未知花材' }}</td>
              <td>{{ item.packing || '未知包装' }}</td>
              <td>￥{{ item.price }}</td>
              <td>{{ item.quantity }}</td>
              <td>￥{{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 总金额 -->
        <div class="order-summary-container">
          <div class="order-total">
            <p><strong>总金额:</strong> ￥{{ totalAmount }}</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="modal-buttons">
          <button @click="closeOrderModal" class="close-modal-btn">取消</button>
          <button @click="saveOrder" class="confirm-order-btn">确认支付</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 确认删除弹窗 -->
  <el-dialog
      v-model="showConfirmModal"
      title="确认删除花卉"
      width="400px"
      @close="cancelDelete"
  >
    <p>确定要删除该花卉吗？此操作不可恢复。</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelDelete">取消</el-button>
      <el-button type="danger" @click="confirmDelete">确认删除</el-button>
    </div>
  </el-dialog>
  <FooterPage />
</template>


<style scoped>
.main{
  margin-top: 150px;
  margin-bottom: 100px;
}

.shopping-cart-container {
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.shopping-cart-container > div[v-if="cartItems.length === 0"] {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
}

.shopping-cart-container > div[v-if="cartItems.length === 0"] img {
  width: 300px;
  height: auto;
}

.cart-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 20px;
  border: 2px solid #ec6975;
}

.cart-table th, .cart-table td {
  border-bottom: 2px solid #ec6975;
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

.cart-table th {
  background-color: #ec6975;
  font-weight: bold;
  text-align: center;
  font-size: 20px;
  color: #FFFFFF;
}

.cart-item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  display: block;
  margin: 0 auto;
}

.cart-table tbody tr:hover {
  background-color: #fbf1f1;
}

.quantity-input {
  width: 100px;
  text-align: center;
}

.el-input-number {
  border-radius: 6px;
  font-size: 16px;
}

.el-input-number__increase,
.el-input-number__decrease {
  background-color: #ec6975;
  color: #fff;
}

.el-input-number__increase:hover,
.el-input-number__decrease:hover {
  background-color: #e84c5a;
}

.remove-btn {
  background-color: #ec6975;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 100px;
  height: 40px;
}

.remove-btn:hover {
  transform: translateY(-2px);
  background-color: #df2e3e;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px;
  border: 2px solid #ef9b63;
  margin-bottom: 200px;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #ef9b63;
  margin-left: 860px;
  margin-top: 10px;
}

.checkout-btn {
  background-color: #ef9b63;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.checkout-btn:hover {
  background-color: #f18b45;
  transform: translateY(-2px);
}

.custom-button {
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  background-color: #e1cfd1;
  color: #fff;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-button:hover {
  background-color: #ec6376;
  transform: translateY(-2px);
}

.custom-button:active {
  background-color: #bd6f79;
  transform: translateY(1px);
}

.icon-back {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  background-image: url('../assets/images/arrow-left.svg');
  background-size: contain;
  background-repeat: no-repeat;
  filter: brightness(0) invert(1);
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.confirm-btn, .cancel-btn {
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  background: #ec6975;
  color: #fff;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.confirm-btn:hover {
  background: #e84c5a;
}

.cancel-btn:hover {
  background: #eaeaea;
}

.empty-cart {
  text-align: center;
}

.empty-cart-image {
  width: 400px;
  height: auto;
  margin-bottom: 20px;
}

.empty-cart-text {
  font-size: 16px;
  color: #777;
  margin-bottom: 20px;
}

.empty-cart-button {
  background-color: #ec6975;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-cart-button:hover {
  background-color: #e84c5a;
  transform: translateY(-2px);
}

.empty-cart-button:active {
  background-color: #d9534f;
  transform: translateY(1px);
}

/* 修改后的订单弹窗样式 */
.address-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

.address-label {
  margin-right: 10px;
  font-size: 16px;
  color: #333;
  font-weight: bold;
  white-space: nowrap;
  margin-top: 5px;
}

.order-summary-container {
  margin-top: 20px;
  padding: 10px 0;
}

.order-total {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  color: #ec6975;
}

.order-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  width: 900px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #ec6975;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.order-flower-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.confirm-order-btn,
.close-modal-btn {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
}

.confirm-order-btn {
  background-color: #ec6975;
  color: #fff;
}

.confirm-order-btn:hover {
  background-color: #e84c5a;
}

.close-modal-btn {
  background-color: #f5f5f5;
  color: #333;
}

.close-modal-btn:hover {
  background-color: #eaeaea;
}

.el-dialog {
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.el-dialog .el-dialog__title {
  font-size: 18px;
  color: #333;
}

.el-dialog p {
  font-size: 16px;
  color: #666;
}

.dialog-footer {
  text-align: right;
}

.el-button {
  margin: 0 10px;
}

.el-button--danger {
  background-color: #ec6975;
  color: #fff;
  border: none;
}

.el-button--danger:hover {
  background-color: #e84c5a;
}
</style>
