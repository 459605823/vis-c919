<template>
  <div ref="containerRef" class="wordsphere" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/addons/renderers/CSS2DRenderer.js';
import {chunk, debounce, union} from 'lodash-es';
import * as d3 from 'd3';

const props = withDefaults(
  defineProps<{
    data: {label: string; value: number; origin?: any}[];
    radius: number;
    scale: {x: number; y: number; z: number};
  }>(),
  {
    data: () => [],
    radius: 2.8,
    scale: () => ({x: 1.6, y: 0.8, z: 1}),
  },
);

const emit = defineEmits(['tooltip']);

const containerRef = ref<HTMLDivElement>();

interface labelDataType {
  dom: HTMLDivElement;
  scaleDiv: HTMLDivElement;
  object?: THREE.Object3D;
  baseFontSize?: number;
  origin: any;
  mouseoverFunc?: ((e: MouseEvent) => Promise<unknown>) | null;
  mouseoutFunc?: ((e: MouseEvent) => Promise<unknown>) | null;
}

let labelsMap: Record<string, labelDataType> = {};

const scale = d3.scaleLinear();
const colors = ['#66FFB4', '#FFDB66', '#58C1FF', '#FF9E54'];

const scene = new THREE.Scene();
scene.background = null;
const labelRenderer = new CSS2DRenderer();
const labelsGroup = new THREE.Group();
const rotationGroup = new THREE.Group();
rotationGroup.rotation.z = Math.PI / 2;
const scaleGroup = new THREE.Group();
const camera = new THREE.PerspectiveCamera(75, 0, 0.1, 1000);
camera.position.z = 5;

let isStop = false;

function getMouseoverFunc(label: string) {
  return async (e: MouseEvent) => {
    const {x, y} = e;
    emit('tooltip', {
      visible: true,
      label,
      position: {x, y},
    });
    isStop = true;
  };
}
function getMouseoutFunc() {
  return async () => {
    isStop = false;
    emit('tooltip', {
      visible: false,
    });
  };
}

function initLabel() {
  Object.keys(labelsMap).forEach((key) => {
    const label = labelsMap[key];
    if (label.mouseoverFunc) {
      label.dom.removeEventListener('mouseover', label.mouseoverFunc);
    }
    if (label.mouseoutFunc) {
      label.dom.removeEventListener('mouseout', label.mouseoutFunc);
    }
  });
  labelsMap = {};
  const values = props.data.map(item => item.value);
  const labels = props.data.map(item => item.label);
  const max = Math.max(...values);
  const min = Math.min(...values);
  scale.domain([min, max]).range([24, 36]);

  const colorScale = d3.scaleOrdinal(labels, colors);
  props.data.forEach((item) => {
    const labelDiv = document.createElement('div');
    const scaleDiv = document.createElement('div');
    scaleDiv.className = 'wordsphere-label';
    scaleDiv.textContent = item.label;
    scaleDiv.style.color = colorScale(item.label);
    const baseFontSize = scale(item.value);
    scaleDiv.style.fontSize = `${baseFontSize}px`;

    labelDiv.appendChild(scaleDiv);
    const object: labelDataType = {
      dom: labelDiv,
      scaleDiv,
      baseFontSize,
      origin: item.origin,
      mouseoverFunc: null,
      mouseoutFunc: null,
    };
    const mouseoverFunc = getMouseoverFunc(item.label);
    const mouseoutFunc = getMouseoutFunc();
    object.mouseoverFunc = mouseoverFunc;
    object.mouseoutFunc = mouseoutFunc;
    labelsMap[item.label] = object;

    scaleDiv.addEventListener('mouseover', mouseoverFunc);
    scaleDiv.addEventListener('mouseout', mouseoutFunc);
  });
}

function getSize() {
  if (props.data.length > 184)
    return 8;
  if (props.data.length > 148)
    return 7;
  if (props.data.length > 104)
    return 6;
  if (props.data.length > 76)
    return 5;
  if (props.data.length > 48)
    return 4;
  if (props.data.length > 28)
    return 3;
  if (props.data.length > 8)
    return 2;
  return 1;
}

function drawLabel() {
  labelsGroup.remove(...labelsGroup.children);
  const geometry = new THREE.OctahedronGeometry(props.radius, getSize());

  const positions = union(
    chunk((geometry.attributes.position as THREE.BufferAttribute).array, 3).map(
      item => item.join(','),
    ),
  )
    .map(item => item.split(',').map(t => Number(t)))
    .filter((item) => {
      return Math.abs(item[1]) < 1.8;
    });
  props.data.forEach((item) => {
    const positionIndex = Math.floor(Math.random() * positions.length);
    const position = positions.splice(positionIndex, 1)[0];

    const labelDiv = labelsMap[item.label].dom;
    const labelObject = new CSS2DObject(labelDiv);
    labelsMap[item.label].object = labelObject;
    labelObject.position.set(position[0], position[1], position[2]);
    labelObject.layers.set(0);
    labelsGroup.add(labelObject);
  });
}

function init(container: HTMLDivElement) {
  const rate = container.clientWidth / container.clientHeight;
  camera.aspect = rate;
  camera.updateProjectionMatrix();

  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  container.appendChild(labelRenderer.domElement);

  scaleGroup.scale.set(props.scale.x, props.scale.y, props.scale.z);
  rotationGroup.add(labelsGroup);
  scaleGroup.add(rotationGroup);
  scene.add(scaleGroup);
}

watch(
  () => props.data,
  () => {
    initLabel();
    drawLabel();
  },
);

let timer = 0;
let oldTimer = 0;
onUnmounted(() => {
  if (timer) {
    cancelAnimationFrame(timer);
    timer = 0;
  }
});
onMounted(async () => {
  const container = containerRef.value;
  if (container) {
    init(container);
    initLabel();
    drawLabel();

    const onResize = debounce(() => {
      labelRenderer.setSize(container.clientWidth, container.clientHeight);
    }, 500);
    window.addEventListener('resize', onResize);
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
    });
    const animate = () => {
      timer = requestAnimationFrame(animate);

      const now = Date.now();
      if (!isStop) {
        labelsGroup.rotation.y += (now - oldTimer) * 0.0002;

        Object.keys(labelsMap).forEach((key) => {
          const {object, scaleDiv} = labelsMap[key];
          if (object) {
            const worldP = new THREE.Vector3();
            object.getWorldPosition(worldP);
            const distance = camera.position.distanceTo(worldP);
            scaleDiv.style.opacity = (1 - distance / 10).toString();
            scaleDiv.style.transform = `scale(${1 - distance / 12})`;
          }
        });
      }
      oldTimer = now;
      labelRenderer.render(scene, camera);
    };

    animate();
  }
});
</script>

<style lang="scss" scoped>
.wordsphere {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: auto;

  canvas {
    display: none;
  }
}

:deep(.wordsphere-label) {
  cursor: pointer;
  max-width: 280px;
}
</style>
