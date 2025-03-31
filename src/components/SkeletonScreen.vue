<template>
  <div class="skeleton-container" :class="type">
    <template v-if="type === 'table'">
      <div class="skeleton-header">
        <div class="skeleton-search"></div>
        <div class="skeleton-button"></div>
      </div>
      <div class="skeleton-table">
        <div class="skeleton-row header">
          <div v-for="i in columns" :key="`header-${i}`" class="skeleton-cell"></div>
        </div>
        <div v-for="row in rows" :key="`row-${row}`" class="skeleton-row">
          <div v-for="col in columns" :key="`cell-${row}-${col}`" class="skeleton-cell"></div>
        </div>
      </div>
      <div class="skeleton-pagination"></div>
    </template>

    <template v-else-if="type === 'form'">
      <div class="skeleton-form-header"></div>
      <div v-for="i in 6" :key="`form-field-${i}`" class="skeleton-form-field">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
      <div class="skeleton-form-actions">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
      </div>
    </template>

    <template v-else-if="type === 'card'">
      <div v-for="i in cards" :key="`card-${i}`" class="skeleton-card">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-line" v-for="j in 3" :key="`card-line-${i}-${j}`"></div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'chart'">
      <div class="skeleton-chart-header"></div>
      <div class="skeleton-chart"></div>
      <div class="skeleton-chart-legend"></div>
    </template>

    <template v-else> <!-- 默认基本骨架屏 -->
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line" v-for="i in 5" :key="`line-${i}`"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'table', 'form', 'card', 'chart'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 5
  },
  cards: {
    type: Number,
    default: 3
  }
});
</script>

<style scoped>
.skeleton-container {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 骨架元素共享动画 */
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}

/* 所有骨架元素的基础样式 */
.skeleton-container [class^="skeleton-"] {
  background-color: #f0f2f5;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

/* 表格骨架屏 */
.skeleton-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-search {
  width: 200px;
  height: 36px;
}

.skeleton-button {
  width: 80px;
  height: 36px;
}

.skeleton-table {
  width: 100%;
  margin-bottom: 16px;
}

.skeleton-row {
  display: flex;
  margin-bottom: 8px;
}

.skeleton-row.header {
  margin-bottom: 12px;
}

.skeleton-cell {
  flex: 1;
  height: 24px;
  margin-right: 8px;
}

.skeleton-pagination {
  height: 32px;
  width: 300px;
  margin: 16px auto 0;
}

/* 表单骨架屏 */
.skeleton-form-header {
  height: 40px;
  margin-bottom: 24px;
  width: 60%;
}

.skeleton-form-field {
  display: flex;
  margin-bottom: 16px;
}

.skeleton-label {
  width: 100px;
  height: 24px;
  margin-right: 16px;
}

.skeleton-input {
  flex: 1;
  height: 36px;
}

.skeleton-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 16px;
}

/* 卡片骨架屏 */
.skeleton-card {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f2f5;
  padding: 16px;
}

.skeleton-card-header {
  height: 32px;
  margin-bottom: 16px;
  width: 60%;
}

.skeleton-card-content {
  display: flex;
  flex-direction: column;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 12px;
  width: 100%;
}

.skeleton-line:last-child {
  width: 60%;
}

/* 图表骨架屏 */
.skeleton-chart-header {
  height: 32px;
  width: 70%;
  margin-bottom: 16px;
}

.skeleton-chart {
  height: 300px;
  margin-bottom: 16px;
}

.skeleton-chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  height: 24px;
  width: 60%;
  margin: 0 auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .skeleton-search {
    width: 120px;
  }

  .skeleton-chart {
    height: 200px;
  }
}
</style> 