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
bun run dev
```

### 构建应用

```bash
bun run build
bun run tauri build
```

## 项目结构

- `app/`: Next.js应用目录（App Router）
  - `components/`: UI组件
  - `lib/`: 工具函数和库
  - `[route]/`: 动态路由
- `src-tauri/`: Tauri/Rust后端代码
- `public/`: 静态资源

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
