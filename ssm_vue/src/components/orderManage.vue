<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElMessage,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElImage
} from 'element-plus';
import axios from 'axios';
import AdminNav from "@/components/adminNav.vue";

// 数据部分
const orders = ref([]);
const searchQuery = ref('');
const dialogVisible = ref(false);
const addOrderDialogVisible = ref(false);  // 控制添加订单弹窗的显示与隐藏
const confirmDialogVisible = ref(false);
const currentOrder = reactive({
  id: '',
  customerName: '',
  phoneNumber:'',
  deliveryAddress:'',
  flowerName: '',
  imageUrl: '',
  quantity: '',
  totalPrice: '0.00',
  createAt: '',
  status: ''
});
const orderToDelete = ref(null);

// 获取所有订单数据
const fetchOrders = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/orders/all');
    console.log('Fetched Orders:', response.data); // 验证数据
    orders.value = response.data.map(order => ({
      ...order,
      status: order.status || 'UNKNOWN', // 默认值防止 undefined
      createAt: new Date(order.createAt).toLocaleString(), // 格式化时间
    }));
  } catch (error) {
    console.error('获取订单数据失败:', error);
  }
};

// 搜索功能
const filteredOrders = computed(() => {
  return orders.value.filter(order => order.customerName && order.customerName.includes(searchQuery.value));
});

// 编辑功能
const handleEdit = (order) => {
  Object.assign(currentOrder, order);
  dialogVisible.value = true;
};

// 保存编辑后的订单信息
const handleSave = async () => {
  if (!currentOrder.customerName || !currentOrder.deliveryAddress || !currentOrder.flowerName || !currentOrder.quantity || !currentOrder.totalPrice) {
    ElMessage.warning('请完整填写订单信息！');
    return;
  }

  try {
    const updatedOrder = { ...currentOrder };
    const response = updatedOrder.id
        ? await axios.put(`http://localhost:8080/api/orders/${updatedOrder.id}`, updatedOrder)
        : await axios.post('http://localhost:8080/api/orders/add', updatedOrder);

    if (updatedOrder.id) {
      const index = orders.value.findIndex(item => item.id === updatedOrder.id);
      if (index !== -1) {
        orders.value[index] = response.data;
      }
    } else {
      orders.value.push(response.data);
    }

    console.log('订单数据:', currentOrder);

    dialogVisible.value = false;
    addOrderDialogVisible.value = false;
    ElMessage.success('订单信息保存成功！');
  } catch (error) {
    console.error('保存订单信息失败:', error);
    ElMessage.error('保存订单失败，请稍后再试');
  }
};


