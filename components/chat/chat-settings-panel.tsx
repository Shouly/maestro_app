'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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
    }
  }, [activeConversation, defaultProviderId, defaultModelId]);
  
  // 保存设置
  const handleSave = () => {
    if (!activeConversation) return;
    
    // 拆分combinedModelId为providerId和modelId
    const [providerId, modelId] = combinedModelId.split(':');
    
    updateConversationSettings(activeConversation.id, {
      providerId,
      modelId,
      systemPrompt,
      maxTurns
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
        className="flex flex-col h-full overflow-hidden rounded-lg border border-border bg-background/70"
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
            
            {/* 保留对话轮数 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">保留对话轮数</Label>
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
                设置保留的最近对话轮数，超过此数量的早期对话会被忽略
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