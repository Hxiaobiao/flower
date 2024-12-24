<script setup>
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import {onMounted, ref, watch} from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// 存储鲜花数据和收藏列表
const flowers = ref([]);
const collections = ref([]);
const router = useRouter();

// 登录模态框相关状态
const showLoginModal = ref(false);
const username = ref('');
const password = ref('');
const showLoginInfo = ref(false);

// 获取当前用户ID
const userId = sessionStorage.getItem('userId');

// 获取所有花卉数据
const fetchFlowers = async (params) => {
  try {
    const response = await axios.get('http://localhost:8080/api/flowers/all', { params });
    flowers.value = response.data;
  } catch (error) {
    console.error('获取鲜花数据失败:', error);
  }
};

// 获取当前用户的收藏列表
const fetchCollections = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/collections/user/${userId}`);
    collections.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取收藏列表失败:', error);
  }
};

// 判断商品是否已经收藏
const isFlowerInCollection = (flowerId) => {
  return Array.isArray(collections.value) && collections.value.some((collection) => collection.flowerId === flowerId);
};

// 跳转到花卉详情页
const goToFlowerDetail = (id) => {
  router.push({ name: 'flowerDetail', params: { id } });
};

// 添加到收藏处理函数
const handleAddToCollection = async (flower) => {
  if (!userId) {
    alert('请先登录！');
    return;
  }

  try {
    if (isFlowerInCollection(flower.id)) {
      // 如果已经收藏，则取消收藏
      await removeFromCollection(flower.id);
      alert(`${flower.flowerName} 已取消收藏！`);
    } else {
      // 如果未收藏，则添加收藏
      await addToCollection(flower);
      alert(`${flower.flowerName} 已收藏！`);
    }
    fetchCollections(); // 更新收藏列表
  } catch (error) {
    console.error('操作失败:', error);
    alert('操作失败，请重试。');
  }
};

// 从收藏中移除
const removeFromCollection = async (flowerId) => {
  try {
    await axios.delete(`http://localhost:8080/api/collections/remove/${userId}/${flowerId}`);
  } catch (error) {
    console.error('取消收藏失败:', error);
    throw error;
  }
};

// 添加到收藏
const addToCollection = async (flower) => {
  try {
    const collectionItem = {
      userId: userId,
      flowerId: flower.id,
    };

    const response = await axios.post('http://localhost:8080/api/collections/add', collectionItem);
    if (response.status === 200) {
      fetchCollections();  // 更新收藏列表
    }
  } catch (error) {
    console.error('收藏失败:', error);
    alert('收藏失败，请重试。');
  }
};

// 处理登录
const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/users/login', {
      username: username.value,
      password: password.value
    });

    alert('登录成功');
    showLoginInfo.value = true;

    showLoginModal.value = false;
    // 存储用户名到sessionStorage
    sessionStorage.setItem('username', username.value);

    const data = response.data;
    console.log(data);

    // 获取用户的 ID
    const userId = data.userId;
    if (userId) {
      // 将用户ID存储到sessionStorage
      sessionStorage.setItem('userId', userId);
    }

    // 根据用户角色进行页面跳转
    if (data.role === 'ADMIN') {
      router.push('/adminHome');
    } else if (data.role === 'USER') {
      // 刷新当前页面
      window.location.reload();
    }

  } catch (error) {
    console.log("用户名:", username.value);
    console.log("密码:", password.value);

    if (error.response && error.response.status === 401) {
      message.value = error.response.data.message;
    } else if (error.request) {
      message.value = '登录失败: ' + error.message;
    } else {
      message.value = '登录失败: ' + error.message;
    }
  }
}

// 用于存储筛选条件的响应式变量
const searchQuery = ref('');
const purpose = ref('全部');
const category = ref('全部');
const packing = ref('全部');

// 筛选条件值
const purposes = ['全部', '爱情', '亲情',  '祝福', '表白','装饰','纪念日'];
const categorys = ['全部', '玫瑰', '百合', '康乃馨', '郁金香', '向日葵','绣球花','蔷薇','绿植','小雏菊','满天星','牡丹','芍药','大丽花','紫罗兰'];
const packings = ['全部', '精致花束','花瓶系列', '盆栽'];

// 构建查询参数对象
const buildSearchParams = () => {
  return {
    searchQuery: searchQuery.value,
    purpose: purpose.value !== '全部' ? purpose.value : null,
    category: category.value !== '全部' ? category.value : null,
    packing: packing.value !== '全部' ? packing.value : null,
  };
};

// 处理搜索逻辑
const performSearch = async () => {
  const params = buildSearchParams();
  console.log('Performing search with params:', params); // 调试信息
  await fetchFlowers(params);
};

// 监听 searchQuery 的变化并自动执行搜索
watch(searchQuery, async (newVal) => {
  if (newVal === '') {
    // 如果搜索框被清空，则重置其他筛选条件为默认值（如果需要的话）
    purpose.value = '全部';
    category.value = '全部';
    packing.value = '全部';
  }
  await performSearch();
});

// 在组件挂载后加载数据
onMounted(() => {
  performSearch();  // 初始加载时执行搜索，默认情况下显示所有鲜花
  fetchCollections();  // 获取用户的收藏列表
});
</script>

