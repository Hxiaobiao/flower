<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';
import AdminNav from "@/components/adminNav.vue";

const salesChart = ref(null);
const flowerSalesChart = ref(null);
const stockLowChart = ref(null); // 新增的 ref
const orderStatusChart = ref(null);

onMounted(() => {
  // 初始化图表
  const myChart = echarts.init(salesChart.value);
  const flowerChart = echarts.init(flowerSalesChart.value);
  const statusChart = echarts.init(orderStatusChart.value); // 初始化订单状态图表

  // 获取后端数据
  axios.get('http://localhost:8080/api/orders/all').then((response) => {
    const orders = response.data;
    const orderDates = [];  // 用来存储日期
    const salesData = [];   // 用来存储总营业额数据
    const orderCountData = []; // 用来存储订单数量数据
    const flowerSales = {};  // 用来存储每种鲜花的销售数量
    const orderStatusCounts = {PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELED: 0} // 初始化订单状态统计对象

    // 处理订单数据
    orders.forEach((order) => {
      const date = order.createAt.split(' ')[0]; // 假设日期为 "yyyy-mm-dd" 格式
      const totalPrice = order.totalPrice;
      const orderCount = order.orderDetails.length;

      // 累加营业额和订单数量
      const existingIndex = orderDates.findIndex((d) => d === date);
      if (existingIndex !== -1) {
        salesData[existingIndex] += totalPrice;
        orderCountData[existingIndex] += orderCount;
      } else {
        orderDates.push(date);
        salesData.push(totalPrice);
        orderCountData.push(orderCount);
      }

      // 累加花卉销售数量
      order.orderDetails.forEach((detail) => {
        const flowerName = detail.flowerName; // 假设每个订单详情包含花卉名称
        if (!flowerSales[flowerName]) {
          flowerSales[flowerName] = 0;
        }
        flowerSales[flowerName] += detail.quantity; // 累加该花卉的销售数量
      });
    });

    // 设置营业情况图表
    myChart.setOption({
      title: {
        text: '花韵心语营业情况',
        left: 'center',
        textStyle: {
          color: '#ec6975', // 主题色
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#777'
        }
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['总营业额', '订单数量'],
        top: '10%',
        textStyle: {
          color: '#333'
        }
      },
      xAxis: {
        type: 'category',
        data: orderDates, // x轴为日期
        axisLine: {
          lineStyle: {
            color: '#ec6975' // 主题色
          }
        },
        axisLabel: {
          color: '#333'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '总营业额',
          axisLine: {
            lineStyle: {
              color: '#ec6975' // 主题色
            }
          },
          axisLabel: {
            color: '#333'
          }
        },
        {
          type: 'value',
          name: '订单数量',
          axisLine: {
            lineStyle: {
              color: '#ec6975' // 主题色
            }
          },
          axisLabel: {
            color: '#333'
          }
        }
      ],
      series: [
        {
          name: '总营业额',
          type: 'line',
          data: salesData, // 总营业额数据
          yAxisIndex: 0, // 使用第一个 Y 轴
          itemStyle: {
            color: '#ec6975', // 主题色
            borderWidth: 2,
            borderColor: '#ec6975'
          },
          lineStyle: {
            width: 3
          },
          smooth: true
        },
        {
          name: '订单数量',
          type: 'bar',
          data: orderCountData, // 订单数量数据
          yAxisIndex: 1, // 使用第二个 Y 轴
          itemStyle: {
            color: '#ec6975', // 主题色
            opacity: 0.7
          }
        }
      ]
    });

    // 设置鲜花销售情况饼图
    const flowerNames = Object.keys(flowerSales);
    const flowerQuantities = Object.values(flowerSales);

    flowerChart.setOption({
      title: {
        text: '花卉销售情况',
        subtext: '各类鲜花销量占比',
        left: 'center',
        textStyle: {
          color: '#ec6975', // 主题色
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#777'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '鲜花销售情况',
          type: 'pie',
          radius: '55%',
          data: flowerNames.map((flower, index) => ({
            name: flower,
            value: flowerQuantities[index]
          })),
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    });

    // 统计每种订单状态的数量
    orders.forEach((order) => {
      const status = order.status;
      if (orderStatusCounts[status] !== undefined) {
        orderStatusCounts[status]++;
      }
    });

    // 设置订单状态图表
    statusChart.setOption({
      title: {
        text: '订单状态分布',
        subtext: '按订单状态分类',
        left: 'center',
        textStyle: {
          color: '#ec6975',
          fontWeight: 'bold',
        },
        subtextStyle: {
          color: '#777',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        data: ['待处理', '已发货', '已完成', '已取消'],
      },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: '55%',
          data: [
            { value: orderStatusCounts.PENDING, name: '待处理' },
            { value: orderStatusCounts.SHIPPED, name: '已发货' },
            { value: orderStatusCounts.DELIVERED, name: '已完成' },
            { value: orderStatusCounts.CANCELED, name: '已取消' },
          ],
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      ],
    });

  }).catch((error) => {
    console.error('获取订单数据失败', error);
  });
});

onMounted(() => {
  const stockChart = echarts.init(stockLowChart.value); // 初始化库存图表

  // 获取所有花卉数据
  axios.get('http://localhost:8080/api/flowers/all').then((response) => {
    const flowers = response.data;

    // 筛选库存紧张的鲜花
    const lowStockThreshold = 5; // 定义库存紧张的阈值
    const lowStockFlowers = flowers.filter((flower) => parseInt(flower.stock) < lowStockThreshold);

    // 准备图表数据
    const lowStockItems = lowStockFlowers.map((flower) => flower.flowerName); // 花卉名称
    const lowStockCounts = lowStockFlowers.map((flower) => parseInt(flower.stock)); // 库存量

    // 定义动态颜色
    const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399'];
    const dynamicColors = lowStockItems.map((_, index) => colors[index % colors.length]); // 循环分配颜色

    // 设置库存紧张图表
    stockChart.setOption({
      title: {
        text: '库存紧张花卉',
        left: 'center',
        textStyle: {
          color: '#ec6975',
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}',
      },
      xAxis: {
        type: 'category',
        data: lowStockItems, // 库存紧张的花卉名称
        axisLine: {
          lineStyle: {
            color: '#ec6975',
          },
        },
        axisLabel: {
          rotate: 45, // 标签旋转，防止过长
          color: '#333',
        },
      },
      yAxis: {
        type: 'value',
        name: '库存量',
        axisLine: {
          lineStyle: {
            color: '#ec6975',
          },
        },
        axisLabel: {
          color: '#333',
        },
      },
      series: [
        {
          data: lowStockCounts.map((count, index) => ({
            value: count,
            itemStyle: {
              color: dynamicColors[index], // 为每个条目设置动态颜色
            },
          })),
          type: 'bar',
          barWidth: '50%', // 条形宽度
        },
      ],
    });
  }).catch((error) => {
    console.error('获取鲜花数据失败', error);
  });
});

</script>

<template>
  <adminNav/>
  <div class="content">
    <div class="card-container">
      <h1>首页 / 管理员</h1>
      <!-- 图表区域 -->
      <div class="charts-wrapper">
        <div ref="salesChart" class="chart-container"></div>
        <div ref="flowerSalesChart" class="chart-container"></div>
        <div ref="stockLowChart" class="chart-container"></div>
        <div ref="orderStatusChart" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  margin-left: 200px;
  padding: 20px;
  background: linear-gradient(180deg, #f9f9f9 0%, #e6e6e6 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card-container {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 30px;
  width: 95%;
  max-width: 1500px;
  margin: 20px auto;
}

h1 {
  color: #ec6975;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: left;
  border-left: 4px solid #ec6975;
  padding-left: 10px;
}

.charts-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.chart-container {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.chart-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
</style>
