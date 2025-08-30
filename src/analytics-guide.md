# 分析工具集成指南

ZhiXue-Lite 前端已经集成了三个主流的分析工具：

- **Microsoft Clarity** - 用户行为热图和会话回放
- **Google Analytics** - 网站流量和用户行为分析
- **Umami** - 隐私友好的开源网站分析

## 配置

### 环境变量

在 `.env` 文件中配置以下变量：

```env
# Microsoft Clarity
VITE_CLARITY_ENABLED=true
VITE_CLARITY_PROJECT_ID=your_clarity_project_id

# Google Analytics
VITE_GA_ENABLED=true
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Umami Analytics
VITE_UMAMI_ENABLED=true
VITE_UMAMI_WEBSITE_ID=your_website_id
VITE_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
```

### 获取配置参数

1. **Microsoft Clarity**:
   - 访问 [Microsoft Clarity](https://clarity.microsoft.com/)
   - 创建项目后获取 Project ID

2. **Google Analytics**:
   - 访问 [Google Analytics](https://analytics.google.com/)
   - 创建 GA4 属性后获取测量 ID (格式: G-XXXXXXXXXX)

3. **Umami**:
   - 部署自己的 [Umami 实例](https://umami.is/docs/getting-started) 或使用云服务
   - 创建网站后获取 Website ID 和脚本 URL

## 使用方法

### 自动页面追踪

页面浏览会自动追踪，无需额外配置。

### 手动事件追踪

在组件中使用 `useAnalyticsContext` hook：

```tsx
import React from 'react';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

const MyComponent: React.FC = () => {
  const { trackEvent } = useAnalyticsContext();

  const handleButtonClick = () => {
    trackEvent('button_click', {
      button_name: 'submit_form',
      page: 'contact',
      user_id: 'user123'
    });
  };

  return (
    <button onClick={handleButtonClick}>
      提交表单
    </button>
  );
};
```

### 常见事件类型

建议使用以下标准事件名称：

- `page_view` - 页面浏览（自动追踪）
- `button_click` - 按钮点击
- `form_submit` - 表单提交
- `user_login` - 用户登录
- `user_logout` - 用户登出
- `file_download` - 文件下载

## 架构说明

```
src/
├── contexts/
│   └── AnalyticsContext.tsx      # 分析工具上下文提供者
├── hooks/
│   ├── useAnalytics.ts          # 分析工具初始化 hook
│   └── usePageTracking.ts       # 页面追踪 hook
├── types/
│   └── analytics.ts             # 分析工具类型定义
└── components/
    └── analytics/
        └── ExampleAnalyticsUsage.tsx  # 使用示例
```

## 隐私和合规

- 所有分析工具都支持按需启用/禁用
- Umami 是隐私友好的开源替代方案
- 建议根据用户隐私偏好动态控制追踪
- 确保遵循 GDPR、CCPA 等相关法规

## 故障排除

### 常见问题

1. **分析工具未加载**
   - 检查环境变量是否正确设置
   - 确认 `VITE_*_ENABLED=true`
   - 检查浏览器控制台是否有错误

2. **事件未追踪**
   - 确保组件被 `AnalyticsProvider` 包裹
   - 检查 `trackEvent` 调用是否正确
   - 验证分析平台是否接收到数据

3. **页面浏览未追踪**
   - 确认 `usePageTracking` 在路由变化时被调用
   - 检查 React Router 配置是否正确

### 调试模式

开发环境下可以在浏览器控制台查看分析事件：

```javascript
// 检查 window 对象上的分析工具
console.log(window.gtag);      // Google Analytics
console.log(window.clarity);   // Microsoft Clarity
console.log(window.umami);     // Umami
```