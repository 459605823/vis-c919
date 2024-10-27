<template>
  <div class="flex items-baseline" :style="{color}">
    <div
      class="font-700 tabular-nums"
      :style="{
        fontSize: `${valueSize}px`,
        fontFamily: font,
        width: widthStyle!,
        fontWeight,
      }"
    >
      {{ viewValue }}
    </div>
    <div
      v-if="viewUnit"
      class="ml-8px"
      :style="{
        fontSize: `${unitSize}px`,
        color: unitColor,
      }"
    >
      {{ viewUnit }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {formatNumber} from '@/utils';

const props = withDefaults(
  defineProps<{
    value: number;
    valueSize?: number;
    color?: string;
    unit?: string;
    unitSize?: number;
    unitColor?: string;
    font?: string;
    // compact: 1234.5万 standard: 12,345,000
    notation?: 'compact' | 'standard';
    fixedWidth?: boolean;
    fontWeight?: number;
  }>(),
  {
    valueSize: 22,
    unitSize: 16,
    font: 'Orbitron',
    notation: 'standard',
    fixedWidth: false,
    fontWeight: 400,
    unitColor: '#fff',
  },
);

const widthStyle = computed(() => {
  if (props.fixedWidth) {
    return `${String(props.value).length * 18}px`;
  }
  return 'auto';
});

let oldValue = 0;
let valueCache = 0;
const currentValue = ref(0);

function update() {
  const newValue = props.value;
  if (valueCache !== newValue) {
    const startTime = Date.now();
    valueCache = newValue;
    const timer = setInterval(() => {
      const t = Date.now() - startTime;
      if (t > 1500) {
        clearInterval(timer);
        currentValue.value = newValue;
        oldValue = newValue;
      } else {
        currentValue.value = Math.round(
          oldValue + ((newValue - oldValue) * t) / 1500,
        );
      }
    }, 50);
  }
}
onUpdated(update);
update();

// 匹配字符串中汉字前的所有内容
const regValue = /.*(?=[\u4E00-\u9FA5])/;
// 匹配字符串中的所有汉字
const regUnit = /([\u4E00-\u9FA5]+)/g;

const viewValue = computed(() => {
  const str = formatNumber(currentValue.value, props.notation, 1);
  const mat = str.match(regValue);
  if (mat) {
    return mat[0];
  }
  return str;
});

const viewUnit = computed(() => {
  if (props.notation === 'standard') {
    return props.unit ?? '';
  } else {
    const str = formatNumber(currentValue.value, props.notation, 1);
    const mat = str.match(regUnit);
    return `${mat ? mat[0] : ''}${props.unit ?? ''}`;
  }
});
</script>
