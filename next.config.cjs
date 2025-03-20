/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // 指定输出目录，与Tauri集成
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
}; 