'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { ProviderSettings } from '@/components/settings/provider-settings';
import { GeneralSettings } from '@/components/settings/general-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Settings as SettingsIcon, Paintbrush, Cpu, Code, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);
  
  // 解决水合问题和从URL读取tab参数
  useEffect(() => {
    setMounted(true);
    
    // 如果URL中有tab参数，设置为当前选项卡
    if (tabFromUrl && ['general', 'providers', 'appearance', 'advanced', 'about'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (!mounted) {
    return null;
  }

  return (
    <PageContainer fullWidth className="bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* 设置内容区域 - 两列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 左侧导航区域，包含标题和返回按钮 */}
          <div className="md:col-span-3">
            {/* 标题和返回按钮 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 h-8 px-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">返回</span>
                </Button>
                <h1 className="text-2xl font-bold">应用设置</h1>
              </div>
              <p className="text-muted-foreground text-sm">配置应用程序的全局设置和AI服务连接</p>
            </div>
            
            {/* 设置选项导航 */}
            <Card className="p-4 sticky top-8">
              <div className="space-y-1">
                <Button 
                  variant={activeTab === 'general' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-3 font-normal"
                  onClick={() => {
                    setActiveTab('general');
                    router.replace('/settings?tab=general');
                  }}
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span>常规设置</span>
                </Button>
                
                <Button 
                  variant={activeTab === 'providers' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-3 font-normal"
                  onClick={() => {
                    setActiveTab('providers');
                    router.replace('/settings?tab=providers');
                  }}
                >
                  <Cpu className="h-4 w-4" />
                  <span>AI 供应商</span>
                  <Badge variant="secondary" className="ml-auto text-xs">必需</Badge>
                </Button>
                
                <Button 
                  variant={activeTab === 'appearance' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-3 font-normal"
                  onClick={() => {
                    setActiveTab('appearance');
                    router.replace('/settings?tab=appearance');
                  }}
                >
                  <Paintbrush className="h-4 w-4" />
                  <span>外观</span>
                </Button>
                
                <Button 
                  variant={activeTab === 'advanced' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-3 font-normal"
                  onClick={() => {
                    setActiveTab('advanced');
                    router.replace('/settings?tab=advanced');
                  }}
                >
                  <Code className="h-4 w-4" />
                  <span>高级设置</span>
                </Button>
                
                <Separator className="my-4" />
                
                <Button 
                  variant={activeTab === 'about' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start gap-3 font-normal"
                  onClick={() => {
                    setActiveTab('about');
                    router.replace('/settings?tab=about');
                  }}
                >
                  <Info className="h-4 w-4" />
                  <span>关于</span>
                </Button>
              </div>
            </Card>
          </div>
          
          {/* 右侧内容区域 */}
          <div className="md:col-span-9 flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'general' && <GeneralSettings />}
              
              {activeTab === 'providers' && <ProviderSettings />}
              
              {activeTab === 'appearance' && <AppearanceSettings />}
              
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-xl font-semibold">高级设置</h2>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground -mt-1">
                    配置高级功能和开发者选项
                  </p>
                  
                  <Card className="p-6 bg-background">
                    <div className="text-center py-16 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>高级设置功能即将推出</p>
                    </div>
                  </Card>
                </div>
              )}
              
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-xl font-semibold">关于</h2>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground -mt-1">
                    软件版本信息和关于内容
                  </p>
                  
                  <Card className="p-6 bg-background">
                    <div className="max-w-lg mx-auto">
                      <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">M</span>
                        </div>
                      </div>
                      
                      <h3 className="text-center text-xl font-bold mb-2">Maestro AI 助手</h3>
                      <p className="text-center text-muted-foreground mb-6">
                        您的智能AI伙伴，帮助您完成各种任务和对话
                      </p>
                      
                      <div className="bg-muted p-4 rounded-md mb-6">
                        <h3 className="font-medium mb-3">应用信息</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-muted-foreground">版本</div>
                          <div>0.1.0</div>
                          <div className="text-muted-foreground">构建日期</div>
                          <div>2025年3月19日</div>
                          <div className="text-muted-foreground">框架</div>
                          <div>Next.js 14</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          © 2025 Maestro AI 团队. 保留所有权利.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 