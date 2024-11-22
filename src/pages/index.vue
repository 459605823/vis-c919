<template>
  <div class="page-container">
    <el-button @click="pitch('down')">
      俯
    </el-button>
    <el-button @click="pitch('up')">
      仰
    </el-button>
    <el-button @click="roll('left')">
      左旋转
    </el-button>
    <el-button @click="roll('right')">
      右旋转
    </el-button>
    <el-button>
      <a href="weixin://">打开微信</a>
    </el-button>
    <el-dropdown class="ml-2">
      <el-button type="primary">
        文件
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openFile">
            Action 1
          </el-dropdown-item>
          <el-dropdown-item @click="openFile">
            Action 2
          </el-dropdown-item>
          <el-dropdown-item @click="openFile">
            Action 3
          </el-dropdown-item>
          <el-dropdown-item disabled>
            Action 4
          </el-dropdown-item>
          <el-dropdown-item divided>
            Action 5
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div ref="visRef" class="vis-container" />
  </div>
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

function pitch(type: 'up' | 'down') {
  if (ready && vis) {
    const x = vis.posture.x;
    if (type === 'up' && x < 90) {
      vis.posture = {...vis.posture, x: x + 5};
    } else if (type === 'down' && x > -90) {
      vis.posture = {...vis.posture, x: x - 5};
    }
  }
}

function roll(type: 'left' | 'right') {
  if (ready && vis) {
    const z = vis.posture.z;
    if (type === 'left' && z < 90) {
      vis.posture = {...vis.posture, z: z + 5};
    } else if (type === 'right' && z > -90) {
      vis.posture = {...vis.posture, z: z - 5};
    }
  }
}

function openFile() {
  // 通过 input[type="file"] 打开文件
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      // eslint-disable-next-line no-alert
      alert(file.name);
    }
  };
  input.click();
}

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
      vis.posture = {...vis.posture, x, z};
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
.page-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.vis-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
