<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import { ElMessage, ElTable, ElTableColumn, ElPagination, ElImage, ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import axios from 'axios';
import AdminNav from "@/components/adminNav.vue";

const orders = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedOrder = ref(null);
const dialogVisible = ref(false);
const confirmDeleteDialogVisible = ref(false);
const orderToDelete = ref(null);
const addOrderDialogVisible = ref(false);
const flowers = ref([]);

// 获取所有花卉数据
const fetchFlowers = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/flowers/all`);
    flowers.value = response.data;
  } catch (error) {
    ElMessage.error('获取花卉信息失败');
  }
};

// 当选择花卉时，自动填充价格和图片等信息
const updateFlowerDetail = (detail) => {
  const selectedFlower = flowers.value.find(flower => flower.id === detail.flowerId);
  if (selectedFlower) {
    detail.flowerName = selectedFlower.flowerName;
    detail.price = selectedFlower.price;
    detail.imageUrl = selectedFlower.imageUrl;
    detail.category = selectedFlower.category;
    detail.material = selectedFlower.material;
    detail.packing = selectedFlower.packing;
  }
};

// 添加订单状态选项
const orderStatusOptions = [
  { label: '待发货', value: 'PENDING' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'DELIVERED' },
  { label: '已取消', value: 'CANCELED' },
];

// 计算总价
const calculateTotalPrice = (orderDetails) => {
  const total = orderDetails.reduce((total, detail) => {
    return total + (detail.price * detail.quantity);
  }, 0);
  return total.toFixed(2); // 保留两位小数
};

// 监听订单详情的变化
watch(() => selectedOrder.value?.orderDetails, (newDetails) => {
  if (newDetails) {
    selectedOrder.value.totalPrice = calculateTotalPrice(newDetails);
  }
}, { deep: true });

// 获取订单数据
const fetchOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/orders/all`);
    console.log(response.data);  // 确保数据格式正确
    orders.value = response.data.map(order => ({
      ...order,
      createAt: new Date(order.createAt).toLocaleString(),
    }));
    console.log(response)
  } catch (error) {
    ElMessage.error('获取订单数据失败');
  }
};

// 分页数据
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value).map((order, index) => ({
    ...order,
    index: start + index + 1,
  }));
});

// 分页事件
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
};

// 搜索功能
const filteredOrders = computed(() => {
  return orders.value.filter(order => order.customerName && order.customerName.includes(searchQuery.value));
});

// 编辑订单
const editOrder = (order) => {
  selectedOrder.value = { ...order };
  dialogVisible.value = true;
};

// 删除订单
const confirmDelete = (order) => {
  orderToDelete.value = order;
  confirmDeleteDialogVisible.value = true;
};

const deleteOrder = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/orders/${orderToDelete.value.id}`);
    orders.value = orders.value.filter(order => order.id !== orderToDelete.value.id);
    ElMessage.success('订单删除成功');
    fetchOrders(); // 刷新订单列表
    confirmDeleteDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('删除订单失败');
    console.error('删除订单失败:', error);
  }
};

// 提交编辑后的订单
const updateOrder = async () => {
  if (!selectedOrder.value || !selectedOrder.value.id) {
    ElMessage.error('订单 ID 无效');
    return;
  }

  const updatedOrderData = {
    order: {
      id: selectedOrder.value.id,
      userId:selectedOrder.value.userId,
      customerName: selectedOrder.value.customerName,
      phoneNumber: selectedOrder.value.phoneNumber,
      address: selectedOrder.value.address,
      status: selectedOrder.value.status,
      totalPrice: selectedOrder.value.totalPrice,
      createAt: new Date(selectedOrder.value.createAt).toISOString(),
    },
    orderDetails: selectedOrder.value.orderDetails,
  };

  try {
    await axios.put(`http://localhost:8080/api/orders/${selectedOrder.value.id}`, updatedOrderData);
    ElMessage.success('订单更新成功');
    dialogVisible.value = false;
    fetchOrders();
  } catch (error) {
    ElMessage.error('更新订单失败');
    console.error('更新订单失败:', error);
  }
};

// 添加订单
const handleAddOrder = () => {
  selectedOrder.value = {
    id: null,
    userId: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    status: 'PENDING',
    totalPrice: 0.00,
    createAt: new Date().toISOString(),
    orderDetails: [{ flowerId: null, flowerName: '', price: 0, quantity: 1 }]
  };
  addOrderDialogVisible.value = true;
};

// 保存新订单
const saveOrder = async () => {
  if (!selectedOrder.value || !selectedOrder.value.userId || !selectedOrder.value.customerName
      || !selectedOrder.value.phoneNumber || !selectedOrder.value.address) {
    ElMessage.error('请填写所有必填字段');
    return;
  }

  // 计算总价
  selectedOrder.value.totalPrice = calculateTotalPrice(selectedOrder.value.orderDetails);

  const newOrderData = {
    order: selectedOrder.value,
    orderDetails: selectedOrder.value.orderDetails,
  };

  try {
    const response = await axios.post('http://localhost:8080/api/orders/add', newOrderData);
    ElMessage.success('订单添加成功');
    fetchOrders();
    addOrderDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('添加订单失败');
    console.error('添加订单失败:', error);
  }
};

