<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AdminNav from "@/components/adminNav.vue";
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';  // 引入 ElMessage
import axios from "axios";

// 数据部分
const tableData = ref([]);  // 初始时不填充数据
const searchQuery = ref(''); // 搜索框的值

// 弹出对话框的显示状态
const dialogVisible = ref(false);
const confirmDialogVisible = ref(false); // 新增确认删除的对话框

// 存储当前正在编辑的用户数据
const currentUser = reactive({
  id: '',
  username: '',
  password: '',
  email: '',
  avatar: ''
});
const userToDelete = ref(null); // 存储待删除的用户

// 从后端获取用户数据
const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/users/allUsers');
    tableData.value = response.data;  // 更新表格数据
  } catch (error) {
    console.error("获取用户数据失败:", error);
  }
};

// 编辑按钮点击事件
const handleEdit = (row) => {
  console.log("编辑行数据:", row);
  Object.assign(currentUser, row);  // 使用 Object.assign 赋值
  dialogVisible.value = true;  // 显示对话框
};

// 保存更新的用户信息
const handleSave = async () => {
  try {
    const updatedUser = { ...currentUser };  // 获取当前用户数据
    const response = await axios.put(`http://localhost:8080/api/users/${updatedUser.id}`, updatedUser);
    console.log(response.data);
    dialogVisible.value = false;  // 关闭对话框

    // 更新表格数据
    const index = tableData.value.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      tableData.value[index] = updatedUser;
    }

    // 显示编辑成功的提示
    ElMessage.success("用户编辑成功！");
  } catch (error) {
    console.error("更新用户失败:", error);
  }
};

// 删除按钮点击事件
const handleDelete = (row) => {
  console.log("删除行数据:", row);
  userToDelete.value = row; // 设置待删除的用户
  confirmDialogVisible.value = true; // 显示确认删除的对话框
};

// 确认删除
const confirmDelete = async () => {
  const row = userToDelete.value;
  try {
    const response = await axios.delete(`http://localhost:8080/api/users/${row.id}`);
    console.log(response.data);
    // 从 tableData 中删除
    tableData.value = tableData.value.filter(item => item.id !== row.id);
    confirmDialogVisible.value = false; // 关闭删除确认对话框

    // 显示删除成功的提示
    ElMessage.success("用户删除成功！");
  } catch (error) {
    console.error("删除用户失败:", error);
  }
};

// 取消删除
const cancelDelete = () => {
  confirmDialogVisible.value = false; // 关闭删除确认对话框
};

// 分页数据
const currentPage4 = ref(1);
const pageSize = ref(10); // 每页显示10条数据

// 计算当前页显示的数据
const paginatedData = computed(() => {
  const start = (currentPage4.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  // 根据搜索查询过滤数据
  const filteredData = tableData.value.filter(user => {
    return user.username.includes(searchQuery.value) ||
        user.email.includes(searchQuery.value);
  });
  return filteredData.slice(start, end);
});

// 分页事件
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`);
  pageSize.value = val; // 更新页面大小
};

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`);
  currentPage4.value = val; // 更新当前页
};

// 头像上传前的检查（例如限制文件类型或大小）
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;  // 限制上传文件最大为2MB
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
  // 输出响应数据，查看其结构
  console.log('上传成功的响应:', response);

  // 检查返回的数据是否包含 avatar 字段
  if (response && response.avatar) {
    currentUser.avatar = response.avatar;  // 将头像路径赋值给当前用户的 avatar
    ElMessage.success('头像上传成功!');
  } else {
    ElMessage.error('头像上传失败，未返回头像路径!');
  }
};

// 在组件挂载时获取数据
onMounted(fetchData);
</script>

<template>
  <adminNav />
  <div class="content">
    <h1>用户管理</h1>
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱"
          class="search-input"
      />
    </div>

    <!-- 修改为使用 paginatedData -->
    <el-table :data="paginatedData" class="user-table" border>
      <!-- 序号列 -->
      <el-table-column label="序号" width="60">
        <template #default="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="账号" width="180" />
      <el-table-column prop="username" label="姓名" width="180" />
      <el-table-column prop="password" label="密码" />
      <el-table-column prop="email" label="邮件" width="180" />
      <el-table-column label="头像" width="180">
        <template #default="{ row }">
          <el-image :src="row.avatar || '/images/default-avatar.png'" fit="cover" class="avatar-image" />
        </template>
      </el-table-column>

      <!-- 操作列 -->
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
        <!-- 头像上传 -->
        <el-form-item label="头像" prop="avatar">
          <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/api/users/upload-avatar"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
            <el-button size="small" type="primary">选择头像</el-button>
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
</template>

<script setup>
</script>

<style scoped>
.content {
  margin-left: 250px;
  flex-grow: 1;
  padding: 20px;
  background-color: #f8f8f8;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
  border-radius: 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
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
  background-color: #f56c6c;
  border-color: #f56c6c;
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
</style>
