'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProviderStore } from '@/lib/provider-store';
import { useChatStore } from '@/lib/chat-store';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ModelSelectorProps {
  isDefaultSelector?: boolean;
  showOnlyConfigured?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
}

/**
 * 模型选择器组件
 * 用于在聊天界面或设置中选择AI模型
 */
export function ModelSelector({ 
  isDefaultSelector = false,
  showOnlyConfigured = false,
  value,
  onChange,
  searchable = false
}: ModelSelectorProps) {
  const { getAvailableModels, defaultModelId, defaultProviderId, setDefaultModel, setDefaultProvider } = useProviderStore();
  const { getActiveConversation, updateConversation } = useChatStore();
  
  const [modelOptions, setModelOptions] = useState<{ value: string; label: string; group: string }[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<{ value: string; label: string; group: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 获取所有可用模型并初始化选择
  useEffect(() => {
    let models = getAvailableModels();
    
    // 如果需要只显示已配置的供应商，过滤掉未配置的
    if (showOnlyConfigured) {
      // 这里假设value格式为"providerId:modelId"
      // 我们按providerId分组过滤
      const configuredProviderIds = models
        .map(m => m.value.split(':')[0])
        .filter((v, i, a) => a.indexOf(v) === i); // 去重
        
      models = models.filter(m => configuredProviderIds.includes(m.value.split(':')[0]));
    }
    
    setModelOptions(models);
    setFilteredOptions(models);
    
    // 如果外部传入value，使用外部value
    if (value) {
      setSelectedModel(value);
      return;
    }
    
    // 否则根据不同场景设置默认值
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
  }, [getAvailableModels, defaultModelId, defaultProviderId, getActiveConversation, isDefaultSelector, showOnlyConfigured, value]);
  
  // 处理搜索
  useEffect(() => {
    if (!searchable || !searchQuery.trim()) {
      setFilteredOptions(modelOptions);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = modelOptions.filter(option => 
      option.label.toLowerCase().includes(query) || 
      option.group.toLowerCase().includes(query)
    );
    
    setFilteredOptions(filtered);
  }, [searchQuery, modelOptions, searchable]);
  
  // 处理模型变更
  const handleModelChange = (newValue: string) => {
    setSelectedModel(newValue);
    
    // 如果外部提供了onChange回调，直接调用
    if (onChange) {
      onChange(newValue);
      return;
    }
    
    // 将value拆分为providerId和modelId
    const [providerId, modelId] = newValue.split(':');
    
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
    <Select 
      value={value || selectedModel} 
      onValueChange={handleModelChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择AI模型" />
      </SelectTrigger>
      <SelectContent>
        {searchable && (
          <div className="px-2 py-2 sticky top-0 bg-background z-10">
            <div className="flex items-center border rounded-md px-3 py-1">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模型..."
                className="border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        )}
        
        {/* 将选项按供应商分组 */}
        {Object.entries(
          filteredOptions.reduce((groups, option) => {
            const group = option.group;
            groups[group] = groups[group] || [];
            groups[group].push(option);
            return groups;
          }, {} as Record<string, typeof filteredOptions>)
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
        
        {filteredOptions.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            没有找到匹配的模型
          </div>
        )}
      </SelectContent>
    </Select>
  );
} 