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
