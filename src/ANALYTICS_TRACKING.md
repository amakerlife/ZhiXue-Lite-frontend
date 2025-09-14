# 敏感操作分析追踪功能

## 概述

为 ZhiXue-Lite 前端项目添加了关键业务操作的 Google Analytics 事件追踪，专注于用户认证、账号管理和管理员操作等敏感操作。

## 新增追踪事件

### 🔐 用户认证事件

#### 登录成功 (`user_login_success`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `login` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    has_zhixue: boolean,       // 是否绑定智学网
    user_role: string,         // 用户角色
    login_method: string       // 登录方式 (with_captcha/without_captcha)
  }
  ```

#### 登录失败 (`user_login_failed`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `login` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    error_type: string,        // 错误类型
    has_captcha: boolean       // 是否使用验证码
  }
  ```

#### 注册成功 (`user_signup_success`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `signup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,              // 用户名
    email_domain: string,          // 邮箱域名
    registration_method: string    // 注册方式
  }
  ```

#### 注册失败 (`user_signup_failed`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `signup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    email_domain: string,       // 邮箱域名
    error_type: string,         // 错误类型
    has_captcha: boolean        // 是否使用验证码
  }
  ```

#### 登出成功 (`user_logout_success`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `logout` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    user_role: string,          // 用户角色
    had_zhixue: boolean         // 是否曾绑定智学网
  }
  ```

#### 登出失败 (`user_logout_failed`)
- **触发位置**: `src/contexts/AuthContext.tsx` - `logout` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    error_type: string          // 错误类型
  }
  ```

### 🔗 智学网账号管理事件

#### 智学网绑定成功 (`zhixue_bind_success`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `confirmConnectZhixue` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    zhixue_username: string,    // 智学网用户名
    has_captcha: boolean        // 是否使用验证码
  }
  ```

#### 智学网绑定失败 (`zhixue_bind_failed`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `confirmConnectZhixue` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    zhixue_username: string,    // 智学网用户名
    error_message: string,      // 错误信息
    has_captcha: boolean        // 是否使用验证码
  }
  ```

#### 智学网解绑成功 (`zhixue_unbind_success`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `confirmDisconnectZhixue` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    zhixue_username: string     // 智学网用户名
  }
  ```

#### 智学网解绑失败 (`zhixue_unbind_failed`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `confirmDisconnectZhixue` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    zhixue_username: string,    // 智学网用户名
    error_message: string       // 错误信息
  }
  ```

### 👤 用户信息更新事件

#### 用户信息更新成功 (`user_profile_update_success`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `handleUpdateUser` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    update_type: string,        // 更新类型 (email/password)
    field_updated: string       // 更新字段
  }
  ```

#### 用户信息更新失败 (`user_profile_update_failed`)
- **触发位置**: `src/pages/ProfilePage.tsx` - `handleUpdateUser` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    update_type: string,        // 更新类型
    field_updated: string,      // 更新字段
    error_message: string       // 错误信息
  }
  ```

### 🛡️ 管理员操作事件

#### 管理员解绑用户成功 (`admin_unbind_user_success`)
- **触发位置**: `src/pages/AdminPage.tsx` - `handleUnbindUser` 函数
- **追踪数据**:
  ```typescript
  {
    admin_username: string,     // 管理员用户名
    target_username: string,    // 被解绑的用户名
    zhixue_username: string     // 智学网用户名
  }
  ```

#### 管理员解绑用户失败 (`admin_unbind_user_failed`)
- **触发位置**: `src/pages/AdminPage.tsx` - `handleUnbindUser` 函数
- **追踪数据**:
  ```typescript
  {
    admin_username: string,     // 管理员用户名
    target_username: string,    // 被解绑的用户名
    zhixue_username: string,    // 智学网用户名
    error_message: string       // 错误信息
  }
  ```

### 📚 考试数据操作事件

#### 考试列表加载成功 (`exam_list_load_success`)
- **触发位置**: `src/pages/ExamsPage.tsx` - `loadExams` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    page: number,               // 页码
    per_page: number,           // 每页条数
    query: string | null,       // 搜索关键词
    exam_count: number,         // 返回的考试数量
    total_pages: number         // 总页数
  }
  ```

#### 考试列表加载失败 (`exam_list_load_failed`)
- **触发位置**: `src/pages/ExamsPage.tsx` - `loadExams` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    page: number,               // 页码
    query: string | null,       // 搜索关键词
    error_message: string,      // 错误信息
  }
  ```

#### 考试详情加载成功 (`exam_detail_load_success`)
- **触发位置**: `src/pages/ExamDetailPage.tsx` - `loadExamDetail` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string,          // 考试名称
    is_saved: boolean,          // 是否已保存
    subject_count: number,      // 科目数量
  }
  ```

