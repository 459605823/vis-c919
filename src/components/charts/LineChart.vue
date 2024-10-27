<template>
  <div ref="chartBox" class="chart-box pointer-events-auto" />
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import {formatNumber} from '@/utils/format';
import EchartsControl from '@/composables/EchartsControl';
import pointBlue from '@/assets/images/line-point-blue.png';
import pointYellow from '@/assets/images/line-point-yellow.png';
import pointPurple from '@/assets/images/line-point-purple.png';

export type LineChartProps = {
  name: string;
  data: number[];
  colorType: 'blue' | 'yellow' | 'purple';
  [key: string]: any;
}[];

const props = withDefaults(
  defineProps<{
    data: LineChartProps;
    xData: string[];
    legendShow: boolean; // 是否是显示图例
    isName: boolean; // 悬停时是否是显示横坐标name
    colorMap?: {
      [key: string]: {color: string; gradient: echarts.graphic.LinearGradient};
    };
    pointIcons?: {[key: string]: string};
  }>(),
  {
    legendShow: true,
    isName: false,
  },
);

const colorMap = props.colorMap
  ? props.colorMap
  : {
      blue: {
        color: '#58C1FF',
        gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(62, 208, 255, 0.4)',
          },
          {
            offset: 1,
            color: 'rgba(62, 208, 255, 0.15)',
          },
        ]),
      },
      yellow: {
        color: '#FFDB66',
        gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(255,235,62, 0.4)',
          },
          {
            offset: 1,
            color: 'rgba(255,235,62, 0.15)',
          },
        ]),
      },
      purple: {
        color: '#9E95FF',
        gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(178,171,255, 0.4)',
          },
          {
            offset: 1,
            color: 'rgba(178,171,255, 0.15)',
          },
        ]),
      },
    };

const pointIcons = props.pointIcons
  ? props.pointIcons
  : {
      blue: pointBlue,
      yellow: pointYellow,
      purple: pointPurple,
    };

function getSeries(): echarts.SeriesOption[] {
  return props.data.map((item) => {
    const {name, data, colorType} = item;
    const {color, gradient} = colorMap[colorType];
    return {
      name,
      type: 'line',
      data,
      smooth: true,
      symbol: `image://${pointIcons[colorType]}`,
      symbolSize: 14,
      lineStyle: {
        color,
        width: 2,
      },
      areaStyle: {
        color: gradient,
      },
    };
  });
}

// 将7.14转换成7-14
function formatXData(time: string) {
  const arr = time.split('.');
  return arr.join('-');
}

function getLegendData() {
  return props.data.map((item) => {
    return {
      name: item.name,
      textStyle: {
        color: colorMap[item.colorType].color,
      },
    };
  });
}

function getOptions(): echarts.EChartsOption {
  return {
    color: props.data.map(item => colorMap[item.colorType].color),
    grid: {
      top: 30,
      left: 10,
      right: 20,
      bottom: 0,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#00a3ff',
          type: 'solid',
          width: 1,
        },
      },
      backgroundColor: 'rgba(0, 0, 0, 0.90)',
      borderColor: 'rgba(88, 193, 255, 0.40)',
      padding: [8, 12],
      formatter: (params) => {
        let html = null;
        if (!props.isName) {
          html = (params as any[]).map((param) => {
            return `
            <div class="flex items-center text-12px mb-8px last:mb-0" style="color: ${param.color}">
              <span class="inline-block w-6px h-6px rounded-50% mr-8px" style="background: ${param.color}"></span>
              ${props.isName ? param.name : param.seriesName}:
              <span class="font-orbitron inline-block ml-8px mt-4px">${formatNumber(param.value)}</span>
            </div>`;
          });
        } else {
          html = (params as any[]).map((param) => {
            return `
            <div class=" items-center text-12px mb-8px last:mb-0" style="color: ${param.color}">
              <div class="text-#fff lh-20px text-14px">${formatXData(param.name)}</div>
              <div class="lh-17px">
                ${param.seriesName}
                <span class="font-orbitron inline-block ml-8px text-14px">${formatNumber(param.value)}</span>
              </div>
            </div>
            `;
          });
        }
        return html.join('');
      },
      textStyle: {
        fontSize: 12,
      },
    },
    legend: {
      show: props.legendShow,
      right: 0,
      top: 0,
      itemWidth: 24,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
      },
      data: getLegendData(),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        overflow: 'truncate',
        color: '#58C1FF',
        fontSize: 12,
        formatter: (value: number) => formatNumber(value) as string,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#56e1db',
          width: 1,
          type: 'solid',
          opacity: 0.4,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#56e1db',
          opacity: 0.2,
          width: 1,
          type: 'dashed',
        },
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xData,
      axisLabel: {
        color: '#58C1FF',
        opacity: 0.6,
        fontSize: 12,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#56e1db',
          width: 1,
          type: 'solid',
          opacity: 0.4,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#56e1db',
          opacity: 0.2,
          width: 1,
          type: 'dashed',
        },
      },
      axisTick: {
        show: false,
      },
    },
    series: getSeries(),
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
