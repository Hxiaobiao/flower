<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import defaultAvatar from '@/assets/images/default-avatar.png';

const userInfo = ref(null);
const router = useRouter();

// 默认头像图片
const getAvatarUrl = (avatar) => {
  return avatar && avatar.trim() ? avatar : defaultAvatar;
};

// 存储头像的 URL
const avatarUrl = ref('');
const selectedFile = ref(null);

// 上传相关变量
const uploadProgress = ref(0);
const isUploading = ref(false);

// 上传成功的回调
const handleUploadSuccess = (response) => {
  if (response && response.avatar) {
    avatarUrl.value = response.avatar;
    updateUserAvatar(response.avatar);
    userInfo.value.avatar = response.avatar;
    alert('头像上传成功');
  } else {
    alert('头像上传失败，请稍后重试');
  }
};

// 上传失败的回调
const handleUploadError = () => {
  alert('头像上传失败，请检查网络连接');
  isUploading.value = false;
};

const updateUserAvatar = async (avatarUrl) => {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await axios.put(`http://localhost:8080/api/users/${userId}`, {
      avatar: avatarUrl,
    });
    if (response.status === 200) {
      alert('头像更新成功');
    }
  } catch (error) {
    console.error('头像更新失败', error);
    alert('头像更新失败，请稍后重试');
  }
};


// 获取用户数据
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/users/${userId.value}`);
    if (response.status === 200) {
      userInfo.value = response.data;
      avatarUrl.value = response.data.avatar || defaultAvatar;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    alert("加载用户信息失败，请重试。");
  }
};

// 文件改变事件，选择文件后预览
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    avatarUrl.value = URL.createObjectURL(file);
    uploadAvatar();
  }
};

// 上传头像
const uploadAvatar = async () => {
  if (!selectedFile.value) {
    alert("请选择要上传的文件！");
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await axios.post(
        `http://localhost:8080/api/users/upload-avatar`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
    );

    if (response.data && response.data.avatar) {
      avatarUrl.value = response.data.avatar;
      updateUserAvatar(response.data.avatar);
    } else {
      alert("头像上传失败，请稍后重试。");
    }
  } catch (error) {
    console.error("上传失败:", error);
    alert("头像上传失败，请检查网络连接。");
  }
};

// 用户退出登录
const logout = () => {
  sessionStorage.clear();
  router.push({ name: 'flowerHome' }).then(() => {
    alert("已成功退出登录");
  });
};

onMounted(() => {
  if (userId) {
    fetchUserInfo();
  } else {
    alert('用户未登录');
  }
});

const userId = ref(sessionStorage.getItem('userId'));
const addresses = ref([]);
const newAddress = ref({ name: '', phoneNumber: '', address: '', isDefault: 'false' });
const editedAddress = ref(null);
const editDialogVisible = ref(false);
const deleteAddressDialogVisible = ref(false);
const addressToDelete = ref(null);

// 获取用户的所有地址
const fetchAddresses = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/addresses/user/${userId.value}`);
    addresses.value = response.data;
  } catch (error) {
    console.error("获取地址失败:", error);
  }
};

// 删除地址操作，打开确认弹窗
const openDeleteAddressDialog = (address) => {
  addressToDelete.value = address;
  deleteAddressDialogVisible.value = true;
};

// 确认删除地址
const confirmDeleteAddress = async () => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/addresses/delete/${addressToDelete.value.id}`);
    alert(response.data);
    fetchAddresses();
    deleteAddressDialogVisible.value = false;
  } catch (error) {
    console.error("删除地址失败:", error);
    alert("删除地址失败，请稍后重试");
    deleteAddressDialogVisible.value = false;
  }
};

// 添加新地址
const addAddress = async () => {
  try {
    newAddress.value.userId = userId.value;
    console.log("New Address: ", newAddress.value);
    const response = await axios.post("http://localhost:8080/api/addresses/add", newAddress.value);
    alert(response.data);
    fetchAddresses();
  } catch (error) {
    console.error("添加地址失败:", error);
  }
};

const openEditDialog = (address) => {
  editedAddress.value = { ...address };
  editDialogVisible.value = true;
};

const closeEditDialog = () => {
  console.log("关闭弹窗");
  editDialogVisible.value = false;
  editedAddress.value = null;
};

// 更新地址
const updateAddress = async () => {
  try {
    const response = await axios.put(`http://localhost:8080/api/addresses/update/${editedAddress.value.id}`, editedAddress.value);
    alert(response.data);
    fetchAddresses();
    closeEditDialog();
  } catch (error) {
    console.error("更新地址失败:", error);
  }
};