// 删除功能
const handleDelete = (order) => {
  orderToDelete.value = order;
  confirmDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/orders/${orderToDelete.value.id}`);
    orders.value = orders.value.filter(order => order.id !== orderToDelete.value.id);
    confirmDialogVisible.value = false;
    ElMessage.success('订单删除成功！');
  } catch (error) {
    console.error('删除订单失败:', error);
  }
};

// 取消删除
const cancelDelete = () => {
  confirmDialogVisible.value = false;
};

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value).map((order, index) => ({
    ...order,
    index: start + index + 1, // 添加序号列
  }));
});

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 添加订单
const handleAddOrder = () => {
  Object.assign(currentOrder, {
    id: '',
    customerName: '',
    phoneNumber: '',
    deliveryAddress: '',
    flowerName: '',
    quantity: '',
    totalPrice: '',
    createAt: new Date().toISOString(),
    status: 'PENDING'
  });
  addOrderDialogVisible.value = true;
  console.log('发送的数据:',currentOrder);

};

const statusMapping = {
  PENDING: '待处理',
  SHIPPED: '已发货',
  DELIVERED: '已完成',
  CANCELED: '已取消',
};
onMounted(fetchOrders);
</script>

<template>
  <adminNav/>
  <div class="content">

    <h1 class="title">订单管理</h1>

    <!-- 搜索框和添加按钮 -->
    <div class="search-box">
      <el-input v-model="searchQuery" placeholder="搜索客户名称" class="search-input" />
      <el-button type="primary" icon="el-icon-plus" @click="handleAddOrder" class="add-button">添加订单</el-button>
    </div>

    <!-- 显示订单表格 -->
    <div class="table-container">
      <el-table :data="paginatedOrders" class="order-table" border style="min-width: 1200px;">
        <el-table-column label="序号" prop="index" width="80" align="center" />
        <el-table-column label="订单编号" prop="id"/>
        <el-table-column label="顾客名称" prop="customerName"/>
        <el-table-column label="电话号码" prop="phoneNumber"/>
        <el-table-column label="收货地址" prop="deliveryAddress"/>
        <el-table-column label="鲜花名称" prop="flowerName"/>
        <el-table-column label="图片" width="150">
          <template #default="{ row }">
            <el-image :src="row.imageUrl || '/images/default-flower.png'" fit="cover" class="flower-image"/>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity"/>
        <el-table-column label="总价" prop="totalPrice"/>
        <el-table-column label="下单时间" prop="createAt"/>
        <el-table-column label="订单状态" prop="status">
          <template #default="{ row }">
            {{ statusMapping[row.status] || '未知状态' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)" class="edit-btn">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredOrders.length"
        class="pagination"
    />

    <!-- 编辑订单弹出对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑订单" width="50%">
      <el-form :model="currentOrder" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="currentOrder.customerName"/>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="currentOrder.phoneNumber"/>
        </el-form-item>
        <el-form-item label="送货地址">
          <el-input v-model="currentOrder.deliveryAddress"/>
        </el-form-item>
        <el-form-item label="鲜花名称">
          <el-input v-model="currentOrder.flowerName"/>
        </el-form-item>
        <el-form-item label="数量">
          <el-input type="number" v-model="currentOrder.quantity"/>
        </el-form-item>
        <el-form-item label="总价">
          <el-input type="number" v-model="currentOrder.totalPrice"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="currentOrder.status">
            <el-option label="待处理" value="PENDING"/>
            <el-option label="已发货" value="SHIPPED"/>
            <el-option label="已完成" value="DELIVERED"/>
            <el-option label="已取消" value="CANCELED"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 添加订单弹出对话框 -->
    <el-dialog v-model="addOrderDialogVisible" title="添加新订单" width="50%">
      <el-form :model="currentOrder" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="currentOrder.customerName"/>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="currentOrder.phoneNumber"/>
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="currentOrder.deliveryAddress"/>
        </el-form-item>
        <el-form-item label="鲜花名称">
          <el-input v-model="currentOrder.flowerName"/>
        </el-form-item>
        <el-form-item label="数量">
          <el-input type="number" v-model="currentOrder.quantity"/>
        </el-form-item>
        <el-form-item label="总价">
          <el-input type="number" v-model="currentOrder.totalPrice"/>
        </el-form-item>
        <el-form-item label="订单日期">
          <el-input v-model="currentOrder.createAt"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="currentOrder.status">
            <el-option label="待处理" value="PENDING"/>
            <el-option label="已发货" value="SHIPPED"/>
            <el-option label="已完成" value="DELIVERED"/>
            <el-option label="已取消" value="CANCELED"/>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 删除确认弹框 -->
    <el-dialog
        :visible.sync="confirmDialogVisible"
        title="确认删除"
        width="30%"
    >
      <span>确定删除此订单吗?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<style scoped>
.content {
  margin-left: 250px;
  flex-grow: 1;
  padding: 20px;
  background-color: #f8f8f8;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.add-button {
  padding: 0 20px;
  background-color: #47a7f5;
  border-color: #47a7f5;
}

.table-container {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-button {
  padding: 8px 20px;
}

.el-dialog {
  border-radius: 10px;
}

.el-input, .el-select {
  width: 100%;
}

.el-form-item {
  margin-bottom: 15px;
}
</style>
