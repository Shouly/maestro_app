'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProviderStore, type ConfiguredProvider } from '@/lib/provider-store';
import { Plus, Check, Trash2, Edit, ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddProviderDialog } from '@/components/settings/add-provider-dialog';
import { Switch } from '@/components/ui/switch';
import { ModelSelector } from '@/components/chat/model-selector';
import { useChatStore } from '@/lib/chat-store';
import { ModelServiceFactory } from '@/lib/services/service-factory';

// 获取模型服务工厂实例
const modelServiceFactory = ModelServiceFactory.getInstance();

export function ProviderSettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | undefined>(undefined);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const {
    configuredProviders,
    defaultProviderId,
    removeProvider,
    setDefaultProvider,
    getPredefinedProvider,
    fetchProviderModels
  } = useProviderStore();
  
  // 当组件加载时，自动刷新支持的供应商模型列表
  useEffect(() => {
    const refreshSupportedModels = async () => {
      // 查找所有已配置的、支持的且激活的供应商
      const supportedProviders = configuredProviders.filter(
        provider => provider.isActive && modelServiceFactory.supportsProvider(provider.providerId)
      );
      
      if (supportedProviders.length > 0) {
        setIsLoadingModels(true);
        
        try {
          // 为每个供应商获取模型列表
          for (const provider of supportedProviders) {
            await fetchProviderModels(provider.providerId);
          }
        } catch (error) {
          console.error('刷新模型列表失败:', error);
        } finally {
          setIsLoadingModels(false);
        }
      }
    };
    
    refreshSupportedModels();
  }, [configuredProviders, fetchProviderModels]);
  
  // 打开添加对话框
  const handleAddProvider = () => {
    setEditingProviderId(undefined);
    setIsAddDialogOpen(true);
  };
  
  // 打开编辑对话框
  const handleEditProvider = (providerId: string) => {
    setEditingProviderId(providerId);
    setIsAddDialogOpen(true);
  };
  
  // 删除供应商
  const handleRemoveProvider = (providerId: string) => {
    if (confirm('确定要删除此供应商吗？')) {
      removeProvider(providerId);
    }
  };
  
  // 设置默认供应商
  const handleSetDefault = (providerId: string) => {
    setDefaultProvider(providerId);
  };
  
  // 添加刷新模型列表的处理函数
  const handleRefreshModels = async (providerId: string) => {
    if (providerId !== 'openrouter') return;
    
    setIsLoadingModels(true);
    try {
      await fetchProviderModels(providerId);
    } catch (error) {
      console.error('刷新模型列表失败:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // 获取供应商图标
  const getProviderLogo = (providerId: string) => {
    const provider = configuredProviders.find((p: ConfiguredProvider) => p.providerId === providerId);
    const predefinedProvider = getPredefinedProvider(providerId);
    
    if (predefinedProvider?.logoUrl) {
      return (
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-muted">
          <img src={predefinedProvider.logoUrl} alt={predefinedProvider.name} className="w-6 h-6" />
        </div>
      );
    }
    
    // 如果没有找到图标，显示首字母
    const name = predefinedProvider?.name || 'API';
    const initial = name.charAt(0).toUpperCase();
    
    return (
      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary text-primary-foreground">
        {initial}
      </div>
    );
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">AI 供应商设置</h2>
        <Button 
          onClick={handleAddProvider} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          添加供应商
        </Button>
      </div>
      
      {configuredProviders.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md bg-muted/30">
          <p className="text-muted-foreground mb-4">
            您还没有配置任何AI供应商
          </p>
          <Button 
            onClick={handleAddProvider} 
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            添加第一个供应商
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {configuredProviders.map((provider: ConfiguredProvider) => {
            const predefinedProvider = getPredefinedProvider(provider.providerId);
            
            return (
              <div 
                key={provider.providerId} 
                className="flex items-center justify-between p-4 rounded-md border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getProviderLogo(provider.providerId)}
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {predefinedProvider?.name || provider.providerId}
                      {defaultProviderId === provider.providerId && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      API密钥: 
                      <span className="font-mono">
                        {provider.apiKey.substring(0, 4)}••••{provider.apiKey.substring(provider.apiKey.length - 4)}
                      </span>
                    </div>
                    {provider.baseUrl && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> 
                        自定义API URL
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {defaultProviderId !== provider.providerId && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleSetDefault(provider.providerId)}
                        title="设为默认"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {modelServiceFactory.supportsProvider(provider.providerId) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleRefreshModels(provider.providerId)}
                        disabled={isLoadingModels}
                        title="刷新模型列表"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleEditProvider(provider.providerId)}
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-destructive hover:text-destructive/90"
                      onClick={() => handleRemoveProvider(provider.providerId)}
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">默认模型设置</h3>
            <p className="text-sm text-muted-foreground mb-4">
              设置默认的AI模型，新对话将默认使用此模型。您仍然可以在对话中随时切换模型。
            </p>
            <div className="mt-4">
              <ModelSelector isDefaultSelector={true} />
            </div>
          </div>
        </div>
      )}
      
      <AddProviderDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        editingProviderId={editingProviderId || undefined}
      />
    </Card>
  );
} 