#### 考试详情加载失败 (`exam_detail_load_failed`)
- **触发位置**: `src/pages/ExamDetailPage.tsx` - `loadExamDetail` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    error_message: string,      // 错误信息
    stage: string               // 失败阶段 (api_request/api_response)
  }
  ```

#### 从智学网拉取考试详情开始 (`exam_detail_fetch_started`)
- **触发位置**: `src/pages/ExamDetailPage.tsx` - `confirmFetchDetails` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    task_id: string,            // 任务ID
    force_refresh: boolean      // 是否强制刷新
  }
  ```

#### 从智学网拉取考试列表开始 (`exam_list_fetch_started`)
- **触发位置**: `src/pages/ExamsPage.tsx` - `confirmFetchExams` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    task_id: string             // 任务ID
  }
  ```

#### 考试成绩单加载成功 (`exam_detail_scoresheet_success`)
- **触发位置**: `src/pages/ExamDetailPage.tsx` - `handleDownloadScoresheet` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string           // 考试名称
  }
  ```

#### 考试成绩单加载失败 (`exam_detail_scoresheet_failed`)
- **触发位置**: `src/pages/ExamDetailPage.tsx` - `handleDownloadScoresheet` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string,          // 考试名称
    error_message: string       // 错误信息
  }
  ```

### 📊 数据查看页面事件

#### 数据查看页面拉取考试详情开始 (`data_viewer_exam_fetch_started`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `handleFetchExam` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    task_id: string,            // 任务ID
    force_refresh: boolean      // 是否强制刷新
  }
  ```

#### 数据查看页面考试信息查询成功 (`data_viewer_exam_info_success`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `handleExamLookup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string,          // 考试名称
    is_saved: boolean           // 考试是否已保存
  }
  ```

#### 数据查看页面考试信息查询失败 (`data_viewer_exam_info_failed`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `handleExamLookup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    error_message: string       // 错误信息
  }
  ```

#### 数据查看页面成绩单生成成功 (`data_viewer_scoresheet_success`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `generateScoresheet` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string,          // 考试名称
  }
  ```

#### 数据查看页面成绩单生成失败 (`data_viewer_scoresheet_failed`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `generateScoresheet` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    exam_name: string,          // 考试名称
    error_message: string       // 错误信息
  }
  ```

#### 数据查看页面成绩查询成功 (`data_viewer_score_lookup_success`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `handleScoreLookup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    search_type: string,        // 搜索类型 (id/name)
    student_identifier: string, // 学生标识符
    has_scores: boolean,        // 是否有分数数据
    subject_count: number       // 科目数量
  }
  ```

#### 数据查看页面成绩查询失败 (`data_viewer_score_lookup_failed`)
- **触发位置**: `src/pages/DataViewerPage.tsx` - `handleScoreLookup` 函数
- **追踪数据**:
  ```typescript
  {
    username: string,           // 用户名
    exam_id: string,            // 考试ID
    search_type: string,        // 搜索类型 (id/name)
    student_identifier: string, // 学生标识符
    error_message: string       // 错误信息
  }
  ```

## 技术实现

### 独立分析工具函数
创建了 `src/utils/analytics.ts` 文件，提供了独立的 `trackAnalyticsEvent` 函数，避免了循环依赖问题。

```typescript
export const trackAnalyticsEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    // Google Analytics 追踪
    if (config.ga.enabled && window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Umami 追踪
    if (config.umami.enabled && window.umami) {
      window.umami.track(eventName, properties);
    }

    // Microsoft Clarity 追踪
    if (config.clarity.enabled && window.clarity) {
      window.clarity('event', eventName);
    }
  } catch (error) {
    console.warn('Event tracking error:', error);
  }
};
```

### 安全考虑

1. **密码安全**: 追踪事件中绝不包含实际密码信息
2. **用户隐私**: 只追踪必要的标识符和操作结果
3. **错误处理**: 所有追踪代码都有错误捕获，不会影响业务流程
4. **条件追踪**: 只在分析工具启用时才执行追踪

## 使用价值

### 业务洞察
- **用户行为分析**: 了解用户登录、注册、绑定等关键操作的成功率
- **考试数据使用**: 分析用户查看考试列表和详情的频率和模式
- **功能使用统计**: 了解智学网数据拉取功能的使用情况
- **问题定位**: 快速识别用户操作中的常见问题点
- **安全监控**: 追踪敏感操作，便于安全审计

### 产品优化
- **转化率优化**: 分析各环节的转化情况，包括考试数据查看转化
- **用户体验**: 识别用户操作中的痛点，特别是数据拉取过程
- **性能优化**: 分析考试数据加载时间和成功率
- **功能改进**: 了解考试相关功能的使用频率和问题点

### 运营支持
- **数据驱动决策**: 基于真实用户行为数据优化产品
- **异常检测**: 及时发现异常操作模式
- **用户支持**: 更好地理解和解决用户问题，特别是考试数据相关问题
- **资源规划**: 根据考试数据拉取频率优化服务器资源

## 注意事项

1. 确保在生产环境中正确配置 GA 追踪 ID
2. 定期检查追踪数据的准确性
3. 遵守相关隐私法规和数据保护要求
4. 避免追踪敏感个人信息
