<template>
  <div ref="chartBox" class="chart-box" />
</template>

<script setup lang="ts">
import type * as echarts from 'echarts';
import 'echarts-wordcloud';
import {randFloat} from '@/utils/random';
import EchartsControl from '@/composables/EchartsControl';

const props = defineProps<{
  data: {name: string; value: number}[];
}>();

const colors = ['88,193,255', '255,219,102', '102,255,180'];

function getOptions(): echarts.EChartsOption {
  return {
    series: [
      {
        type: 'wordCloud',
        shape: theta =>
          Math.min(
            1 / Math.abs(Math.cos(theta)),
            1 / Math.abs(Math.sin(theta)),
          ),
        left: 'center',
        top: 'center',
        width: '80%',
        height: '100%',
        sizeRange: [14, 24],
        gridSize: 10,
        rotationRange: [0, 0],
        drawOutOfBound: false,
        shrinkToFit: true,
        textStyle: {
          color: () => {
            return `rgba(${
              colors[Math.floor(Math.random() * colors.length)]
            }, ${randFloat(0.5, 1)})`;
          },
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            opacity: 1,
            fontWeight: 500,
          },
        },
        data: props.data,
      },
    ],
  };
}

const {chartBox} = EchartsControl(() => getOptions());
</script>

<style scoped lang="scss">
.chart-box {
  width: 100%;
  height: 100%;
}
</style>
