/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 指定输出目录，与Tauri集成
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // Next.js将自动从环境变量或命令行参数中读取端口设置
};

export default nextConfig; 