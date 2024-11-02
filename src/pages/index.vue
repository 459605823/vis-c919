<template>
  <div ref="visRef" class="h-full w-full" />
</template>

<script setup lang="ts">
import Vis from './vis';

const visRef = ref<HTMLElement | null>(null);

let vis: Vis;
onMounted(async () => {
  vis = new Vis(visRef.value!);
  await vis.init();
});

onUnmounted(() => {
  vis.dispose();
});
</script>

<style scoped></style>
