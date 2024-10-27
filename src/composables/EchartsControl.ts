import {onMounted, onUnmounted, ref} from 'vue';
import * as echarts from 'echarts';
import {debounce, merge} from 'lodash-es';

const commonConfig: echarts.EChartsOption = {
  tooltip: {
    confine: true,
  },
};

function addCommonConfig(getOptions: () => echarts.EChartsOption) {
  const option = getOptions();
  // 添加通用配置
  merge(option, commonConfig);
  return option;
}

interface IChartsConfig {
  renderer?: 'canvas' | 'svg';
  theme?: string;
}

export default function (
  getOptions: () => echarts.EChartsOption,
  config?: IChartsConfig,
) {
  const {renderer = 'svg', theme = null} = (config || {});
  const chartBox = ref(document.createElement('canvas'));
  const chartInstance: Ref<echarts.EChartsType | undefined>
    = shallowRef(undefined);

  const resize = debounce(() => {
    chartInstance.value?.resize();
  }, 100);
  const resizeObserver = new ResizeObserver(resize);

  const draw = debounce(() => {
    chartInstance.value?.resize();
    const option = addCommonConfig(getOptions);
    chartInstance.value?.setOption(option, {
      notMerge: true,
    });
  }, 100);

  onMounted(() => {
    chartInstance.value = echarts.init(chartBox.value, theme, {renderer});
    if (!document.addEventListener)
      return;
    resizeObserver.observe(chartBox.value);
    draw();
  });

  onUnmounted(() => {
    resizeObserver.disconnect();
    chartInstance.value?.dispose();
    chartInstance.value = undefined;
  });

  watchEffect(() => {
    draw();
  });

  return {
    chartBox,
    chart: chartInstance,
    draw,
  };
}
