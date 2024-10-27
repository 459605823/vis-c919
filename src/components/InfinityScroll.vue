<template>
  <div
    class="scroll-container"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
  >
    <div ref="scrollRef" class="scroll-area">
      <slot />
      <template v-if="needScroll">
        <slot />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Ref, ref} from 'vue';
import {useScroll} from '@/composables/infinityScroll';

const props = withDefaults(
  defineProps<{
    data: any[];
    limitScrollNum?: number;
    speed?: number;
    hover?: boolean;
    wheel?: boolean;
  }>(),
  {
    data: () => [],
    limitScrollNum: 0,
    speed: 1,
    hover: true,
    wheel: false,
  },
);
const scrollRef: Ref<HTMLElement | undefined> = ref();

const {initScroll, pauseScroll, resumeScroll, dispose} = useScroll(scrollRef);

const needScroll = computed(() => {
  return props.data.length > props.limitScrollNum;
});

function handleMouseEnter() {
  if (props.hover) {
    pauseScroll();
  }
}

function handleMouseLeave() {
  if (props.hover) {
    resumeScroll();
  }
}

// todo: wheel
function handleWheel(e: WheelEvent) {
  if (!props.wheel && !props.hover)
    return;
  if (e.deltaY > 0) {
    // 向上滚动
  } else {
    // 向下滚动
  }
}

onMounted(() => {
  watch(
    () => props.data,
    (data) => {
      if (needScroll.value) {
        initScroll(data.length, props.speed);
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  );
});

onUnmounted(() => {
  dispose();
});
</script>

<style scoped>
.scroll-container {
  height: 100%;
  overflow: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
