const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (config.plugins.has('preload')) {
      config.plugin('preload').tap(() => [
        {
          rel: 'preload',
          include: 'initial',
          fileBlacklist: [/\.map$/, /hot-update\.js$/]
        }
      ]);
    }

    if (config.plugins.has('prefetch')) {
      config.plugins.delete('prefetch');
    }
  },
  configureWebpack: process.env.NODE_ENV === 'production' ? {
    plugins: [
      new PrerenderSPAPlugin({
        // 必须是绝对路径
        staticDir: path.join(__dirname, 'dist'),
        // 预渲染的路由
        routes: ['/', '/login'],
        // 渲染器配置
        renderer: new Renderer({
          // 等待渲染完成的事件
          renderAfterDocumentEvent: 'render-event',
          // 渲染超时时间
          timeout: 10000,
          // 注入环境变量
          injectProperty: '__PRERENDER_INJECTED',
          inject: {
            prerendered: true
          },
          // 渲染后等待时间，确保所有资源加载完成
          renderAfterTime: 5000,
          // 避免在控制台输出日志
          headless: true
        })
      })
    ],
    optimization: {
      // 代码分割配置
      splitChunks: {
        cacheGroups: {
          // 抽离第三方库
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          // 抽离Element Plus
          elementPlus: {
            name: 'chunk-elementplus',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-plus(.*)/
          },
          // 抽离公共组件
          commons: {
            name: 'chunk-commons',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      }
    }
  } : {}
})
