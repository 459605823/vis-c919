<template>
  <div ref="visRef" class="vis-container" />
</template>

<script setup lang="ts">
import Vis from './vis';

const visRef = ref<HTMLElement | null>(null);
let oldMessage = '';
// 第一次连接后服务器会发送这条消息
const greet = '欢迎连接到 WebSocket 服务器！';
let socket: WebSocket;
let ready = false;

let vis: Vis;
onMounted(async () => {
  socket = new WebSocket('ws://localhost:60000');
  socket.addEventListener('open', () => {
    console.log('Connected to server');
  });
  socket.addEventListener('message', (event) => {
    console.log('message', event.data);
    if (event.data !== greet && oldMessage !== event.data && ready) {
      oldMessage = event.data;
      const [x, z, _, speed] = event.data.split(',').map(Number);
      vis.posture = {x, z};
      vis.speed = speed;
    }
  });
  socket.addEventListener('close', () => {
    console.log('Disconnected from server');
  });
  vis = new Vis(visRef.value!);
  await vis.init();
  ready = true;
});

onUnmounted(() => {
  socket.close();
  vis.dispose();
});
</script>

<style scoped lang="scss">
.vis-container {
  width: 100%;
  height: 100%;
}
</style>
