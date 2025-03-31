<template>
  <div class="skeleton-wrapper">
    <SkeletonScreen v-if="loading" :type="skeletonType" />
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SkeletonScreen from './SkeletonScreen.vue';

defineProps({
  skeletonType: {
    type: String,
    default: 'default'
  }
});

const loading = ref(true);

onMounted(() => {
  // 模拟加载延迟，实际使用时可根据数据加载情况设置
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
  position: relative;
  min-height: 100px;
}
</style> 