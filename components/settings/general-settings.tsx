'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Globe, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function GeneralSettings() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [chatSuggestions, setChatSuggestions] = useState(true);
  const [language, setLanguage] = useState("zh-CN");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">常规设置</h2>
        </div>
      </div>
      
      <p className="text-muted-foreground -mt-1">
        配置应用程序的常规设置和用户首选项
      </p>
      
      <Card className="p-6">
        <div className="space-y-6">
          {/* 第一部分：界面设置 */}
          <div>
            <h3 className="text-lg font-medium mb-4">界面设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Moon className="h-4 w-4 mr-2" />
                    深色模式
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    启用深色模式以减少眼睛疲劳
                  </p>
                </div>
                <Switch 
                  checked={true} 
                  disabled={true}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    语言
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    选择应用程序界面语言
                  </p>
                </div>
                <Select 
                  value={language} 
                  onValueChange={setLanguage}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* 第二部分：通知设置 */}
          <div>
            <h3 className="text-lg font-medium mb-4">通知设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    系统通知
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    在应用程序未激活时接收桌面通知
                  </p>
                </div>
                <Switch 
                  checked={notificationEnabled} 
                  onCheckedChange={setNotificationEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">对话建议</Label>
                  <p className="text-sm text-muted-foreground">
                    在对话中显示智能建议和提示
                  </p>
                </div>
                <Switch 
                  checked={chatSuggestions} 
                  onCheckedChange={setChatSuggestions}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* 第三部分：数据与隐私 */}
          <div>
            <h3 className="text-lg font-medium mb-4">数据与隐私</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">本地存储限制</Label>
                  <p className="text-sm text-muted-foreground">
                    设置对话历史本地存储的最大数量
                  </p>
                </div>
                <Input 
                  type="number" 
                  className="w-24" 
                  defaultValue="100" 
                  min="10" 
                  max="1000"
                />
              </div>
              
              <div className="mt-6">
                <Button variant="destructive" size="sm">
                  清除所有对话历史
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  此操作将永久删除所有本地存储的对话数据，无法恢复
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 