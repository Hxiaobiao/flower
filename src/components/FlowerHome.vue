<script setup>
import {ref, onMounted, onUnmounted} from 'vue';
import { useRouter } from 'vue-router';
import NavigationPage from "@/components/NavigationPage.vue";
import FooterPage from "@/components/FooterPage.vue";
import axios from 'axios';

// 存储鲜花数据和收藏列表
const flowers = ref([]);
const router = useRouter();

// 指定展示的鲜花 ID 列表
const displayedFlowerIds = [28, 29, 30, 31];

// 获取所有鲜花数据
const fetchFlowers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/flowers/all');

    // 过滤出指定的鲜花信息
    flowers.value = response.data.filter(flower => displayedFlowerIds.includes(flower.id));
  } catch (error) {
    console.error('获取鲜花数据失败:', error);
  }
};

// 跳转到鲜花详情页
const goToFlowerDetail = (id) => {
  router.push({ path: `/flowerDetail/${id}` });
};

// 过滤后的鲜花列表
const filteredFlowers = ref([]);

const carouselImages = ref([
  {
    src: '../images/flowerHome1.jpeg',
    alt: '鲜花图片1',
    title: '鲜花1标题',
    description: '这是一束美丽的鲜花1。',
    link: '/flowerDetail/1',
  },
  {
    src: '../images/flowerHome2.jpeg',
    alt: '鲜花图片2',
    title: '鲜花2标题',
    description: '这是一束美丽的鲜花2。',
    link: '/flowerDetail/2',
  },
  {
    src: '../images/flowerHome3.jpeg',
    alt: '鲜花图片3',
    title: '鲜花3标题',
    description: '这是一束美丽的鲜花3。',
    link: '/flowerDetail/3',
  },
]);

const goToDetails = (link) => {
  router.push(link);
};

// 跳转到指定的轮播图
const goToSlide = (index) => {
  currentSlide.value = index;
};

const currentSlide = ref(0);
const slideInterval = ref(null);

// 切换到下一张图片
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselImages.value.length;
};

// 切换到上一张图片
const prevSlide = () => {
  currentSlide.value =
      (currentSlide.value - 1 + carouselImages.value.length) % carouselImages.value.length;
};

// 自动播放轮播图
const startCarousel = () => {
  slideInterval.value = setInterval(nextSlide, 5000);
};

// 停止轮播图
const stopCarousel = () => {
  clearInterval(slideInterval.value);
};

// 挂载时初始化
onMounted(async () => {
  await fetchFlowers();
  startCarousel();
});

onUnmounted(() => {
  stopCarousel();
});
</script>

<template>
  <NavigationPage />
  <div class="main">
    <div class="carousel-container">
      <div class="carousel">
        <div
            v-for="(image, index) in carouselImages"
            :key="index"
            :class="['carousel-slide', { active: index === currentSlide }]"
        >
          <img :src="image.src" :alt="image.alt" loading="lazy" />
          <button class="detail-button" @click="goToDetails(image.link)">查看详情</button>
        </div>
        <button class="carousel-prev" @click="prevSlide">‹</button>
        <button class="carousel-next" @click="nextSlide">›</button>
      </div>
      <div class="carousel-dots">
        <span
            v-for="(image, index) in carouselImages"
            :key="index"
            :class="['dot', { active: index === currentSlide }]"
            @click="goToSlide(index)"></span>
      </div>
    </div>
  </div>

  <!-- 花卉展示区 -->
  <div class="flower-display">
    <div
        v-for="(flower, index) in flowers"
        :key="flower.id"
        :class="['flower-card', { 'reverse-layout': index % 2 === 1 }]"
    >
      <div class="flower-image-container">
        <img :src="flower.imageUrl || '../assets/images/logo.png'" alt="鲜花图片" class="flower-image" />
      </div>
      <div class="flower-content">
        <h2 class="flower-title">{{ flower.flowerName }}</h2>
        <p class="flower-description">{{ flower.flowerLanguage || 'A beautiful bouquet for your loved ones.' }}</p>
        <p class="flower-price">￥{{ flower.price }}</p>
        <button class="flower-order-button" @click="goToFlowerDetail(flower.id)">立即订购</button>
      </div>
    </div>
    <img src="../assets/images/flowerHome4.png" class="img">
    <img src="../assets/images/flowerHome5.jpeg" class="img">
  </div>
  <FooterPage />
</template>

<style scoped>
.main {
  padding: 0 20px;
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
}

.carousel-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  height: 85vh;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
}

.carousel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  background-color: #fff;
}

.carousel-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  opacity: 0;
  transition: opacity 0.7s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
  position: relative;
}

.carousel-prev,
.carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 10;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}

.carousel-prev:hover,
.carousel-next:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.carousel-prev {
  left: 15px;
}

.carousel-next {
  right: 15px;
}

.carousel-dots {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: rgba(255, 255, 255, 1);
}

.detail-button {
  position: absolute;
  bottom: 300px;
  left: 300px;
  padding: 20px 60px;
  font-size: 1.5rem;
  color: white;
  background-color: #ec6975;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  z-index: 10;
}

.detail-button:hover {
  background-color: #d95e6a;
  transform: scale(1.1);
}

.flower-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 1400px;
  margin: 50px auto;
}

.flower-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: white;
  overflow: hidden;
  width: 90%;
  max-width: 1200px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flower-card.reverse-layout {
  flex-direction: row-reverse;
}

.flower-image-container {
  flex: 1;
  max-width: 50%;
  overflow: hidden;
}

.flower-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.flower-image-container:hover .flower-image {
  transform: scale(1.1);
}

.flower-content {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flower-title {
  font-size: 3rem;
  font-weight: bold;
  color: #4a4a4a;
}

.flower-description {
  font-size: 1.5rem;
  color: #7a7a7a;
  line-height: 1.6;
}

.flower-price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ec6975;
}

.flower-order-button {
  padding: 15px;
  font-size: 2rem;
  width: 200px;
  color: white;
  background: linear-gradient(45deg, #ec6975, #d95e6a);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

.flower-order-button:hover {
  background: linear-gradient(45deg, #d95e6a, #ec6975);
  transform: scale(1.1);
}

.img{
  width: 1700px;
}
</style>
