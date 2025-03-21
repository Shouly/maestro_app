'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/lib/chat-store';
import { useProviderStore } from '@/lib/provider-store';
import { ModelSelector } from './model-selector';

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSettingsPanel({ isOpen, onClose }: ChatSettingsPanelProps) {
  const { getActiveConversation, updateConversationSettings } = useChatStore();
  const { defaultModelId, defaultProviderId } = useProviderStore();
  
  const activeConversation = getActiveConversation();
  
  // 获取当前对话的设置或使用默认值
  const [combinedModelId, setCombinedModelId] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [temperature, setTemperature] = useState<number>(0.7); // 默认温度0.7
  const [maxTokens, setMaxTokens] = useState<number>(4000); // 默认最大tokens 4000
  
  // 初始化CSS变量以便在整个应用中使用
  useEffect(() => {
    // 设置面板宽度作为CSS变量
    document.documentElement.style.setProperty('--panel-width', '400px');
    
    return () => {
      // 清理
      document.documentElement.style.removeProperty('--panel-width');
    };
  }, []);
  
  // 监听活动对话变化，更新本地状态
  useEffect(() => {
    if (activeConversation) {
      // 设置模型和提供商ID
      if (activeConversation.providerId && activeConversation.modelId) {
        setCombinedModelId(`${activeConversation.providerId}:${activeConversation.modelId}`);
      } else if (defaultProviderId && defaultModelId) {
        setCombinedModelId(`${defaultProviderId}:${defaultModelId}`);
      }
      
      // 设置系统提示词
      setSystemPrompt(activeConversation.systemPrompt || '');
      
      // 设置最大对话轮数
      setMaxTurns(activeConversation.maxTurns || 10);
      
      // 设置温度
      setTemperature(activeConversation.temperature !== undefined ? activeConversation.temperature : 0.7);
      
      // 设置最大token数
      setMaxTokens(activeConversation.maxTokens || 4000);
    }
  }, [activeConversation, defaultProviderId, defaultModelId]);
  
  // 保存设置
  const handleSave = () => {
    if (!activeConversation) return;
    
    // 拆分combinedModelId为providerId和modelId
    // 修复处理方式，确保支持包含多个冒号的modelId
    const parts = combinedModelId.split(':');
    const providerId = parts[0];
    const modelId = parts.slice(1).join(':');
    
    updateConversationSettings(activeConversation.id, {
      providerId,
      modelId,
      systemPrompt,
      maxTurns,
      temperature,
      maxTokens
    });
    
    onClose();
  };
  
  // 重置为默认设置
  const handleReset = () => {
    if (defaultProviderId && defaultModelId) {
      setCombinedModelId(`${defaultProviderId}:${defaultModelId}`);
    }
    
    setSystemPrompt('');
    setMaxTurns(10);
    setTemperature(0.7);
    setMaxTokens(4000);
  };
  
  // 如果没有活动对话，不显示设置面板
  if (!activeConversation) return null;
  
  return (
    <div
      className={`absolute top-0 right-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ 
        width: 'var(--panel-width, 400px)',
        margin: '0.75rem 0.75rem 0.75rem 0',
        height: 'calc(100% - 1.5rem)'
      }}
    >
      <div 
        className="flex flex-col h-full overflow-hidden rounded-lg border-[0.5px] border-border/60 bg-background/70"
        style={{ 
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* 设置面板标题 */}
        <div className="px-5 py-4">
          <h3 className="font-medium">对话设置</h3>
        </div>
        
        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-7">
            {/* 模型选择 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">模型</Label>
              <ModelSelector
                value={combinedModelId}
                onChange={setCombinedModelId}
                showOnlyConfigured={true}
                searchable={true}
              />
            </div>
            
            {/* 系统提示词 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">系统提示词</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="设置AI的行为指导..."
                className="min-h-[120px] resize-y"
                maxLength={4000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {systemPrompt.length}/4000
              </p>
            </div>
            
            {/* 温度设置 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">温度（Temperature）</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[temperature]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{temperature.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                较低的值使回答更加确定和一致，较高的值使回答更加多样化和创造性
              </p>
            </div>
            
            {/* 最大Token数 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">最大输出Token数</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  min={100}
                  max={32000}
                  step={100}
                  className="w-24"
                />
                <Slider
                  value={[maxTokens]}
                  min={100}
                  max={8000}
                  step={100}
                  onValueChange={(value) => setMaxTokens(value[0])}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                限制模型单次回复生成的最大Token数，较大的值允许更长的回复
              </p>
            </div>
            
            {/* 上下文轮数 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">上下文轮数</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[maxTurns]}
                  min={2}
                  max={20}
                  step={1}
                  onValueChange={(value) => setMaxTurns(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{maxTurns}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                设置发送到模型的最大对话轮数，超过此数量的早期对话在调用AI时会被忽略
              </p>
            </div>
          </div>
        </div>
        
        {/* 底部操作按钮 */}
        <div className="px-5 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>恢复默认</Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  );
} 