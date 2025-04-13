<template>
  <div class="system-documentation">
    <!-- 文档头部 -->
    <div class="doc-header">
      <div class="header-content">
        <div class="header-actions">
          <el-button 
            type="primary" 
            link 
            class="back-button"
            @click="router.back()"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
        <h1 class="doc-title">
          <el-icon class="title-icon"><InfoFilled /></el-icon>
          <span class="gradient-text">数据脱敏平台</span>
          <span class="title-sub">专业、安全、高效的数据保护解决方案</span>
        </h1>
        <div class="header-tags">
          <el-tag type="success" effect="dark" class="tag-item">
            <el-icon><SuccessFilled /></el-icon>
            企业级
          </el-tag>
          <el-tag type="warning" effect="dark" class="tag-item">
            <el-icon><WarningFilled /></el-icon>
            高安全
          </el-tag>
          <el-tag type="info" effect="dark" class="tag-item">
            <el-icon><QuestionFilled /></el-icon>
            高性能
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 文档导航 -->
    <div class="doc-nav">
      <el-menu
        :default-active="activeSection"
        class="doc-menu"
        @select="handleSelect"
        mode="horizontal"
      >
        <el-menu-item index="overview">
          <el-icon><Document /></el-icon>
          <span>系统概述</span>
        </el-menu-item>
        <el-menu-item index="features">
          <el-icon><Star /></el-icon>
          <span>核心特性</span>
        </el-menu-item>
        <el-menu-item index="architecture">
          <el-icon><Setting /></el-icon>
          <span>系统架构</span>
        </el-menu-item>
        <el-menu-item index="security">
          <el-icon><Lock /></el-icon>
          <span>安全机制</span>
        </el-menu-item>
        <el-menu-item index="performance">
          <el-icon><TrendCharts /></el-icon>
          <span>性能优化</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 文档内容 -->
    <div class="doc-content">
      <!-- 系统概述 -->
      <section v-if="activeSection === 'overview'" class="doc-section">
        <h2>
          <el-icon><InfoFilled /></el-icon>
          系统概述
        </h2>
        <div class="section-content">
          <p>数据脱敏平台是一个专业的企业级数据保护解决方案，旨在帮助组织安全地处理敏感数据，同时满足合规性要求。本平台集成了先进的敏感数据识别技术、多种脱敏算法和全面的安全机制，为数据安全提供全方位的保护。</p>
          
          <div class="highlight-box">
            <h3>
              <el-icon><Star /></el-icon>
              主要目标
            </h3>
            <ul>
              <li><el-icon><Check /></el-icon>保护敏感数据安全</li>
              <li><el-icon><Check /></el-icon>满足合规性要求</li>
              <li><el-icon><Check /></el-icon>支持数据分析和处理</li>
              <li><el-icon><Check /></el-icon>提供灵活的数据脱敏方案</li>
            </ul>
          </div>

          <div class="stats-box">
            <div class="stat-item">
              <el-icon><DataLine /></el-icon>
              <div class="stat-number">23510</div>
              <div class="stat-label">总代码量</div>
            </div>
            <div class="stat-item">
              <el-icon><Cpu /></el-icon>
              <div class="stat-number">12,763</div>
              <div class="stat-label">Java代码</div>
            </div>
            <div class="stat-item">
              <el-icon><Monitor /></el-icon>
              <div class="stat-number">10,747</div>
              <div class="stat-label">前端代码</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 核心特性 -->
      <section v-if="activeSection === 'features'" class="doc-section">
        <h2>核心特性</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <el-icon><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <ul class="feature-details">
              <li v-for="(detail, i) in feature.details" :key="i">{{ detail }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 系统架构 -->
      <section v-if="activeSection === 'architecture'" class="doc-section">
        <h2>系统架构</h2>
        <div class="architecture-details">
          <h3>技术栈</h3>
          <div class="tech-stack">
            <div class="tech-category" v-for="(category, index) in techStack" :key="index">
              <h4>{{ category.name }}</h4>
              <div class="tech-items">
                <el-tag v-for="(tech, i) in category.items" :key="i">{{ tech }}</el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="architecture-description">
          <h3>系统架构说明</h3>
          <p>本系统采用前后端分离的微服务架构，主要包含以下组件：</p>
          <ul>
            <li>前端：基于 Vue.js 的单页面应用，使用 Element Plus 组件库</li>
            <li>后端：基于 Spring Boot 的微服务架构</li>
            <li>数据库：支持多种关系型数据库</li>
            <li>消息队列：使用 RabbitMQ 处理异步任务</li>
            <li>缓存：使用 Redis 提升系统性能</li>
            <li>安全：集成 Spring Security 和 JWT 认证</li>
          </ul>
        </div>
      </section>

      <!-- 安全机制 -->
      <section v-if="activeSection === 'security'" class="doc-section">
        <h2>安全机制</h2>
        <div class="security-features">
          <div class="security-card" v-for="(security, index) in securityFeatures" :key="index">
            <h3>{{ security.title }}</h3>
            <p>{{ security.description }}</p>
            <div class="security-details">
              <div class="detail-item" v-for="(detail, i) in security.details" :key="i">
                <el-icon><Check /></el-icon>
                <span>{{ detail }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 性能优化 -->
      <section v-if="activeSection === 'performance'" class="doc-section">
        <h2>性能优化</h2>
        <div class="performance-metrics">
          <div class="metric-card" v-for="(metric, index) in performanceMetrics" :key="index">
            <div class="metric-icon">
              <el-icon><component :is="metric.icon" /></el-icon>
            </div>
            <div class="metric-content">
              <h3>{{ metric.title }}</h3>
              <p>{{ metric.description }}</p>
              <div class="metric-stats">
                <div class="stat" v-for="(stat, i) in metric.stats" :key="i">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineOptions } from 'vue';
import { useRouter } from 'vue-router';
import {
  Document,
  Star,
  Setting,
  Lock,
  TrendCharts,
  Check,
  InfoFilled,
  WarningFilled,
  SuccessFilled,
  QuestionFilled,
  DataLine,
  Monitor,
  Cpu,
  Connection,
  Cloudy,
  ArrowLeft
} from '@element-plus/icons-vue';

const router = useRouter();

defineOptions({
  name: 'SystemDocumentation'
});

const activeSection = ref('overview');

const handleSelect = (index) => {
  activeSection.value = index;
};

const features = [
  {
    icon: DataLine,
    title: '分布式消息队列',
    description: '基于RabbitMQ的异步任务处理系统',
    details: [
      '实现任务执行消息的生产者和消费者服务',
      '通过Exchange和Queue配置实现可靠的消息路由',
      '支持系统解耦和异步处理'
    ]
  },
  {
    icon: Monitor,
    title: '高性能缓存',
    description: '基于Redis的缓存系统',
    details: [
      '显著提升系统响应速度',
      '实现审计日志等数据的缓存机制',
      '支持复杂数据类型和Java时间API'
    ]
  },
  {
    icon: Cpu,
    title: '敏感数据识别',
    description: '基于Presidio的智能识别系统',
    details: [
      '支持多种敏感数据类型识别',
      '提供REST API接口',
      '支持灵活的敏感数据分析'
    ]
  },
  {
    icon: Connection,
    title: '多数据库支持',
    description: '统一的数据库操作接口',
    details: [
      '支持MySQL、PostgreSQL、Oracle等',
      '处理不同数据库的特定数据类型',
      '支持SQL语法差异处理'
    ]
  }
];

const techStack = [
  {
    name: '后端技术',
    items: ['Spring Boot', 'Spring Security', 'Hibernate', 'RabbitMQ', 'Redis']
  },
  {
    name: '前端技术',
    items: ['Vue.js', 'Element Plus', 'TypeScript', 'Tailwind CSS']
  },
  {
    name: '数据库',
    items: ['MySQL', 'PostgreSQL', 'Oracle', 'SQL Server']
  },
  {
    name: '安全技术',
    items: ['JWT', 'OAuth2', 'SSL/TLS', '数据加密']
  }
];

const securityFeatures = [
  {
    title: '身份认证',
    description: '基于Spring Security的认证系统',
    details: [
      'JWT令牌机制',
      '无状态会话管理',
      '多角色权限控制'
    ]
  },
  {
    title: '数据保护',
    description: '全面的数据安全机制',
    details: [
      '动态SQL拦截',
      '敏感数据脱敏',
      '审计日志记录'
    ]
  },
  {
    title: '系统安全',
    description: '系统级安全防护',
    details: [
      '防止SQL注入',
      'XSS防护',
      'CSRF防护'
    ]
  }
];

const performanceMetrics = [
  {
    icon: TrendCharts,
    title: '系统性能',
    description: '优化的系统架构和性能指标',
    stats: [
      { value: '99.9%', label: '系统可用性' },
      { value: '<100ms', label: '平均响应时间' },
      { value: '1000+', label: '并发处理能力' }
    ]
  },
  {
    icon: Cloudy,
    title: '数据处理',
    description: '高效的数据处理能力',
    stats: [
      { value: '1M+', label: '日处理数据量' },
      { value: '50+', label: '脱敏算法' },
      { value: '10+', label: '数据库类型' }
    ]
  }
];
</script>

<style scoped>
.system-documentation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.doc-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 40px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.doc-title {
  font-size: 48px;
  font-weight: 800;
  color: #333;
  margin: 0 0 16px;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-icon {
  font-size: 48px;
  color: #1976D2;
  margin-bottom: 16px;
}

.gradient-text {
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  display: block;
  font-size: 20px;
  font-weight: 400;
  color: #666;
  margin-top: 8px;
}

.header-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
}

.doc-nav {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.doc-menu {
  border-right: none;
  display: flex;
  justify-content: center;
}

.doc-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.doc-section h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  line-height: 1.8;
  color: #666;
}

.highlight-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.highlight-box h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlight-box li {
  padding: 8px 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-box {
  display: flex;
  justify-content: space-around;
  margin-top: 32px;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-item .el-icon {
  font-size: 32px;
  color: #1976D2;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1976D2;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-icon .el-icon {
  font-size: 24px;
  color: white;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.feature-card p {
  color: #666;
  margin-bottom: 16px;
}

.feature-details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-details li {
  padding: 8px 0;
  color: #666;
  position: relative;
  padding-left: 20px;
}

.feature-details li:before {
  content: "•";
  color: #1976D2;
  position: absolute;
  left: 0;
}

.architecture-details {
  margin-bottom: 32px;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.tech-category h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.architecture-description {
  margin-top: 24px;
}

.security-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.security-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
}

.security-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.security-details {
  margin-top: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #666;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon .el-icon {
  font-size: 24px;
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.metric-stats {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1976D2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .doc-title {
    font-size: 36px;
  }
  
  .title-sub {
    font-size: 16px;
  }
  
  .doc-section {
    padding: 24px;
  }
  
  .features-grid,
  .security-features,
  .performance-metrics {
    grid-template-columns: 1fr;
  }
}

.header-actions {
  position: absolute;
  top: 20px;
  left: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1976D2;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: #2196F3;
  transform: translateX(-4px);
}

.back-button .el-icon {
  font-size: 16px;
}
</style> 