onMounted(() => {
  fetchOrders();
  fetchFlowers();
});
</script>

<template>
  <adminNav />
  <div class="content">
    <div class="card-container">
    <div class="search-box">
      <h1>订单管理</h1>
      <input v-model="searchQuery" placeholder="请输入收货人姓名进行搜索" class="search-input" />
      <el-button type="primary" @click="handleAddOrder" class="add-order-btn">添加订单</el-button>
    </div>

    <!-- 显示订单表格 -->
    <div class="table-container">
      <el-table :data="paginatedOrders" class="order-table" border :header-cell-style="{ backgroundColor: '#ec6975', color: '#FFFFFF', fontWeight: 'bold',fontSize:'16px' }">
        <el-table-column label="序号" prop="index" width="80" align="center" />
        <el-table-column label="订单编号" prop="id" />
        <el-table-column label="用户账号" prop="userId" />
        <el-table-column label="收货人姓名" prop="customerName" />
        <el-table-column label="收货人电话" prop="phoneNumber" />
        <el-table-column label="收货地址" prop="address" />
        <!-- 折叠鲜花详细信息 -->
        <el-table-column type="expand" label="详情">
          <template #default="{ row }">
            <div class="expand-container">
              <div class="expand-header">订单详情</div>
              <el-table :data="row.orderDetails" border style="width: 100%;" class="order-details-table">
                <el-table-column label="图片" align="center">
                  <template #default="{ row }">
                    <el-image :src="row.imageUrl" fit="cover" style="width: 50px; height: 50px;" />
                  </template>
                </el-table-column>
                <el-table-column prop="flowerName" label="花卉名称" align="center" />
                <el-table-column prop="price" label="价格" align="center">
                  <template #default="{ row }">
                    ¥{{ row.price.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" align="center" />
                <el-table-column prop="category" label="种类" align="center" />
                <el-table-column prop="material" label="描述" align="center" />
                <el-table-column prop="packing" label="包装" align="center" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总价" prop="totalPrice">
          <template #default="{ row }">
            <span>{{ (row.totalPrice).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="createAt" />
        <el-table-column label="订单状态">
          <template #default="{ row }">
            <span>
              {{ orderStatusOptions.find(option => option.value === row.status)?.label || row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" class="edit-btn" @click="editOrder(row)">编辑</el-button>
              <el-button size="small" class="delete-btn" type="danger" @click="confirmDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredOrders.length"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination-container"
    />
    </div>
  </div>

    <!-- 编辑订单弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑订单" @close="dialogVisible = false" width="60%">
      <el-form :model="selectedOrder" ref="form" label-width="120px" class="order-form">
        <el-form-item label="订单编号">
          <el-input v-model="selectedOrder.id" disabled />
        </el-form-item>
        <el-form-item label="用户账号">
          <el-input v-model="selectedOrder.userId" disabled />
        </el-form-item>
        <el-form-item label="收货人姓名">
          <el-input v-model="selectedOrder.customerName" />
        </el-form-item>
        <el-form-item label="收货人电话">
          <el-input v-model="selectedOrder.phoneNumber" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="selectedOrder.address" />
        </el-form-item>
        <el-form-item label="花卉详情">
          <div v-for="(detail, index) in selectedOrder.orderDetails" :key="index" class="flower-details">
            <el-select v-model="detail.flowerId" placeholder="请选择花卉名称" style="width: 180px; margin-right: 10px;" @change="updateFlowerDetail(detail)">
              <el-option
                  v-for="flower in flowers"
                  :key="flower.id"
                  :label="flower.flowerName"
                  :value="flower.id"
              />
            </el-select>
            <el-input
                v-model="detail.flowerName"
                placeholder="花卉名称"
                style="width: 180px; margin-right: 10px;"
                :disabled="true"
            />
            <el-input
                v-model="detail.price"
                type="number"
                placeholder="单价"
                style="width: 100px; margin-right: 10px;"
                :disabled="true"
            />
            <el-input
                v-model="detail.quantity"
                type="number"
                placeholder="数量"
                style="width: 80px;margin-right: 10px"
            />
            <el-input
                v-model="detail.category"
                placeholder="鲜花种类"
                style="width: 180px; margin-right: 10px;"
                :disabled="true"
            />
            <el-input
                v-model="detail.material"
                placeholder="花卉描述"
                style="width: 180px; margin-right: 10px;"
                :disabled="true"
            />
            <el-input
                v-model="detail.packing"
                placeholder="花卉包装"
                style="width: 180px; margin-right: 10px;"
                :disabled="true"
            />
          </div>
          <el-button type="primary" @click="selectedOrder.orderDetails.push({ flowerId: null, flowerName: '', price: 0, quantity: 1 })" style="background: #66b1ff;border: #66b1ff;margin-bottom: 10px;margin-top: 10px">
            添加鲜花
          </el-button>
          <el-button type="danger" v-if="selectedOrder.orderDetails.length > 1" @click="selectedOrder.orderDetails.pop()">
            删除鲜花
          </el-button>
        </el-form-item>
        <el-form-item label="订单总价">
          <el-input v-model="selectedOrder.totalPrice" disabled />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-input v-model="selectedOrder.createAt" disabled />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="selectedOrder.status" placeholder="请选择订单状态">
            <el-option
                v-for="option in orderStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="dialog-footer">
          <el-button type="primary" @click="updateOrder">保存</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="confirmDeleteDialogVisible" title="确认删除" @close="confirmDeleteDialogVisible = false" width="30%">
      <p>此操作不可撤销，您确定要删除该订单吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="confirmDeleteDialogVisible = false">取消</el-button>
        <el-button  type="danger" @click="deleteOrder">确认删除</el-button>
      </span>
    </el-dialog>

  <!-- 添加订单弹窗 -->
  <el-dialog v-model="addOrderDialogVisible" title="添加订单" @close="addOrderDialogVisible = false" width="60%">
    <el-form :model="selectedOrder" ref="form" label-width="120px" class="order-form">
      <el-form-item label="用户账号">
        <el-input v-model="selectedOrder.userId" />
      </el-form-item>
      <el-form-item label="收货人姓名">
        <el-input v-model="selectedOrder.customerName" />
      </el-form-item>
      <el-form-item label="收货人电话">
        <el-input v-model="selectedOrder.phoneNumber" />
      </el-form-item>
      <el-form-item label="收货地址">
        <el-input v-model="selectedOrder.address" />
      </el-form-item>
      <!-- 鲜花详情 -->
      <el-form-item label="鲜花详情">
        <div v-for="(detail, index) in selectedOrder.orderDetails" :key="index" class="flower-details">
          <el-select v-model="detail.flowerId" placeholder="请选择鲜花名称" style="width: 180px; margin-right: 10px;" @change="updateFlowerDetail(detail)">
            <el-option v-for="flower in flowers" :key="flower.id" :label="flower.flowerName" :value="flower.id" />
          </el-select>
          <el-input v-model="detail.flowerName" placeholder="花卉名称" style="width: 180px; margin-right: 10px;" :disabled="true" />
          <el-input v-model="detail.price" type="number" placeholder="单价" style="width: 100px; margin-right: 10px;" :disabled="true" />
          <el-input v-model="detail.quantity" type="number" placeholder="数量" style="width: 80px;margin-right: 10px" />
          <el-input v-model="detail.category" placeholder="花卉种类" style="width: 180px; margin-right: 10px;" :disabled="true" />
          <el-input v-model="detail.material" placeholder="花卉描述" style="width: 180px; margin-right: 10px;" :disabled="true" />
          <el-input v-model="detail.packing" placeholder="花卉包装" style="width: 180px; margin-right: 10px;" :disabled="true" />
          <el-button type="primary" @click="selectedOrder.orderDetails.push({ flowerId: null, flowerName: '', price: 0, quantity: 1 })" style="background: #66b1ff;border: #66b1ff;margin-bottom: 10px;margin-top: 10px">
            添加鲜花
          </el-button>
          <el-button type="danger" v-if="selectedOrder.orderDetails.length > 1" @click="selectedOrder.orderDetails.pop()">
            删除鲜花
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="订单总价">
        <el-input v-model="selectedOrder.totalPrice" disabled />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="selectedOrder.status" placeholder="请选择订单状态">
          <el-option v-for="option in orderStatusOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="dialog-footer">
        <el-button type="primary" @click="saveOrder">保存</el-button>
        <el-button @click="addOrderDialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>


<style scoped>
.content {
  margin-left: 230px;
  flex-grow: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #ec6975;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: left;
  border-left: 4px solid #ec6975;
  padding-left: 10px;
}

.search-box {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 350px;
  height: 45px;
  padding: 12px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background-color: #f9f9f9;
  color: #333;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: block;
  margin-left: 650px;
}

.search-input::placeholder {
  color: #999;
  font-style: italic;
}

.search-input:focus {
  outline: none;
  border: 3px solid #ec6975;
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(236, 105, 117, 0.2);
  color: #000;
}

.search-input:hover {
  border: 2px solid #ec6975;
  background-color: #fdfdfd;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.add-order-btn {
  background-color: #ec6975;
  border: 2px solid transparent;
  color: white;
  border-radius: 30px;
  transition: all 0.3s ease;
  padding: 20px 24px;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.add-order-btn:hover {
  background-color: #f46a76;
  border: 2px solid #ec6975;
  color: #fff;
  transform: scale(1.05);
}

.add-order-btn:focus {
  outline: none;
  border: 2px solid #f46a76;
  color: #fff;
}

.flower-table {
  margin-top: 20px;
}

.flower-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.edit-btn {
  margin-right: 10px;
}

.delete-btn {
  background-color: #ed3b3b;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-button--primary {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.edit-btn {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.expand-container {
  padding: 16px;
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.expand-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.order-details-table {
  font-size: 14px;
  background-color: #fff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.card-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 20px auto;
  width: 100%;
}
</style>

