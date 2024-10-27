<template>
  <div
    id="bubble-chart-box"
    ref="chartBox"
    class="h-full w-full flex items-center justify-center"
  />
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import {debounce} from 'lodash-es';

const props = withDefaults(
  defineProps<{
    data: {name: string; value: number}[];
    padding?: number;
  }>(),
  {
    padding: 2.5,
  },
);

const emit = defineEmits(['click']);

const chartBox = ref<HTMLElement>();

const gradients = [
  {
    border: ['#09BDD7', '#255A9F'],
    background: ['#0ED4CD', '#225BB0'],
  },
  {
    border: ['#FFD464', '#AF7144'],
    background: ['#FEF391', '#C99D00'],
  },
  {
    border: ['#54FF98', '#096734'],
    background: ['#66FFB5', '#2BFFCC'],
  },
];

let WIDTH = 400;
let HEIGHT = 200;

function drawChart() {
  if (!chartBox.value || !props.data.length)
    return;

  const values = props.data.map(d => d.value);

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const radiusScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([16, 36]);

  const sizeScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([8, 16]);
  const opScale = d3.scaleLinear().domain([minValue, maxValue]).range([0.6, 1]);

  const data = props.data.map(d => ({
    ...d,
    radius: radiusScale(d.value),
  }));

  d3.select('#bubble-chart-box').select('svg').remove();

  const svg = d3
    .select('#bubble-chart-box')
    .append('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
    .attr('class', 'bubble-chart');
  const defs = svg.append('defs');

  gradients.forEach((gradient, index) => {
    const {border, background} = gradient;
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', `gradient-${index}-border`);
    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', border[0]);
    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', border[1]);
    const linearGradient2 = defs
      .append('linearGradient')
      .attr('id', `gradient-${index}-background`);
    linearGradient2
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', background[0]);
    linearGradient2
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', background[1]);
  });

  const nodes = svg
    .selectAll('.node')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'bubble-node')
    .on('click', (d) => {
      emit('click', d.name);
    })
    .append('g')
    .attr('class', 'bubble-graph');

  nodes
    .append('circle')
    .attr('r', (d) => {
      return d.radius;
    })
    .style('stroke', (_, i) => {
      const index = i % gradients.length;
      return `url(#gradient-${index}-border)`;
    })
    .style('stroke-width', 2)
    .style('stroke-opacity', d => opScale(d.value))
    .style('fill', (_, i) => {
      const index = i % gradients.length;
      return `url(#gradient-${index}-background)`;
    })
    .style('fill-opacity', 0.3);

  nodes
    .append('text')
    .attr('dy', '.1em')
    .style('text-anchor', 'middle')
    .text(d => d.name)
    .style('fill', '#ffffff')
    .style('fill-opacity', d => opScale(d.value))
    .style('font-size', d => sizeScale(d.value));

  nodes
    .append('text')
    .attr('dy', '1.2em')
    .style('text-anchor', 'middle')
    .text(d => d.value)
    .style('fill', '#ffffff')
    .style('fill-opacity', d => opScale(d.value))
    .style('font-size', d => sizeScale(d.value));

  const simulation = d3
    .forceSimulation()
    .force('charge', d3.forceManyBody().strength(5))
    .force(
      'x',
      d3
        .forceX()
        .x(WIDTH / 2)
        .strength(0.5),
    )
    .force(
      'y',
      d3
        .forceY()
        .y(HEIGHT / 2)
        .strength(2),
    )
    .force(
      'collide',
      d3.forceCollide((d) => {
        return (d as any).radius + props.padding;
      }),
    );

  const ticked = () => {
    const nodes = svg.selectAll('.bubble-node');
    if (nodes.size()) {
      nodes.attr('transform', (d: any) => {
        return `translate(${d.x} ${d.y})`;
      });
    }
  };

  simulation.nodes(data as any).on('tick', ticked);
}

watch(
  () => props.data,
  () => {
    nextTick(() => {
      drawChart();
    });
  },
);

const resize = debounce(() => {
  drawChart();
}, 500);

onMounted(() => {
  nextTick(() => {
    const {width, height} = chartBox.value!.getBoundingClientRect();
    WIDTH = width;
    HEIGHT = height;
    drawChart();
  });
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  window.removeEventListener('resize', resize);
});
</script>

<style scoped lang="scss">
.bubble-chart {
  width: 100%;
  height: 100%;
}

:deep(.bubble-node) {
  cursor: pointer;
  @for $i from 1 through 30 {
    &:nth-child(#{$i}) .bubble-graph {
      $delay: $i * 0.075s;

      animation-delay: $delay;
    }
  }

  .bubble-graph {
    opacity: 0;
    animation-name: animateIn;
    animation-duration: 1s;
    animation-fill-mode: forwards;
  }
}

@keyframes animateIn {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
