<template>
  <div ref="visRef" class="h-full w-full" />
</template>

<script setup lang="ts">
import Vis from './index';

const visRef = ref<HTMLElement | null>(null);

let vis: Vis;
onMounted(async () => {
  vis = new Vis(visRef.value!);
  await vis.init();
  vis.handlePlanePostureChange({x: -20, z: 35});
});

onUnmounted(() => {
  vis.dispose();
});
</script>

<style scoped></style>