<template>
  <NavigationPage />
  <div class="main">
    <!-- 固定筛选栏 -->
    <div class="filter-options">
      <div class="filter-buttons">
        <button class="filter-btn" @click="performSearch">全部</button>

        <!-- 用途筛选 -->
        <div class="dropdown-filter">
          <label for="purpose-select" class="dropdown-label">用途:</label>
          <el-select
              v-model="purpose"
              placeholder="选择用途"
              @change="performSearch"
              clearable
              class="filter-select"
          >
            <el-option
                v-for="p in purposes"
                :key="p"
                :label="p"
                :value="p"
            />
          </el-select>
        </div>

        <!-- 花卉种类筛选 -->
        <div class="dropdown-filter">
          <label for="material-select" class="dropdown-label">种类:</label>
          <el-select
              v-model="category"
              placeholder="选择种类"
              @change="performSearch"
              clearable
              class="filter-select"
          >
            <el-option
                v-for="m in categorys"
                :key="m"
                :label="m"
                :value="m"
            />
          </el-select>
        </div>

        <!-- 包装筛选 -->
        <div class="dropdown-filter">
          <label for="packing-select" class="dropdown-label">包装:</label>
          <el-select
              v-model="packing"
              placeholder="选择包装"
              @change="performSearch"
              clearable
              class="filter-select"
          >
            <el-option
                v-for="p in packings"
                :key="p"
                :label="p"
                :value="p"
            />
          </el-select>
        </div>
      </div>
      <div class="search-group">
        <input type="text" class="search-input" placeholder="请输入花卉名称" v-model="searchQuery" />
      </div>
    </div>

    <div class="banner">
      <img src="../assets/images/category1.png" alt="Banner Image">
    </div>

    <div v-if="flowers.length > 0" class="flower-list">
      <div
          v-for="flower in flowers"
          :key="flower.id"
          class="flower-item"
          @click="goToFlowerDetail(flower.id)"
      >
        <div class="flower-img">
        <img :src="flower.imageUrl || '../assets/images/default-flower.png'" alt="花卉图片" class="flower-image" />
        </div>
        <div class="flower-details">
          <div class="flower-info">
            <h2 class="flower-name">{{ flower.flowerName }}</h2>
          </div>
          <p class="flower-price">{{ flower.price }}</p>
          <button
              @click.stop="handleAddToCollection(flower)"
              class="add-to-collection-btn"
          >
            <span v-if="isFlowerInCollection(flower.id)" class="icon-heart-filled"   :style="{ color: '#FF69B4', fontSize: '20px' }">❤️</span>
            <span v-else class="icon-heart-empty"  :style="{ color: '#FF69B4', fontSize: '30px' }">♡</span>
          </button>
        </div>
        <p class="flower-material">{{ flower.flowerLanguage }}</p>
      </div>
    </div>
    <div v-else>
      <p>暂无花卉</p>
    </div>
  </div>

  <!-- 登录弹框 -->
  <div v-if="showLoginModal" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <h3>登录</h3>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="username" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="password" class="form-control" required />
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">登录</button>
            <button type="button" class="btn btn-secondary" @click="showLoginModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <FooterPage />
</template>

<style scoped>
.main {
  margin-top: 110px;
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.banner img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 30px;
}

.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #FFFFFF;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-left: 100px;
}

.filter-btn {
  padding: 10px 30px;
  font-size: 2rem;
  border: none;
  border-radius: 15px;
  background: linear-gradient(45deg, #ec6975, #ea5a65);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, #ec6975, #e44e5c);
}

.dropdown-filter {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dropdown-label {
  font-size: 1.5rem;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  font-size: 1.5rem;
  width: 120px;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-right: 250px;
  font-size: 1.5rem;
  color: #ec6975;
}

.search-input {
  padding: 10px;
  border-radius: 25px;
  width: 400px;
  border: 2px solid #ec6975;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus {
  border-color: #ec6975;
  outline: none;
  box-shadow: 0 0 5px rgba(236, 105, 117, 0.5);
}

.search-input::placeholder {
  color: #999;
  font-size: 1.2rem;
}

.search-input:hover {
  border-color: #e44e5c;
}

.flower-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  justify-items: center;
  margin: 30px;
  padding: 20px;
}

.flower-item {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  width: 380px;
}

.flower-img{
  overflow: hidden;
}

.flower-image {
  width: 100%;
  height: 350px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.flower-image:hover {
  transform: scale(1.2);
}

.flower-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.flower-name {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  margin-left: 15px;
}

.flower-price {
  font-size: 2rem;
  font-weight: bold;
  color: #ec6975;
  margin-left: 150px;
  margin-top: 15px;
}

.flower-material {
  font-size: 1.5rem;
  margin-left: 15px;
  margin-right: 15px;
}

.add-to-collection-btn {
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  color: #ec6975;
  margin-right: 15px;
}

.add-to-collection-btn:hover {
  transform: scale(1.5);
}

.icon-heart-filled {
  color: #ec6975;
}

.flower-details .icon-heart-empty {
  color: #ed2d53 !important;
}

.modal-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-wrapper {
  width: 400px;
  max-width: 100%;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>