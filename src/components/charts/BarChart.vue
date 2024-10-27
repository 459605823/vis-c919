<template>
  <div ref="chartBox" class="chart-box pointer-events-auto" />
</template>

<script lang="ts" setup>
import type * as echarts from 'echarts';
import EchartsControl from '@/composables/EchartsControl';
import {formatNumber} from '@/utils/format';

const props = defineProps<{
  data: {
    name: string;
    data: number[];
  }[];
}>();

const xColors = ['#9E95FF', '#FFDB66', '#66FCFF'];

function getOptions(): echarts.EChartsOption {
  return {
    color: ['#66FCFF', '#FFDB66', '#66FFB4'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(0, 15, 37, 0.5)',
      borderColor: 'rgba(88, 193, 255, 0.5)',
      formatter: (params: any) => {
        const html = (params as any[]).map((param) => {
          return `
            <div class="flex items-center text-12px mb-8px last:mb-0" style="color: ${param.color}">
              <span class="inline-block w-6px h-6px rounded-50% mr-8px" style="background: ${param.color}"></span>
              ${param.seriesName}:
              <span class="font-orbitron inline-block ml-8px mt-4px">${formatNumber(param.value)}</span>
            </div>
          `;
        });
        return (
          `
          <div class="text-white mb-4px text-14px" style="color: ${xColors[params[0].dataIndex]}">
            ${params[0].axisValueLabel}
          </div>
          ${html.join('')}
          `
        );
      },
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      top: 30,
      left: 10,
      right: 0,
      bottom: 0,
      containLabel: true,
    },
    legend: {
      icon: 'circle',
      right: 0,
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 16,
      textStyle: {
        fontSize: 12,
      },
      data: [
        {
          name: '平均检测时间',
          textStyle: {
            color: '#66FCFF',
          },
        },
        {
          name: '平均响应时间',
          textStyle: {
            color: '#FFDB66',
          },
        },
        {
          name: '平均处置时间',
          textStyle: {
            color: '#66FFB4',
          },
        },
      ],
    },
    xAxis: [
      {
        type: 'category',
        axisTick: {show: false},
        axisLine: {
          lineStyle: {
            opacity: 0.2,
            color: '#56E1DB',
            width: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            opacity: 0.1,
            color: '#56E1DB',
            width: 1,
            type: 'dashed',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            opacity: 0.05,
            color: ['#FB0087', '#0FFCCF', '#9EDCFF'],
          },
        },
        axisLabel: {
          fontSize: 10,
        },
        data: [
          {
            value: '高危告警',
            textStyle: {
              color: '#9E95FF',
            },
          },
          {
            value: '中危告警',
            textStyle: {
              color: '#FFDB66',
            },
          },
          {
            value: '低危告警',
            textStyle: {
              color: '#66FCFF',
            },
          },
        ],
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            opacity: 0.1,
            color: '#56E1DB',
            width: 1,
            type: 'dashed',
          },
        },
        axisLabel: {
          fontSize: 10,
          color: '#58C1FF',
          formatter: '{value}s',
        },
      },
    ],
    series: props.data.map(item => ({
      name: item.name,
      type: 'bar',
      barWidth: 10,
      barGap: 1,
      emphasis: {
        focus: 'series',
      },
      data: item.data,
    })),
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
