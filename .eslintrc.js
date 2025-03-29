module.exports = {
    root: true,
    env: {
      node: true,
      'vue/setup-compiler-macros': true // 启用对<script setup>宏的支持
    },
    extends: [
      'plugin:vue/vue3-recommended', // 使用Vue 3推荐的规则
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // 可以根据需要添加或修改规则
    }
  }