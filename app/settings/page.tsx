'use client';

import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProviderSettings } from '@/components/settings/provider-settings';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4 gap-2" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">常规</TabsTrigger>
          <TabsTrigger value="providers">AI 供应商</TabsTrigger>
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="advanced">高级</TabsTrigger>
          <TabsTrigger value="about">关于</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">常规设置</h2>
            <p className="text-muted-foreground">常规设置内容将在此处显示</p>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <ProviderSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">外观设置</h2>
            <p className="text-muted-foreground">外观设置内容将在此处显示</p>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">高级设置</h2>
            <p className="text-muted-foreground">高级设置内容将在此处显示</p>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">关于</h2>
            <p className="text-muted-foreground">软件版本信息和关于内容将在此处显示</p>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 