import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Main from '../components/Main.vue';
import Register from "@/components/Register.vue";
import FlowerHome from "@/components/flowerHome.vue";
import UserProfile from "@/components/userProfile.vue";
import Collection from "@/components/collection.vue";
import Order from "@/components/order.vue";
import ShoppingCart from "@/components/shoppingCart.vue";
import Community from "@/components/community.vue";
import Category from "@/components/category.vue";
import AdminHome from "@/components/adminHome.vue";
import UserManage from "@/components/userManage.vue";
import FlowerManage from "@/components/flowerManage.vue";
import OrderManage from "@/components/orderManage.vue";
import FlowerDetail from "@/components/FlowerDetail.vue";
import AddressManage from "@/components/AddressManage.vue"; // 假设你有一个主页面组件

const routes = [
    // 顾客页面
    {
        path: '/',
        name: 'flowerHome',
        component: FlowerHome
    },
    {
        path: '/flowerHome',
        name: 'flowerHome',
        component: FlowerHome
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },

    {
        path: '/category',
        name: 'Category',
        component: Category
    },
    {
        path: '/community',
        name: 'Community',
        component: Community
    },
    {
        path: '/shoppingCart',
        name: 'ShoppingCart',
        component: ShoppingCart
    },
    {
        path: '/order',
        name: 'Order',
        component: Order
    },
    {
        path: '/collection',
        name: 'Collection',
        component: Collection
    },
    {
        path: '/userProfile',
        name: 'UserProfile',
        component: UserProfile
    },
    {
        path: '/flowerDetail/:id',
        name: 'flowerDetail',
        component: FlowerDetail,  // 映射到 FlowerDetail 组件
        props: true  // 启用路由参数传递
    },


    // 管理员页面
    {
        path: '/adminHome',
        name: 'AdminHome',
        component: AdminHome
    },
    {
        path: '/userManage',
        name: 'UserManage',
        component: UserManage
    },
    {
        path: '/flowerManage',
        name: 'FlowerManage',
        component: FlowerManage
    },
    {
        path: '/orderManage',
        name: 'OrderManage',
        component: OrderManage
    },
    {
        path: '/addressManage',
        name: 'AddressManage',
        component: AddressManage
    },

    {
        path: '/main',
        name: 'Main',
        component: Main,
        // meta: { requiresAuth: true } // 可选：用于保护需要登录的页面
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 可选：导航守卫，用于检查用户是否已登录
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const userIsAuthenticated = localStorage.getItem('user'); // 你可以根据实际情况调整这里的逻辑

    if (requiresAuth && !userIsAuthenticated) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

export default router;