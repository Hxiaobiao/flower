<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElTable, ElTableColumn, ElImage, ElUpload, ElPagination } from 'element-plus';
import axios from 'axios';
import AdminNav from "@/components/adminNav.vue";

// 数据部分
const flowers = ref([]);
const searchQuery = ref('');
const dialogVisible = ref(false);
const addFlowerDialogVisible = ref(false);
const confirmDialogVisible = ref(false);
const currentFlower = reactive({
  id: '',
  flowerName: '',
  price: '0.00',
  imageUrl: '',
  flowerLanguage: '',
  category: '',
  purpose: '',
  material: '',
  packing: '',
  stock: '0'
});
const flowerToDelete = ref(null);

// 获取所有鲜花数据
const fetchFlowers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/flowers/all');
    console.log('Fetched Flowers:', response.data); // 验证数据
    flowers.value = response.data;
  } catch (error) {
    console.error('获取鲜花数据失败:', error);
  }
};

// 搜索功能
const filteredFlowers = computed(() => {
  return flowers.value.filter(flower => flower.flowerName && flower.flowerName.includes(searchQuery.value));
});

// 编辑功能
const handleEdit = (flower) => {
  Object.assign(currentFlower, flower);
  dialogVisible.value = true;
};

// 保存编辑后的鲜花信息
const handleSave = async () => {
  try {
    const updatedFlower = {...currentFlower};
    const response = updatedFlower.id
        ? await axios.put(`http://localhost:8080/api/flowers/${updatedFlower.id}`, updatedFlower)
        : await axios.post('http://localhost:8080/api/flowers/add', updatedFlower);

    if (updatedFlower.id) {
      const index = flowers.value.findIndex(item => item.id === updatedFlower.id);
      if (index !== -1) {
        flowers.value[index] = response.data;
      }
    } else {
      flowers.value.push(response.data);
    }

    dialogVisible.value = false;
    addFlowerDialogVisible.value = false; // 隐藏添加对话框
    ElMessage.success('鲜花信息保存成功！');
  } catch (error) {
    console.error('保存鲜花信息失败:', error);
  }
};


// 删除功能
const handleDelete = (flower) => {
  flowerToDelete.value = flower;
  confirmDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:8080/api/flowers/${flowerToDelete.value.id}`);
    flowers.value = flowers.value.filter(flower => flower.id !== flowerToDelete.value.id);
    confirmDialogVisible.value = false;
    ElMessage.success('鲜花删除成功！');
  } catch (error) {
    console.error('删除鲜花失败:', error);
  }
};

// 取消删除
const cancelDelete = () => {
  confirmDialogVisible.value = false;
};

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const paginatedFlowers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredFlowers.value.slice(start, start + pageSize.value);
});

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 头像上传前的检查（例如限制文件类型或大小）
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;  // 限制上传文件最大为2MB
  if (!isImage) {
    ElMessage.error('只能上传图片!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isImage && isLt2M;
};

// 头像上传成功后的处理
const handleImageSuccess = (response) => {
  currentFlower.imageUrl = response.imageUrl;
  ElMessage.success('图片上传成功!');
};

// 添加鲜花
const handleAddFlower = () => {
  Object.assign(currentFlower, {
    id: '',
    flowerName: '',
    price: '',
    imageUrl: '',
    flowerLanguage: '',
    category: '',
    purpose: '',
    material: '',
    packing: '',
    stock: ''
  });
  addFlowerDialogVisible.value = true;
};

onMounted(fetchFlowers);
</script>

<template>
  <adminNav/>
  <div class="content">
    <div class="card-container">
    <div class="search-box">
      <h1>花卉管理</h1>
      <input v-model="searchQuery" placeholder="请输入花卉名称进行搜索" class="search-input"/>
      <el-button type="primary" @click="handleAddFlower" class="add-flower-btn">添加花卉</el-button>
    </div>

    <!-- 显示花卉表格 -->
    <el-table :data="paginatedFlowers" class="flower-table" border :header-cell-style="{ backgroundColor: '#ec6975', color: '#FFFFFF', fontWeight: 'bold',fontSize:'17px' }">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column label="图片" width="150">
        <template #default="{ row }">
          <el-image :src="row.imageUrl || '/images/default-flower.png'" fit="cover" class="flower-image"/>
        </template>
      </el-table-column>
      <el-table-column label="编号" prop="id" width="100"/>
      <el-table-column label="花卉名称" prop="flowerName"/>
      <el-table-column label="价格" prop="price"/>
      <el-table-column label="花语" prop="flowerLanguage"/>
      <el-table-column label="类别" prop="category"/>
      <el-table-column label="用途" prop="purpose"/>
      <el-table-column label="描述" prop="material"/>
      <el-table-column label="包装" prop="packing"/>

      <el-table-column label="库存" prop="stock"/>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)" class="edit-btn">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)" class="delete-btn">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredFlowers.length"
      />
    </div>

    <!-- 编辑花卉弹出对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑花卉" width="50%">
      <el-form :model="currentFlower" label-width="100px">
        <el-form-item label="花卉名称">
          <el-input v-model="currentFlower.flowerName"/>
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="currentFlower.price"/>
        </el-form-item>
        <el-form-item label="花语">
          <el-input v-model="currentFlower.flowerLanguage"/>
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="currentFlower.category"/>
        </el-form-item>
        <el-form-item label="用途">
          <el-input v-model="currentFlower.purpose"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentFlower.material"/>
        </el-form-item>
        <el-form-item label="包装">
          <el-input v-model="currentFlower.packing"/>
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model="currentFlower.stock"/>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
              class="image-uploader"
              action="http://localhost:8080/api/flowers/upload-image"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload">
            <el-button size="small" type="primary" class="img">选择图片</el-button>
          </el-upload>
          <el-image :src="currentFlower.imageUrl || '/images/default-flower.png'" fit="cover" class="flower-image"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 添加花卉弹出对话框 -->
    <el-dialog v-model="addFlowerDialogVisible" title="添加新花卉" width="50%">
      <el-form :model="currentFlower" label-width="100px">
        <el-form-item label="花卉名称">
          <el-input v-model="currentFlower.flowerName"/>
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="currentFlower.price"/>
        </el-form-item>
        <el-form-item label="花语">
          <el-input v-model="currentFlower.flowerLanguage"/>
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="currentFlower.category"/>
        </el-form-item>
        <el-form-item label="用途">
          <el-input v-model="currentFlower.purpose"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentFlower.material"/>
        </el-form-item>
        <el-form-item label="包装">
          <el-input v-model="currentFlower.packing"/>
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model="currentFlower.stock"/>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
              class="image-uploader"
              action="http://localhost:8080/api/flowers/upload-image"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload">
            <el-button size="small" type="primary" class="img">选择图片</el-button>
          </el-upload>
          <el-image :src="currentFlower.imageUrl || '/images/default-flower.png'" fit="cover" class="flower-image"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFlowerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog v-model="confirmDialogVisible" title="确认删除" width="30%">
      <p>此操作不可撤销，您确定要删除该鲜花吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </span>
    </el-dialog>
  </div>
  </div>
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

.add-flower-btn {
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

.add-flower-btn:hover {
  background-color: #f46a76;
  border: 2px solid #ec6975;
  color: #fff;
  transform: scale(1.05);
}

.add-flower-btn:focus {
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

.image-uploader >>> input[type="file"] {
  display: none !important;
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

.img{
  margin-right: 20px;
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
