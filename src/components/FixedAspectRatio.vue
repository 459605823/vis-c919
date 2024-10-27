<template>
  <div
    ref="container"
    class="fixed-aspect-ratio"
    :class="{
      'fixed-aspect-ratio-disabled': disabled,
      'fixed-aspect-ratio-full': isFull,
    }"
    :style="{
      width: `${calcWidth}px`,
      height: `${height}px`,
      transform:
        disabled || isFull
          ? `scale(1) translate(0, 0)`
          : `scale(${globalScale}) translate(-50%, 0)`,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
// 随窗口缩放保持宽高比、顶部对齐、左右居中
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {throttle} from 'lodash-es';

const props = withDefaults(defineProps<Props>(), {
  width: 1920,
  height: 1080,
  maxWidth: 1920,
  disabled: false,
  isFull: false,
  lockX: false,
  lockY: false,
});
// 缩放比例
const globalScale = ref(1);
// canvas比例
const canvasScale = ref(1);

interface Props {
  width?: number;
  height?: number;
  // 最大宽度。设置此值时，宽高比改为在 width/height ~ maxWidth/height 范围内伸缩
  maxWidth?: number;
  // 是否禁用自动缩放
  disabled?: boolean;
  // 全屏
  isFull: boolean;
  lockX: boolean;
  lockY: boolean;
}

const calcWidth = ref(props.width);
let parentEle: HTMLElement | null | undefined = null;

watch(
  () => props.isFull,
  () => {
    globalScale.value = 1;
    calcWidth.value = props.width;
  },
);

function onResize() {
  if (props.disabled || props.isFull) {
    globalScale.value = 1;
    calcWidth.value = props.width;
    return;
  }
  // globalScale 是整体缩放度
  // canvasScale 是内容需要保持原始宽高比(props.width/props.height)的缩放度
  if (!parentEle)
    return;

  const ww = parentEle.offsetWidth / props.width;
  const wh = parentEle.offsetHeight / props.height;
  if (props.lockX) {
    globalScale.value = ww;
  } else if (props.lockY) {
    globalScale.value = wh;
  } else {
    globalScale.value = Math.min(ww, wh);
  }

  if (props.maxWidth > props.width && ww > wh) {
    calcWidth.value = Math.min(
      props.width / wh,
      parentEle.offsetWidth / wh,
      props.maxWidth,
    );
  } else {
    calcWidth.value = props.width;
  }
  canvasScale.value = calcWidth.value / props.width;
}
const container = ref<HTMLElement | null>(null);
const resizeObserver = new ResizeObserver(
  throttle(onResize, 500, {leading: false}),
);
onMounted(() => {
  parentEle = container.value?.parentElement;
  if (parentEle) {
    resizeObserver.observe(parentEle);
  }
  onResize();
});
onUnmounted(() => {
  if (parentEle) {
    resizeObserver.unobserve(parentEle);
  }
});

defineExpose({
  globalScale,
});
</script>

<style scoped>
.fixed-aspect-ratio {
  transform-origin: 0 0;
  position: absolute;
  left: 50%;
  top: 0%;
  transition: 0.2s;
  z-index: 999;
}

.fixed-aspect-ratio.fixed-aspect-ratio-disabled {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
}

.fixed-aspect-ratio.fixed-aspect-ratio-full {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  z-index: 99999999 !important;
}
</style>
