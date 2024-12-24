<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AdminNav from "@/components/adminNav.vue";
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';  // 引入 ElMessage
import axios from "axios";

const tableData = ref([]);
const searchQuery = ref('');
const dialogVisible = ref(false);
const confirmDialogVisible = ref(false);
const addUserDialogVisible = ref(false);
const currentUser = reactive({
  id: '',
  username: '',
  password: '',
  email: '',
  avatar: ''
});
const userToDelete = ref(null);

// 从后端获取用户数据
const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/users/allUsers');
    tableData.value = response.data;
  } catch (error) {
    console.error("获取用户数据失败:", error);
  }
};

// 编辑按钮点击事件
const handleEdit = (row) => {
  console.log("编辑行数据:", row);
  Object.assign(currentUser, row);
  dialogVisible.value = true;
};

// 保存更新的用户信息
const handleSave = async () => {
  try {
    const updatedUser = { ...currentUser };
    const response = await axios.put(`http://localhost:8080/api/users/${updatedUser.id}`, updatedUser);
    console.log(response.data);
    dialogVisible.value = false;

    const index = tableData.value.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      tableData.value[index] = updatedUser;
    }

    ElMessage.success("用户编辑成功！");
  } catch (error) {
    console.error("更新用户失败:", error);
  }
};

// 删除按钮点击事件
const handleDelete = (row) => {
  console.log("删除行数据:", row);
  userToDelete.value = row;
  confirmDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  const row = userToDelete.value;
  try {
    const response = await axios.delete(`http://localhost:8080/api/users/${row.id}`);
    console.log(response.data);
    tableData.value = tableData.value.filter(item => item.id !== row.id);
    confirmDialogVisible.value = false;
    ElMessage.success("用户删除成功！");
  } catch (error) {
    console.error("删除用户失败:", error);
  }
};

// 取消删除
const cancelDelete = () => {
  confirmDialogVisible.value = false;
};

// 分页数据
const currentPage4 = ref(1);
const pageSize = ref(10);

// 计算当前页显示的数据
const paginatedData = computed(() => {
  const start = (currentPage4.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const filteredData = tableData.value.filter(user => {
    return user.username.includes(searchQuery.value) ||
        user.email.includes(searchQuery.value);
  });
  return filteredData.slice(start, end);
});

// 分页事件
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`);
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`);
  currentPage4.value = val;
};

// 头像上传前的检查（例如限制文件类型或大小）
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error('只能上传图片!');
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return isImage && isLt2M;
};

// 头像上传成功后的处理
const handleAvatarSuccess = (response, file) => {
  console.log('上传成功的响应:', response);
  if (response && response.avatar) {
    currentUser.avatar = response.avatar;
    newUser.avatar = response.avatar;
    ElMessage.success('头像上传成功!');
  } else {
    ElMessage.error('头像上传失败，未返回头像路径!');
  }
};

// 新用户数据
const newUser = reactive({
  username: '',
  password: '',
  email: '',
  avatar: ''
});

// 添加用户按钮点击事件
const handleAddUser = () => {
  newUser.username = '';
  newUser.password = '';
  newUser.email = '';
  newUser.avatar = '';
  addUserDialogVisible.value = true;
};

// 提交创建新用户
const handleCreateUser = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/users/register', newUser);
    console.log(response.data);
    addUserDialogVisible.value = false;
    fetchData();
    ElMessage.success("用户添加成功！");
  } catch (error) {
    console.error("添加用户失败:", error);
    ElMessage.error("添加用户失败！");
  }
};

// 在组件挂载时获取数据
onMounted(fetchData);
</script>

<template>
  <adminNav />
  <div class="content">
    <div class="card-container">
    <div class="search-box">
      <h1>用户管理</h1>
      <input
          v-model="searchQuery"
          placeholder="请输入用户名或邮箱进行搜索"
          class="search-input"
      />
      <el-button type="primary" @click="handleAddUser" class="add-user-btn">
        添加用户
      </el-button>

    </div>

    <el-table :data="paginatedData" class="user-table" border :header-cell-style="{ backgroundColor: '#ec6975', color: '#FFFFFF', fontWeight: 'bold',fontSize:'17px'}">
      <el-table-column label="序号" width="60">
        <template #default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="180">
        <template #default="{ row }">
          <el-image :src="row.avatar || '/images/default-avatar.png'" fit="cover" class="avatar-image" />
        </template>
      </el-table-column>
      <el-table-column prop="id" label="账号" width="180" />
      <el-table-column prop="username" label="姓名" width="180" />
      <el-table-column prop="password" label="密码" />
      <el-table-column prop="email" label="邮件" width="180" />
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
          :current-page="currentPage4"
          :page-sizes="[10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.length"
      />
    </div>

    <!-- 编辑用户弹出对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="50%">
      <el-form :model="currentUser" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUser.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="currentUser.password" type="password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/users/upload-avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
            <el-button size="small" type="primary" class="img">选择头像</el-button>
          </el-upload>
          <el-image :src="currentUser.avatar || '/images/default-avatar.png'" fit="cover" class="avatar-image" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog v-model="confirmDialogVisible" title="确认删除" width="30%">
      <p>此操作不可撤销，您确定要删除该用户吗？</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </span>
    </el-dialog>
  </div>
  </div>

  <!-- 添加用户对话框 -->
  <el-dialog v-model="addUserDialogVisible" title="添加用户" width="50%" class="add-user-dialog">
    <el-form :model="newUser" label-width="120px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="newUser.username" class="input-field" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="newUser.password" type="password" class="input-field" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="newUser.email" class="input-field" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/api/users/upload-avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
          <el-button size="small" type="primary" class="img">选择头像</el-button>
        </el-upload>
        <el-image :src="newUser.avatar || '/images/default-avatar.png'" fit="cover" class="avatar-image" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateUser">保存</el-button>
      </span>
  </el-dialog>
</template>

<style scoped>
.content {
  margin-left: 230px;
  flex-grow: 1;
  padding: 20px;
  background-color: #f8f8f8;
  height: 900px;
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

.add-user-btn {
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

.add-user-btn:hover {
  background-color: #f46a76;
  border: 2px solid #ec6975;
  color: #fff;
  transform: scale(1.05);
}

.add-user-btn:focus {
  outline: none;
  border: 2px solid #f46a76;
  color: #fff;
}

.user-table {
  margin-top: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 40px;
  height: 40px;
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

.avatar-uploader >>> input[type="file"] {
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
