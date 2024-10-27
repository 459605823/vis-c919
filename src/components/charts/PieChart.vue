<template>
  <div class="relative h-full w-full">
    <div ref="chartBox" class="chart-box" />
    <div
      class="legend absolute bottom-0 left-50% w-full flex translate-x--50% transform justify-center gap-x-56px"
    >
      <div
        v-for="(item, index) in data"
        :key="item.name"
        class="legend-item flex"
      >
        <div
          class="marker mr-8px mt-2px h-8px w-8px"
          :style="{backgroundColor: colors[index]}"
        />
        <div>
          <div class="mb-4px text-12px text-#fff text-op-80">
            {{ item.name }}
          </div>
          <div
            class="font-orbitron text-14px font-500"
            :style="{color: colors[index]}"
          >
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'echarts-gl';
import {scaleLinear} from 'd3';
import EchartsControl from '@/composables/EchartsControl';

type Data = {
  name: string;
  value: number;
  itemStyle?: Record<string, any>;
}[];

const props = defineProps<{
  data: Data;
  colors: string[];
}>();

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
function getParametricEquation(
  startRatio: number,
  endRatio: number,
  isSelected: boolean,
  isHovered: boolean,
  k: number,
  height: number,
) {
  // 计算
  const midRatio = (startRatio + endRatio) / 2;

  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  const midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },

    x(u: number, v: number) {
      if (u < startRadian) {
        return (
          offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    y(u: number, v: number) {
      if (u < startRadian) {
        return (
          offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      if (u > endRadian) {
        return (
          offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        );
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    z(u: number, v: number) {
      if (u < -Math.PI * 0.5 || u > Math.PI * 2.5) {
        return Math.sin(u) > 0 ? 1 * height : -1;
      }
      return Math.sin(v) > 0 ? 1 * height : -1;
    },
  };
}

const colors = props.colors ? props.colors : ['#2577CB', '#CFB45C', '#55CDCF'];

function getOptions(pieData: Data, internalDiameterRatio?: number) {
  const values = pieData.map(item => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const heightScale = scaleLinear().domain([min, max]).range([0.5, 4]);

  const series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  const legendData = [];
  const k
    = typeof internalDiameterRatio !== 'undefined'
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3;

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    if (pieData[i].value === 0) {
      continue;
    }
    sumValue += pieData[i].value;

    const seriesItem: Record<string, any> = {
      name:
        typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k,
      },
      itemStyle: {
        opacity: pieData[1].itemStyle?.opacity || 0.8,
        color: pieData[1].itemStyle?.color || null,
      },
    };
    series.push(seriesItem);
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;
    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      heightScale(series[i].pieData.value),
    );

    startValue = endValue;

    legendData.push(series[i].name);
  }

  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  const option = {
    color: colors,
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    grid3D: {
      show: false,
      boxHeight: 24,
      boxWidth: 180,
      boxDepth: 180,
      top: 0,
      bottom: '20%',
      height: '80%',
      viewControl: {
        distance: 240,
        minDistance: 240,
        maxDistance: 240,
        alpha: 30,
        beta: 80,
        minAlpha: 30,
        maxAlpha: 30,
        center: [0, -20, 0],
      },
    },
    series,
  };
  return option;
}

const {chartBox} = EchartsControl(() => getOptions(props.data, 0.7), 'canvas');
</script>

<style scoped lang="scss">
.chart-box {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/service-center/饼图底座.png');
  background-size: 252px 120px;
  background-repeat: no-repeat;
  background-position: center 50%;
}
</style>