// 删除地址
const deleteAddress = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/addresses/delete/${id}`);
    alert(response.data);
    fetchAddresses();
  } catch (error) {
    console.error("删除地址失败:", error);
  }
};

const saveUserInfo = async () => {
  try {
    if (!userInfo.value || !userInfo.value.id) {
      alert("用户信息加载错误");
      return;
    }
    const response = await axios.put(`http://localhost:8080/api/users/${userInfo.value.id}`, {
      username: userInfo.value.username,
      email: userInfo.value.email,
    });
    if (response.status === 200) {
      alert("用户信息更新成功");
    } else {
      alert("更新失败，请稍后重试");
    }
  } catch (error) {
    console.error("更新用户信息失败:", error);
    alert("更新用户信息失败，请稍后重试");
  }
};

// 修改密码相关变量
const passwordDialogVisible = ref(false);

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isSubmitting = ref(false);

// 打开修改密码弹窗
const openPasswordDialog = () => {
  passwordDialogVisible.value = true;
};

// 关闭修改密码弹窗
const closePasswordDialog = () => {
  passwordDialogVisible.value = false;
  // 重置表单
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};

// 提交修改密码表单
const submitPasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert("新密码和确认密码不一致");
    return;
  }
  // 前端校验旧密码
  if (passwordForm.value.oldPassword !== userInfo.value.password) {
    alert("旧密码不正确");
    return;
  }
  try {
    isSubmitting.value = true;
    const response = await axios.put(`http://localhost:8080/api/users/${userId.value}`, {
      ...userInfo.value,
      password: passwordForm.value.newPassword,
    });
    if (response.status === 200) {
      alert("密码修改成功");
      closePasswordDialog();
    } else {
      alert("密码修改失败，请检查输入");
    }
  } catch (error) {
    console.error("修改密码失败:", error);
    alert("修改密码失败，请稍后重试");
  } finally {
    isSubmitting.value = false;
  }
};

// 控制注销账号确认弹窗
const deleteAccountDialogVisible = ref(false);

// 打开注销账号弹窗
const openDeleteAccountDialog = () => {
  deleteAccountDialogVisible.value = true;
};

// 关闭注销账号弹窗
const closeDeleteAccountDialog = () => {
  deleteAccountDialogVisible.value = false;
};

// 确认注销账号
const confirmDeleteAccount = async () => {
  try {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      alert("未找到用户信息，无法注销账号");
      return;
    }
    // 调用后端接口删除账号
    const response = await axios.delete(`http://localhost:8080/api/users/${userId}`);
    if (response.status === 200) {
      alert("账号已成功注销");
      sessionStorage.clear();
      router.push({ name: 'flowerHome' });
    } else {
      alert("注销账号失败，请稍后重试");
    }
  } catch (error) {
    console.error("注销账号失败:", error);
    alert("注销账号失败，请稍后重试");
  } finally {
    closeDeleteAccountDialog(); // 关闭弹窗
  }
};

onMounted(() => {
  if (userId.value) {
    fetchAddresses();  // 加载用户地址
  } else {
    alert('用户未登录');
  }
});
</script>

