'use client';

import { Button } from "@/app/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function UserProfile() {
  const params = useParams();
  const userId = params.id;

  return (
    <div className="flex min-h-screen flex-col p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto w-full"
      >
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">用户 {userId} 资料</h1>
          
          <div className="p-6 bg-card text-card-foreground rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">用户详情</h2>
            <p className="mb-4">这是一个动态路由页面示例，展示用户ID: {userId} 的详细信息。</p>
            <p className="mb-4">
              Next.js v15 App Router中，动态路由可以通过目录名称如 [id] 创建，
              并通过useParams()钩子获取路由参数。
            </p>
            <Button variant="outline">编辑用户</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 