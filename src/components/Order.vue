<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";

const orders = ref([]);
const userId = sessionStorage.getItem("userId");
const showDeleteDialog = ref(false);
const selectedOrderId = ref(null);
const searchKeyword = ref("");
const filterStatus = ref("all");

// 获取订单数据
const fetchAllOrders = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/orders/${userId}/all`);
    // 只保留 isDeleted 为 0 的订单
    orders.value = response.data.filter((order) => order.isDeleted === 0);
    console.log(response.data);

  } catch (error) {
    console.error("获取订单列表失败:", error);
  }
};

const statusMapping = {
  PENDING: "待发货",
  SHIPPED: "已发货",
  DELIVERED: "已送达",
  CANCELED: "已取消",
};

// 计算属性：根据搜索关键字和筛选状态过滤订单
const filteredOrders = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    if (order.isDeleted) return false;

    // 按状态筛选
    if (filterStatus.value !== "all" && order.status.toLowerCase() !== filterStatus.value) {
      return false;
    }

    // 按关键字筛选
    return order.orderDetails.some((detail) =>
        detail.flowerName.toLowerCase().includes(keyword)
    );
  });
});

// 确认删除操作
const confirmDeleteOrder = (orderId) => {
  selectedOrderId.value = orderId;
  showDeleteDialog.value = true;
};

// 删除订单：更新后端删除状态
const deleteOrder = async () => {
  try {
    const response = await axios.put(
        `http://localhost:8080/api/orders/${selectedOrderId.value}/delete`,
        { isDeleted: true }
    );
    if (response.status === 200) {
      const order = orders.value.find((o) => o.id === selectedOrderId.value);
      if (order) order.isDeleted = true;
    }
    showDeleteDialog.value = false;
  } catch (error) {
    console.error("删除订单失败:", error);
    alert("删除订单失败，请稍后重试");
  }
};
// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // 使用本地时间格式显示
};

// 根据订单状态返回对应的标签类型
const getOrderStatusTag = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "canceled":
      return "danger";
    default:
      return "info";
  }
};

onMounted(fetchAllOrders);
</script>

<template>
  <NavigationPage/>
  <div class="main">
    <div class="filter-search">
      <el-button-group>
        <el-button
            :class="filterStatus === 'all' ? 'active-filter' : ''"
            @click="filterStatus = 'all'">
          全部订单
        </el-button>
        <el-button
            :class="filterStatus === 'pending' ? 'active-filter' : ''"
            @click="filterStatus = 'pending'">
          进行中订单
        </el-button>
        <el-button
            :class="filterStatus === 'completed' ? 'active-filter' : ''"
            @click="filterStatus = 'completed'">
          已完成订单
        </el-button>
      </el-button-group>
      <el-input
          v-model="searchKeyword"
          placeholder="请输入鲜花名称搜索"
          clearable
          class="search-box"
      />
    </div>

    <!-- 无订单时显示提示 -->
    <div v-if="filteredOrders.length === 0" class="empty-orders">
      <img
          src="../assets/images/order.png"
          class="empty-image"
      >
    </div>

    <!-- 有订单时显示表格 -->
    <el-table
        v-else
        :data="filteredOrders"
        border
        stripe
        style="width: 100%;"
        class="custom-table"
    >
      <el-table-column label="订单编号" prop="id" width="150"></el-table-column>
      <el-table-column label="状态" prop="status" width="120">
        <template #default="{ row }">
          <el-tag :type="getOrderStatusTag(row.status)" class="order-status">
            {{ statusMapping[row.status] || "未知状态" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单详情">
        <template #default="{ row }">
          <div v-for="detail in row.orderDetails" :key="detail.id" class="flower-detail">
            <el-image
                :src="detail.imageUrl || '/images/default-flower.png'"
                fit="cover"
                class="flower-image"
            ></el-image>
            <div class="flower-detail-info">
              <p><strong>{{ detail.flowerName }}</strong></p>
              <p>价格: ￥{{ detail.price.toFixed(2) }}</p>
              <p>数量: {{ detail.quantity }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总金额" prop="totalPrice" width="100">
        <template #default="{ row }">
          ￥{{ row.totalPrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="收货信息">
        <template #default="{ row }">
          <p><strong>收货人:</strong> {{ row.customerName }}</p>
          <p><strong>联系方式:</strong> {{ row.phoneNumber }}</p>
          <p><strong>收货地址:</strong> {{ row.address }}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
              type="danger"
              size="small"
              @click="confirmDeleteOrder(row.id)"
              class="delete-order"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
        title="确认删除"
        v-model="showDeleteDialog"
        width="400px"
        custom-class="custom-delete-dialog"
        @close="showDeleteDialog = false"
    >
      <div class="dialog-content">
        <p>确定要删除该订单吗？此操作无法撤销。</p>
      </div>
      <template #footer>
        <el-button class="cancel-btn" @click="showDeleteDialog = false" >取消</el-button>
        <el-button class="confirm-btn" type="danger" @click="deleteOrder">确认</el-button>
      </template>
    </el-dialog>

  </div>
  <FooterPage/>
</template>

<style scoped>
.main {
  padding: 100px;
  margin-top: 80px;
  margin-bottom: 150px;
}

.filter-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
  border: 2px solid #ec6975;
  border-radius: 6px;
}

.el-button {
  font-size: 16px;
  font-weight: bold;
  padding: 20px;
  color: #ec6975;
  border: 2px solid #ec6975;
  background-color: #FFFFFF;
  transition: all 0.3s ease;
}

.active-filter {
  background-color: #ec6975 !important;
  border-color: #ec6975 !important;
  color: #FFFFFF !important;
}

.el-button:hover {
  background-color: #fab4b8 !important;
  border-color: #ec6975 !important;
  color: #FFFFFF !important;
  transition: all 0.3s ease;
}

.active-filter:hover {
  background-color: #ffccd5 !important;
}

.empty-orders {
  text-align: center;
  margin-top: 50px;
}

.empty-image {
  width: 300px;
  margin-bottom: 20px;
}

.flower-detail {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.flower-image {
  width: 70px;
  height: 70px;
  border-radius: 4px;
  margin-right: 10px;
}

.flower-detail-info {
  font-size: 14px;
}

.order-status{
  text-align: center;
  font-size: 16px;
  margin-left: 15px;

}

.custom-table >>> .el-table__header-wrapper th {
  font-size: 16px;
  font-weight: bold;
  color: #FFFFFF;
  padding: 12px;
  text-align: center;
  background-color: #ec6975;
}

.custom-table{
  border: 2px solid #ec6975;
}

.delete-order{
  background-color: #ec6975;
  color: white;
  border: none;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  width: 70px;
  height: 40px;
  text-align: center;
  font-size: 13px;
}

.custom-delete-dialog {
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.custom-delete-dialog .el-dialog__title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #ec6975 !important;
}

.dialog-content {
  text-align: center;
  margin-top: 20px;
}

.dialog-content p {
  font-size: 16px;
  color: #555;
  margin-top: 5px;
  line-height: 1.6;
}

.el-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #f3f3f3;
  color: #8c8b8b;
  border: 1px solid #f3f3f3;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #d1caca !important;
  border-color: #ccc !important;
}

.confirm-btn {
  background-color: #ec6975;
  color: #fff;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background-color: #e85160 !important;
}
</style>
