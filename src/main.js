import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // 引入样式文件
import { ShoppingCartAdd } from '@icon-park/vue-next';

const app = createApp(App);

// 全局配置 axios
app.config.globalProperties.$axios = axios;

// 注册图标组件
app.component('shopping-cart-add', ShoppingCartAdd);

// 使用路由和 Element Plus
app.use(router);
app.use(ElementPlus); // 这里需要加入

// 挂载应用
app.mount('#app');
