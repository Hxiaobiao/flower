<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import NavigationPage from '@/components/NavigationPage.vue';
import FooterPage from '@/components/FooterPage.vue';
import router from "@/router/index.js";

// 存储收藏列表
const collections = ref([]);

// 控制移除弹窗显示
const showRemoveDialog = ref(false);

// 存储当前要移除的 flowerId
const currentFlowerId = ref(null);

// 获取当前登录用户的ID
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

// 打开移除弹窗
const confirmRemoveCollection = (flowerId) => {
  currentFlowerId.value = flowerId;
  showRemoveDialog.value = true;
};

// 确认移除收藏
const removeFromCollection = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/collections/remove/${userId}/${currentFlowerId.value}`);
    // 从列表中移除已删除的收藏
    collections.value = collections.value.filter((collection) => collection.flowerId !== currentFlowerId.value);
    showRemoveDialog.value = false; // 关闭弹窗
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

<template>
  <div>
    <NavigationPage />
    <div class="main">
      <el-card class="outer-card" shadow="hover">
        <h1 class="title">我的收藏</h1>

      <div v-if="collections.length === 0" class="empty-state">
        <img src="../assets/images/collection.png" alt="暂无收藏" class="empty-image">
      </div>

      <div v-if="collections.length > 0" class="collection-list">
        <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-item"
            @click="goToFlowerDetail(collection.flowerId)"
        >
          <img :src="collection.imageUrl || '../assets/images/default-flower.png'" alt="鲜花图片" class="cart-image" />
          <div class="collection-details">
            <div class="details-header">
              <h2 class="flower-name">{{ collection.flowerName }}</h2>
              <p class="price">￥{{ collection.price }}</p>
              <button @click.stop="confirmRemoveCollection(collection.flowerId)" class="remove-btn">
                移除收藏
              </button>
            </div>
            <p class="flower-language">{{ collection.flowerLanguage }}</p>
          </div>
        </div>
      </div>
      </el-card>
    </div>

    <!-- 移除收藏弹窗 -->
    <el-dialog
        v-model="showRemoveDialog"
        title="确认移除"
        width="30%"
        @close="showRemoveDialog = false"
    >
      <p>您确定要移除该收藏吗？</p>
      <template #footer>
        <el-button @click="showRemoveDialog = false">取消</el-button>
        <el-button type="danger" @click="removeFromCollection">确认</el-button>
      </template>
    </el-dialog>

    <FooterPage />
  </div>
</template>

<style scoped>
.main {
  margin-top: 100px;
  padding: 100px;
}

.outer-card {
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  color: #ec6975;
  margin-bottom: 50px;
  font-weight: bold;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.empty-image {
  width: 300px;
  margin-bottom: 40px;
}

.collection-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
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
  height: 300px;
  object-fit: cover;
}

.collection-details {
  padding: 15px;
  text-align:left;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.flower-name {
  font-size: 1.5rem;
  font-weight: 900;
  color: #333;
  margin: 0;
}

.price {
  font-size: 1.5rem;
  color: #ec6975;
  font-weight: bold;
  margin-top: 10px;
  margin-left: 50px;
}

.flower-language {
  font-size: 1.1rem;
  color: #666;
}

.remove-btn {
  background-color: #ec6975;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 11px;
  letter-spacing:1.2px;
}

.remove-btn:hover {
  background-color: #d95e6a;
}
</style>
