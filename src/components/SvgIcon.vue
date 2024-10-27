<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :href="symbolId" :xlink:href="symbolId" />
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
});
const symbolId = computed(() => `#icon-${props.iconName}`);
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return 'svg-icon';
});
</script>

<style scoped lang="scss">
.svg-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentcolor;
  overflow: hidden;
}
</style>
