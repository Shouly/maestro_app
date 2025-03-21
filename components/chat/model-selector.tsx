'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProviderStore } from '@/lib/provider-store';
import { useChatStore } from '@/lib/chat-store';
import { useState, useEffect } from 'react';

interface ModelSelectorProps {
  isDefaultSelector?: boolean;
}

/**
 * 模型选择器组件
 * 用于在聊天界面或设置中选择AI模型
 */
export function ModelSelector({ isDefaultSelector = false }: ModelSelectorProps) {
  const { getAvailableModels, defaultModelId, defaultProviderId, setDefaultModel, setDefaultProvider } = useProviderStore();
  const { getActiveConversation, updateConversation } = useChatStore();
  
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string; group: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // 获取所有可用模型并初始化选择
  useEffect(() => {
    const models = getAvailableModels();
    setModelOptions(models);
    
    if (isDefaultSelector) {
      // 如果是默认选择器，使用默认模型
      if (defaultProviderId && defaultModelId) {
        setSelectedModel(`${defaultProviderId}:${defaultModelId}`);
      } else if (models.length > 0) {
        setSelectedModel(models[0].value);
      }
    } else {
      // 如果是对话选择器，使用当前对话或默认模型
      const activeConversation = getActiveConversation();
      
      if (activeConversation && activeConversation.providerId && activeConversation.modelId) {
        setSelectedModel(`${activeConversation.providerId}:${activeConversation.modelId}`);
      } else if (defaultProviderId && defaultModelId) {
        setSelectedModel(`${defaultProviderId}:${defaultModelId}`);
      } else if (models.length > 0) {
        setSelectedModel(models[0].value);
      }
    }
  }, [getAvailableModels, defaultModelId, defaultProviderId, getActiveConversation, isDefaultSelector]);
  
  // 处理模型变更
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    
    // 将value拆分为providerId和modelId
    const [providerId, modelId] = value.split(':');
    
    if (isDefaultSelector) {
      // 更新默认模型设置
      setDefaultProvider(providerId);
      setDefaultModel(modelId);
    } else {
      // 更新当前对话的模型
      const activeConversation = getActiveConversation();
      if (!activeConversation) return;
      
      updateConversation(activeConversation.id, {
        providerId,
        modelId
      });
    }
  };
  
  // 如果没有可用模型，显示提示
  if (modelOptions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 rounded-md bg-muted/30 border">
        请在设置中添加AI供应商
      </div>
    );
  }
  
  // 根据模型选项分组渲染下拉菜单
  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="选择AI模型" />
      </SelectTrigger>
      <SelectContent>
        {/* 将选项按供应商分组 */}
        {Object.entries(
          modelOptions.reduce((groups, option) => {
            const group = option.group;
            groups[group] = groups[group] || [];
            groups[group].push(option);
            return groups;
          }, {} as Record<string, typeof modelOptions>)
        ).map(([group, options]) => (
          <div key={group}>
            <div className="px-2 py-1.5 text-xs font-semibold">{group}</div>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <div className="h-px bg-muted my-1"></div>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
} 