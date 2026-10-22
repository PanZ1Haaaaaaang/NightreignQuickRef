import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 部署在子路径，Vercel 部署在根路径
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'

// 第三方依赖分包规则（Vite 8 基于 Rolldown，manualChunks 只接受函数形式）
const vendorGroups: Array<{ name: string; test: RegExp }> = [
  { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
  { name: 'antd-vendor', test: /node_modules[\\/](antd|@ant-design|@antv|rc-[^\\/]+)[\\/]/ },
  { name: 'utils-vendor', test: /node_modules[\\/]lodash[\\/]/ },
]

export default defineConfig({
  base: isVercel ? '/' : '/NightreignQuickRef/',
  plugins: [
    react()
  ],
  // 构建时注入部署时间
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          for (const group of vendorGroups) {
            if (group.test.test(id)) return group.name
          }
        },
        // 产物文件名带 hash，便于缓存
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 2300,
    minify: 'terser',
    sourcemap: false,
    // 目标环境：现代浏览器（antd 6 起不再支持 IE）
    target: 'es2020',
  },
  // 依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'lodash'],
  },
  server: {
    hmr: true,
  },
})
