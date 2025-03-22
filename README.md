# Maestro - Tauri + Next.js + TypeScript

这是一个使用Tauri、Next.js v15、TypeScript和现代前端工具构建的桌面应用程序。

## 技术栈

- **Tauri**: 用于构建跨平台桌面应用
- **Next.js v15**: 用于React应用的框架，使用App Router
- **TypeScript**: 提供类型安全
- **Tailwind CSS**: 用于样式设计
- **shadcn/ui**: 高质量UI组件
- **Framer Motion**: 用于动画效果
- **Bun**: 用于包管理和构建
- **Zustand**: 用于状态管理

## 模型选择逻辑

Maestro实现了灵活而智能的模型选择系统，确保应用能够正确地应用用户偏好：

### 多级默认设置

- **供应商默认模型**：每个AI供应商可以有自己的默认模型，在该供应商使用时优先采用
- **全局默认模型**：系统维护一个全局默认模型，用于没有特定设置的场景
- **对话级设置**：每个对话都可以有自己的特定模型设置，覆盖全局设置

### 新对话创建逻辑

创建新对话时，系统按以下优先级应用设置：
1. 首先检查所选默认供应商是否有自己的默认模型设置
2. 如果有，则使用供应商的默认模型
3. 如果没有，则使用全局默认模型设置
4. 最后应用其他默认对话设置（温度、最大token数等）

### 设置默认值

- 当设置默认供应商时，系统会智能选择适当的默认模型：
  - 优先使用供应商现有的默认模型设置
  - 检查当前全局默认模型是否与新供应商兼容
  - 优先选择非"auto"类型的模型作为默认

- 当设置供应商默认模型时：
  - 如果该供应商也是全局默认供应商，全局默认模型会同步更新
  - 所有设置会在多个存储之间保持同步

## 功能特点

- 🌓 亮色/暗色主题切换
- 📱 响应式设计，适配各种设备尺寸
- 🔄 状态持久化保存
- 🧩 可组合和可重用的UI组件
- 🚀 Tauri后端与前端的无缝集成

## 开发环境设置

确保已安装以下工具:
- [Rust](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
bun run tauri dev
```

### 构建应用

```bash
bun run build
bun run tauri build
```

## 项目结构

- `app/`: Next.js应用页面（App Router）
  - `dashboard/`: 仪表盘页面
  - `globals.css`: 全局样式
  - `layout.tsx`: 根布局
  - `page.tsx`: 首页
- `components/`: 组件
  - `ui/`: UI基础组件 (Button, Card, Input等)
  - `layout/`: 布局组件
  - `theme/`: 主题相关组件
- `lib/`: 工具函数和逻辑
  - `utils.ts`: 通用工具函数
  - `store.ts`: 状态管理
- `public/`: 静态资源
- `types/`: 类型定义文件
- `src-tauri/`: Tauri/Rust后端代码

## 推荐的IDE设置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 贡献

欢迎提交Pull Requests和Issues。

# Maestro 应用

基于 Tauri + Next.js 构建的桌面应用。

## 功能列表

1. **登录系统**
   - 使用外部浏览器进行登录认证
   - 自动检查用户登录状态
   - 详细文档: [登录流程](./docs/login-flow.md)

2. **AI聊天界面**
   - 类似Claude的聊天体验
   - 多对话管理
   - 响应式设计
   - 详细文档: [聊天界面](./docs/chat-interface.md)

3. **主题切换**
   - 支持亮色/暗色主题
   - 跟随系统设置

## 技术栈

- **前端框架**: Next.js 15.0.0
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **桌面应用**: Tauri 2.0
- **开发工具**: TypeScript, ESLint

## 开发指南

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装Tauri CLI
cargo install tauri-cli
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev

# 启动Tauri应用（需要另一个终端）
cargo tauri dev
```

### 构建应用

```bash
npm run build
cargo tauri build
```

### 目录结构

```
maestro/
├── app/               # Next.js 页面
├── components/        # React 组件
│   ├── auth/          # 认证相关组件
│   ├── chat/          # 聊天界面组件
│   ├── layout/        # 布局组件
│   ├── theme/         # 主题相关组件
│   └── ui/            # 基础UI组件
├── docs/              # 文档
├── lib/               # 工具和服务
├── public/            # 静态资源
├── src-tauri/         # Tauri 应用源码
├── types/             # TypeScript 类型定义
└── README.md          # 项目说明
```

## 配置说明

### 环境变量

可以通过创建 `.env.local` 文件配置以下环境变量:

- `LOGIN_URL`: 登录页面URL
- `API_BASE_URL`: API基础URL

## 插件和权限

本应用使用了以下Tauri插件:

- **shell**: 用于打开外部浏览器
- **opener**: 用于打开外部文件

详细的权限配置见 `src-tauri/capabilities/default.json`。

# Maestro AI助手

Maestro是一个现代化的AI助手应用，支持多种AI供应商，提供流畅的聊天体验。

## 功能特点

- **多供应商支持**：支持Anthropic、OpenRouter等多种AI供应商
- **流式响应**：实时显示AI回复，提供更好的用户体验
- **优雅界面**：精心设计的用户界面，具有现代感和易用性
- **工具集成**：支持AI工具调用，扩展AI能力
- **对话管理**：轻松管理和组织多个对话
- **个性化设置**：自定义应用行为和外观

## 支持的AI供应商

Maestro目前支持以下AI供应商：

- **Anthropic**：支持Claude 3系列模型（Opus、Sonnet、Haiku）
- **OpenRouter**：支持多种模型，包括OpenAI、Anthropic、Cohere等

## 技术架构

Maestro采用现代化的技术栈和架构设计：

- **前端**：React、TypeScript、TailwindCSS
- **状态管理**：Zustand
- **架构模式**：工厂模式、策略模式、单例模式

### 聊天服务架构

Maestro实现了灵活的聊天服务架构，便于支持多种AI供应商：

- **聊天服务接口**：定义标准的聊天服务接口
- **聊天服务工厂**：管理不同供应商的聊天服务实例
- **特定供应商实现**：针对不同AI供应商的具体实现
- **React钩子**：简化UI组件与聊天服务的交互

## 开发指南

详细的开发文档可在docs目录下找到：

- [聊天服务架构](docs/chat-service.md)
- [聊天供应商支持](docs/chat-providers.md) 
- [开发者指南](docs/developer-guide.md)

## 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 许可

本项目采用MIT许可证。