<template>
  <NavigationPage />
  <div class="container">
    <div class="sidebar">
      <h2>个人中心</h2>
      <ul class="menu">
        <li class="active"><a href="#">个人信息</a></li>
        <li><a href="/order">我的订单</a></li>
        <li><a href="/collection">我的收藏</a></li>
        <li><a href="javascript:void(0);" @click="openPasswordDialog">修改密码</a></li>
        <li><a href="javascript:void(0);" @click="openDeleteAccountDialog">注销账号</a></li>
        <li><a href="javascript:void(0);" @click="logout">退出登录</a></li>
      </ul>
    </div>

    <div v-if="userInfo" class="content">
      <h1 class="section-title">个人信息</h1>
      <div class="profile">
        <div class="avatar-upload-container">
          <label for="fileInput" class="avatar-label">
            <img
                :src="avatarUrl || '../assets/default-avatar.png'"
                alt="用户头像"
                class="avatar-image"
            />
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="onFileChange"
            />
          </label>
        </div>
        <div class="profile-info">
          <div class="form-group">
            <label>用户名：</label>
            <input type="text" v-model="userInfo.username" class="input-group"/>
          </div>
          <div class="form-group">
            <label>绑定邮箱：</label>
            <input type="email" v-model="userInfo.email" />
          </div>
          <button class="save-btn" @click="saveUserInfo">保存</button>
        </div>
      </div>

      <!-- 地址管理 -->
      <h1 class="section-title">管理地址</h1>
      <div class="address-management">
        <!-- 添加新地址 -->
        <h3>新增地址</h3>
        <div class="address-form">
          <input v-model="newAddress.name" placeholder="收货人" />
          <input v-model="newAddress.phoneNumber" placeholder="手机号" />
          <input v-model="newAddress.address" placeholder="详细地址" />
          <select v-model="newAddress.isDefault">
            <option value="true">设为默认</option>
            <option value="false">不设为默认</option>
          </select>
          <button @click="addAddress">添加地址</button>
        </div>

        <!-- 地址列表表格 -->
        <h3>已有地址</h3>
        <el-table :data="addresses" border stripe style="width: 100%">
          <el-table-column prop="name" label="收货人" width="120"></el-table-column>
          <el-table-column prop="phoneNumber" label="手机号" width="150"></el-table-column>
          <el-table-column prop="address" label="详细地址"></el-table-column>
          <el-table-column
              label="是否默认"
              width="100"
              align="center"
          >
            <template #default="{ row }">
              <el-tag :type="row.isDefault === 'true' ? 'success' : 'info'">
                {{ row.isDefault === 'true' ? '默认' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="openDeleteAddressDialog(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 编辑地址弹窗 -->
    <el-dialog
        v-model="editDialogVisible"
        title="编辑地址"
        width="30%"
        style="font-size: 20px;font-weight: bold"
        @close="closeEditDialog"
    >
      <template v-if="editedAddress">
        <el-form :model="editedAddress">
          <el-form-item label="收货人" class="shr">
            <el-input v-model="editedAddress.name" placeholder="请输入收货人" />
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="editedAddress.phoneNumber" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="editedAddress.address" placeholder="请输入详细地址" />
          </el-form-item>
          <el-form-item label="是否默认">
            <el-select v-model="editedAddress.isDefault" placeholder="选择是否默认">
              <el-option label="是" value="true"></el-option>
              <el-option label="否" value="false"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="updateAddress">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="400px"
        @close="closePasswordDialog"
    >
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="旧密码">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入旧密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closePasswordDialog">取消</el-button>
        <el-button
            type="primary"
            :loading="isSubmitting"
            @click="submitPasswordChange"
        >
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 注销账号确认弹窗 -->
    <el-dialog
        v-model="deleteAccountDialogVisible"
        title="确认注销账号"
        width="400px"
        @close="closeDeleteAccountDialog"
    >
      <p>您确定要注销您的账号吗？此操作不可恢复。</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDeleteAccountDialog">取消</el-button>
        <el-button type="danger" @click="confirmDeleteAccount">确认注销</el-button>
      </div>
    </el-dialog>

    <!-- 删除地址确认弹窗 -->
    <el-dialog
        v-model="deleteAddressDialogVisible"
        title="确认删除地址"
        width="400px"
        @close="deleteAddressDialogVisible = false"
    >
      <p>您确定要删除该地址吗？此操作不可恢复。</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteAddressDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteAddress">确认删除</el-button>
      </div>
    </el-dialog>
  </div>
  <FooterPage />
</template>

<style scoped>
.container {
  display: flex;
  margin: 50px auto;
  max-width: 1200px;
  gap: 20px;
  margin-top: 150px;
}

.sidebar {
  width: 200px;
  background-color: #f7f7f7;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sidebar h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.sidebar .menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar .menu li {
  margin-bottom: 10px;
}

.sidebar .menu li a {
  display: block;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  padding: 10px 15px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.sidebar .menu li.active a {
  color: #fff;
  background-color: #ec6975;
  font-weight: bold;
}

.sidebar .menu li a:hover {
  background-color: #fbe4e7;
  color: #ec6975;
}

.sidebar .menu li a:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(236, 105, 117, 0.5);
  background-color: #fbe4e7;
  color: #ec6975;
}

.content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #ec6975;
  padding-bottom: 10px;
}

.profile {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.profile-avatar {
  text-align: center;
}

.profile-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 50px;
  object-fit: cover;
}

.profile-info .form-group {
  margin-bottom: 15px;
  margin-top: 20px;
}

.profile-info .form-group label {
  font-size: 14px;
  margin-right: 10px;
  color: #333;
}

.profile-info .form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 5px;
}

.save-btn {
  background-color: #ec6975;
  color: #fff;
  padding: 10px 150px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #cd4b57;
}

.address-management h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.address-form input,
.address-form select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.address-form button {
  background-color: #ec6975;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.address-form button:hover {
  background-color: #cd4b57;
}

.el-table th {
  background-color: #f7f7f7;
  text-align: center;
  font-weight: bold;
}

.el-table td {
  text-align: center;
}

.el-button {
  padding: 6px 12px;
  font-size: 12px;
}

.shr{
  margin-left: 15px;
}

.avatar-upload-container {
  position: relative;
  margin: 60px;

}

.avatar-label {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #ec6975;
  object-fit: cover;
}

.file-input {
  display: none;
}

.profile-info .form-group input:focus,
.address-form input:focus,
.address-form select:focus,
.el-input__inner:focus {
  border:2px solid #ec6975;
  outline: none;
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}

.el-button {
  margin: 0 10px;
}
</style>
