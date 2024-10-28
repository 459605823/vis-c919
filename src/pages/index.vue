<template>
  <div ref="visRef" class="h-full w-full" />
</template>

<script setup lang="ts">
import Vis from './index';

const visRef = ref<HTMLElement | null>(null);

let vis: Vis;
onMounted(() => {
  vis = new Vis(visRef.value!);
  vis.init();
});

onUnmounted(() => {
  vis.dispose();
});
</script>

<style scoped></style>
