<template>
  <div class="scroll-table" :style="{height, ...tableStyle}">
    <div class="scroll-table-header" :style="headerStyle">
      <div
        v-for="column in columns"
        :key="column.label"
        class="scroll-table-header-item"
        :style="{
          width:
            typeof column.width === 'number'
              ? `${column.width}px`
              : column.width,
          textAlign: column.titleAlign || 'left',
        }"
      >
        {{ column.label }}
      </div>
    </div>
    <InfinityScroll
      :data="data"
      :hover="true"
      :limit-scroll-num="limitScrollNum"
      :speed="speed"
      :wheel="true"
    >
      <div
        v-for="(line, index) in data"
        :key="index"
        class="scroll-table-line"
        :style="
          index % 2 !== 0
            ? evenRowStyle ?? evenRowStyle
            : oddRowStyle ?? oddRowStyle
        "
        @click="emit('click', line)"
      >
        <div
          v-for="(col, sindex) in columns"
          :key="sindex"
          class="scroll-table-line-item"
          :title="getValue(line, col.dataIndex)"
          :style="{
            width: typeof col.width === 'number' ? `${col.width}px` : col.width,
            textAlign: col?.align || 'left',
          }"
        >
          <slot
            :item="getValue(line, col.dataIndex)"
            :col="line"
            :index="index + 1"
            :sindex="sindex"
            :name="col.slot"
          >
            <span>{{ getValue(line, col.dataIndex) }}</span>
          </slot>
        </div>
      </div>
    </InfinityScroll>
  </div>
</template>

<script lang="ts" setup>
import type {CSSProperties} from 'vue';

export type TextAlignProperty =
  | 'start'
  | 'end'
  | 'left'
  | 'right'
  | 'center'
  | 'justify'
  | 'match-parent';

export type ColumnsType = {
  label: string;
  width: number | string;
  slot?: string;
  dataIndex: string | string[];
  align?: TextAlignProperty;
  titleAlign?: TextAlignProperty;
}[];

export interface TablePropsType {
  data: Record<string, any>[];
  columns: ColumnsType;
  limitScrollNum?: number;
  speed?: number;
  height?: string;
  tableStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  evenRowStyle?: CSSProperties;
  oddRowStyle?: CSSProperties;
}

withDefaults(defineProps<TablePropsType>(), {
  data: () => [],
  columns: () => [],
  limitScrollNum: 5,
  tableStyle: () => ({}),
  headerStyle: () => ({}),
  evenRowStyle: () => ({}),
  oddRowStyle: () => ({}),
  speed: 1,
  height: '100%',
});

const emit = defineEmits(['click']);

function getValue(data: Record<string, any>, dataIndex: string | string[]) {
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce((prev, cur) => prev[cur], data);
  }
  return data[dataIndex];
}
</script>

<style lang="scss" scoped>
/* stylelint-disable font-family-no-missing-generic-family-keyword */

.scroll-table {
  white-space: nowrap;
  overscroll-behavior: none;
  padding-top: 30px;
  position: relative;

  &-nodata {
    color: #fff;
    width: 100%;
    height: 100%;
    display: flex;
    place-content: center center;
    align-items: center;
  }

  &-header {
    width: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
    font-family: 'PingFang SC';
    font-size: 12px;
    color: #58c1ff;
    letter-spacing: 0;
    text-align: left;
    font-weight: 400;
    display: flex;
    align-items: center;
    height: 30px;
    padding-left: 8px;
    background: rgb(153 194 255 / 10%);
    mix-blend-mode: normal;
  }

  &-line {
    display: flex;
    align-items: center;
    height: 40px;
    margin-bottom: 0;
    box-sizing: border-box;
    font-size: 12px;
    color: #fff;
    letter-spacing: 0;
    padding-left: 8px;

    &:nth-child(even) {
      height: 30px;
      background: rgb(153 194 255 / 10%);
      mix-blend-mode: normal;
    }

    &-item {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
