'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PROVIDER_PRESETS } from '@/lib/provider-presets';
import { useProviderStore } from '@/lib/provider-store';
import { isValidUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, Check, CheckCircle, ExternalLink, Loader2, RefreshCcw, ServerCog, Settings, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ModelSelector } from '../chat/model-selector';
import { ProviderIcon } from '../ui/provider-icon';

export function ProviderSettings() {
    // 状态管理
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string>('');
    const [baseUrl, setBaseUrl] = useState<string>('');
    const [isBaseUrlValid, setIsBaseUrlValid] = useState<boolean>(true);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [selectedTab, setSelectedTab] = useState<string>('基本设置');
    const [providerDefaultModelValue, setProviderDefaultModelValue] = useState<string>('');
    const [isRefreshingModels, setIsRefreshingModels] = useState<boolean>(false);

    // 初始化状态跟踪
    const initializationRef = useRef(false);

    // 从store获取状态和方法
    const {
        configuredProviders,
        defaultProviderId,
        defaultModelId,
        addProvider,
        updateProvider,
        setDefaultProvider,
        setDefaultModel,
        getPredefinedProvider,
        getProviderConfig,
        testProviderConnection,
        fetchProviderModels,
        setProviderDefaultModel,
    } = useProviderStore();

    // 初始化时加载一次模型列表
    useEffect(() => {
        if (initializationRef.current) return;

        let isMounted = true;
        initializationRef.current = true;

        const initializeModelLists = async () => {
            const currentConfiguredProviders = configuredProviders;

            // 初始化时，我们仅选择第一个供应商而不加载模型列表
            if (isMounted) {
                // 初始化完成后，自动选择第一个供应商（如果有配置的）
                if (currentConfiguredProviders.length > 0) {
                    selectProvider(currentConfiguredProviders[0].providerId);
                } else if (PROVIDER_PRESETS.length > 0) {
                    // 没有配置的供应商，选择第一个预设供应商
                    selectProvider(PROVIDER_PRESETS[0].id);
                }
            }
        };

        // 移除setTimeout，直接执行初始化
        initializeModelLists();

        return () => {
            isMounted = false;
        };
    }, []);

    // 监听刷新状态
    useEffect(() => {
        // 更新当前选中供应商的默认模型值
        if (selectedProviderId) {
            const provider = getProviderConfig(selectedProviderId);
            if (provider && provider.defaultModelId) {
                // 更新模型值，保留完整的ID
                const newValue = `${selectedProviderId}:${provider.defaultModelId}`;
                setProviderDefaultModelValue(newValue);
            } else {
                setProviderDefaultModelValue('');
            }
        }
    }, [refreshCounter, configuredProviders, defaultProviderId, defaultModelId, selectedProviderId, getProviderConfig]);

    // 选择供应商
    const selectProvider = (providerId: string) => {
        setSelectedProviderId(providerId);
        setApiKey('');
        setBaseUrl('');
        setErrorMessage('');
        setSuccessMessage('');

        // 获取供应商配置
        const configuredProvider = getProviderConfig(providerId);
        if (configuredProvider) {
            setApiKey(configuredProvider.apiKey || '');
            setBaseUrl(configuredProvider.baseUrl || '');

            // 设置供应商默认模型值
            if (configuredProvider.defaultModelId) {
                const newValue = `${providerId}:${configuredProvider.defaultModelId}`;
                console.log('设置供应商默认模型:', newValue);
                // 确保状态更新
                setProviderDefaultModelValue(newValue);
            } else {
                setProviderDefaultModelValue('');
                console.log('供应商没有默认模型');
            }
        } else {
            // 如果是未配置的供应商，清空默认模型值
            setProviderDefaultModelValue('');
        }

        // 获取供应商预设
        const predefinedProvider = getPredefinedProvider(providerId);
        if (predefinedProvider && !configuredProvider) {
            setBaseUrl(predefinedProvider.baseUrl);
        }

        // 强制刷新以确保UI更新
        setRefreshCounter(prev => prev + 1);
    };

    // 处理基础URL变更
    const handleBaseUrlChange = (url: string) => {
        setBaseUrl(url);
        setIsBaseUrlValid(url === '' || isValidUrl(url));

        // 自动保存配置（如果API key已填写）
        if (selectedProviderId && apiKey.trim()) {
            autoSaveConfig(selectedProviderId, apiKey, url);
        }
    };

    // 处理API密钥变更
    const handleApiKeyChange = (key: string) => {
        setApiKey(key);

        // 自动保存配置（如果key不为空且URL有效）
        if (selectedProviderId && key.trim() && (baseUrl === '' || isBaseUrlValid)) {
            autoSaveConfig(selectedProviderId, key, baseUrl);
        }
    };

    // 自动保存配置
    const autoSaveConfig = (providerId: string, key: string, url: string) => {
        if (!key.trim()) return;
        if (url && !isBaseUrlValid) return;

        try {
            // 检查是否已存在配置
            const existingConfig = getProviderConfig(providerId);

            if (existingConfig) {
                // 更新现有配置
                updateProvider(providerId, key, url || undefined);
            } else {
                // 添加新配置
                addProvider(providerId, key, url || undefined);
            }

            // 设置成功消息，移除setTimeout
            setSuccessMessage('已保存');

            // 更新刷新计数器以强制重新渲染
            setRefreshCounter(prev => prev + 1);
        } catch (error) {
            setErrorMessage('保存失败');
        }
    };

    // 测试连接
    const handleTestConnection = async () => {
        if (!selectedProviderId) return;

        if (!apiKey.trim()) {
            setErrorMessage('请输入API密钥');
            return;
        }

        if (baseUrl && !isBaseUrlValid) {
            setErrorMessage('请输入有效的基础URL');
            return;
        }

        setIsVerifying(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const isSuccess = await testProviderConnection(
                selectedProviderId,
                apiKey,
                baseUrl || undefined
            );

            if (isSuccess) {
                setSuccessMessage('验证成功，API密钥有效。');

                // 验证成功后自动获取模型列表
                await fetchProviderModels(selectedProviderId);

                // 自动切换到模型设置选项卡
                setSelectedTab('模型设置');
            } else {
                setErrorMessage('API密钥无效，请检查后重试。');
            }
        } catch (error) {
            setErrorMessage('验证失败，请检查API密钥和网络连接。');
        } finally {
            setIsVerifying(false);
        }
    };

    // 设置默认供应商
    const handleSetDefaultProvider = async () => {
        if (!selectedProviderId) return;

        // 检查是否已配置
        const configuredProvider = getProviderConfig(selectedProviderId);
        if (!configuredProvider && apiKey.trim()) {
            // 自动保存配置
            autoSaveConfig(selectedProviderId, apiKey, baseUrl);
        }

        // 获取当前供应商的配置
        const currentProvider = getProviderConfig(selectedProviderId) || {
            providerId: selectedProviderId,
            apiKey: '',
            isActive: true
        };
        
        // 只设置默认提供商，不自动设置默认模型
        setDefaultProvider(selectedProviderId);
        console.log('已设置默认供应商:', selectedProviderId);

        // 确定要设置的默认模型
        let modelToSet = null;
        
        // 优先使用供应商的默认模型（如果已设置）
        if (currentProvider.defaultModelId) {
            modelToSet = currentProvider.defaultModelId;
            console.log('使用供应商已设置的默认模型:', modelToSet);
        } 
        // 其次检查当前默认模型是否与新供应商兼容
        else {
            const currentDefaultModel = useProviderStore.getState().defaultModelId;
            const provider = getPredefinedProvider(selectedProviderId);
            
            if (provider && provider.models.length > 0) {
                const isModelCompatible = currentDefaultModel && 
                    provider.models.some(m => m.id === currentDefaultModel);
                
                if (isModelCompatible) {
                    // 如果当前默认模型与新供应商兼容，保留此模型
                    modelToSet = currentDefaultModel;
                    console.log('保留现有默认模型（与新供应商兼容）:', modelToSet);
                } else {
                    // 获取该供应商第一个不是"auto"的模型（如果有）
                    const preferredModel = provider.models.find(m => m.id !== 'openrouter:auto') || provider.models[0];
                    modelToSet = preferredModel.id;
                    console.log('选择新的默认模型:', modelToSet);
                }
            }
        }
        
        // 设置全局默认模型
        if (modelToSet) {
            setDefaultModel(modelToSet);
            console.log('已设置全局默认模型:', modelToSet);
        }

        setSuccessMessage('已设置为默认供应商');
        setRefreshCounter(prev => prev + 1);
    };

    // 获取供应商是否已配置
    const isProviderConfigured = (providerId: string) => {
        return configuredProviders.some(p => p.providerId === providerId && p.apiKey.trim() !== '');
    };

    // 获取供应商图标
    const getProviderLogo = (providerId: string) => {
        return <ProviderIcon providerId={providerId} size={40} />;
    };

    // 处理供应商默认模型变更
    const handleProviderDefaultModelChange = (value: string) => {
        if (!selectedProviderId) return;

        // 直接设置模型值
        setProviderDefaultModelValue(value);

        // 从value中获取modelId部分 (修复处理方式，确保支持包含多个冒号的modelId)
        const parts = value.split(':');
        const providerId = parts[0]; // 这应该与selectedProviderId相同
        const modelId = parts.slice(1).join(':');
        
        console.log('设置供应商默认模型:', {
            providerId: selectedProviderId,
            valueFromSelect: value,
            extractedModelId: modelId,
            fullModelId: providerId + ':' + modelId
        });

        // 设置该供应商的默认模型
        setProviderDefaultModel(selectedProviderId, modelId);
        
        // 如果当前选中的供应商也是默认供应商，则同时更新全局默认模型
        const currentDefaultProviderId = useProviderStore.getState().defaultProviderId;
        if (currentDefaultProviderId === selectedProviderId) {
            console.log('当前供应商也是默认供应商，同时更新全局默认模型:', modelId);
            setDefaultModel(modelId);
        }

        // 触发刷新
        setRefreshCounter(prev => prev + 1);

        // 设置成功消息
        setSuccessMessage(`已设置供应商默认模型: ${modelId}`);
    };

    // 刷新模型列表
    const handleRefreshModels = async () => {
        if (!selectedProviderId) return;

        setIsRefreshingModels(true);
        try {
            await fetchProviderModels(selectedProviderId);
            // 设置成功消息，移除setTimeout
            setSuccessMessage('模型列表已更新');
        } catch (error) {
            setErrorMessage('无法获取模型列表');
        } finally {
            setIsRefreshingModels(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <ServerCog className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">AI 供应商</h2>
                </div>

                <div>
                    {selectedProviderId && isProviderConfigured(selectedProviderId) && defaultProviderId !== selectedProviderId && (
                        <Button
                            variant="outline"
                            onClick={handleSetDefaultProvider}
                            className="mr-2"
                            size="sm"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            设为默认
                        </Button>
                    )}
                </div>
            </div>

            <p className="text-muted-foreground -mt-1">
                配置AI供应商连接以开始使用应用程序。至少需要一个配置好的供应商。
            </p>

            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* 左侧供应商列表 */}
                    <div className="md:col-span-3">
                        <h3 className="text-base font-medium mb-4 flex items-center text-muted-foreground">
                            <Settings className="h-4 w-4 mr-2" />
                            供应商列表
                        </h3>
                        <div className="space-y-2.5">
                            {PROVIDER_PRESETS.map((provider) => {
                                const isConfigured = isProviderConfigured(provider.id);
                                const isSelected = selectedProviderId === provider.id;
                                const isDefault = defaultProviderId === provider.id;

                                return (
                                    <motion.div
                                        key={provider.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border 
                                            ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/30'}`}
                                        onClick={() => selectProvider(provider.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {getProviderLogo(provider.id)}
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm flex items-center gap-2 truncate">
                                                    {provider.name}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {isDefault && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-primary/20">
                                                            默认
                                                        </Badge>
                                                    )}
                                                    {isConfigured && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-600 border-green-200">
                                                            已配置
                                                        </Badge>
                                                    )}
                                                    {!isConfigured && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-muted/40 text-muted-foreground border-muted">
                                                            未配置
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 右侧配置面板 */}
                    <div className="md:col-span-9">
                        {selectedProviderId ? (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                key={selectedProviderId}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-medium flex items-center">
                                        {getProviderLogo(selectedProviderId)}
                                        <span className="ml-3">{getPredefinedProvider(selectedProviderId)?.name || '供应商'}</span>
                                    </h3>
                                </div>

                                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
                                    <TabsList className="mb-4 w-full max-w-md">
                                        <TabsTrigger value="基本设置" className="flex-1">基本设置</TabsTrigger>
                                        <TabsTrigger value="模型设置" className="flex-1" disabled={!isProviderConfigured(selectedProviderId)}>
                                            模型设置
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="基本设置" className="space-y-6">
                                        <Card className="p-6 border border-border/60 bg-background shadow-sm">
                                            <div className="grid gap-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="api-key" className="flex items-center text-base">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        API密钥
                                                    </Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                id="api-key"
                                                                type="password"
                                                                value={apiKey}
                                                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                                                placeholder="输入您的API密钥"
                                                                className="pr-24"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground flex items-center">
                                                        {selectedProviderId === 'openai' && (
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex items-center"
                                                            >
                                                                请在
                                                                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 flex items-center hover:underline">
                                                                    OpenAI开发者控制台
                                                                    <ExternalLink className="h-3 w-3 ml-0.5" />
                                                                </a>
                                                                获取API密钥
                                                            </motion.span>
                                                        )}
                                                        {selectedProviderId === 'anthropic' && (
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex items-center"
                                                            >
                                                                请在
                                                                <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 flex items-center hover:underline">
                                                                    Anthropic控制台
                                                                    <ExternalLink className="h-3 w-3 ml-0.5" />
                                                                </a>
                                                                获取API密钥
                                                            </motion.span>
                                                        )}
                                                        {selectedProviderId === 'gemini' && (
                                                            <motion.span
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex items-center"
                                                            >
                                                                请在
                                                                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 flex items-center hover:underline">
                                                                    Google AI Studio
                                                                    <ExternalLink className="h-3 w-3 ml-0.5" />
                                                                </a>
                                                                获取API密钥
                                                            </motion.span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="base-url" className="flex items-center text-base">
                                                        基础URL（可选）
                                                    </Label>
                                                    <Input
                                                        id="base-url"
                                                        type="text"
                                                        value={baseUrl}
                                                        onChange={(e) => handleBaseUrlChange(e.target.value)}
                                                        placeholder="例如: https://api.openai.com/v1"
                                                        className={!isBaseUrlValid ? 'border-red-500' : ''}
                                                    />
                                                    {!isBaseUrlValid && (
                                                        <p className="text-sm text-red-500 flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            请输入有效的URL
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground">
                                                        如果为空，将使用供应商的默认基础URL
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator className="my-6" />

                                            <div className="flex justify-end">
                                                <Button
                                                    variant="default"
                                                    onClick={handleTestConnection}
                                                    className="gap-2 w-full sm:w-auto"
                                                    disabled={isVerifying || !apiKey.trim()}
                                                >
                                                    {isVerifying ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                    测试API连接
                                                </Button>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="模型设置" className="space-y-6">
                                        <Card className="p-6 border border-border/60 bg-background shadow-sm">
                                            <h4 className="text-base font-medium mb-4">供应商默认模型</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                选择当前供应商默认使用的AI模型，将在使用该供应商时优先选择。
                                            </p>
                                            <div className="mb-4">
                                                {(() => {
                                                    return null;
                                                })()}
                                                <ModelSelector
                                                    isDefaultSelector={false}
                                                    showOnlyConfigured={true}
                                                    filterByProviderId={selectedProviderId || undefined}
                                                    value={providerDefaultModelValue}
                                                    onChange={handleProviderDefaultModelChange}
                                                    searchable={true}
                                                    key={`model-selector-${selectedProviderId}-${refreshCounter}`}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">
                                                此设置仅影响当前选中的供应商。
                                            </p>
                                        </Card>

                                        <Card className="p-6 border border-border/60 bg-background shadow-sm">
                                            <h4 className="text-base font-medium mb-4">模型列表管理</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                点击刷新按钮从API获取该供应商支持的最新模型列表。
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={handleRefreshModels}
                                                className="gap-2"
                                                size="sm"
                                                disabled={isRefreshingModels}
                                            >
                                                {isRefreshingModels ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCcw className="h-4 w-4" />
                                                )}
                                                刷新模型列表
                                            </Button>
                                        </Card>
                                    </TabsContent>
                                </Tabs>

                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-3 bg-red-50 border border-red-200 rounded-md"
                                    >
                                        <p className="text-sm text-red-600 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {errorMessage}
                                        </p>
                                    </motion.div>
                                )}

                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-3 bg-green-50 border border-green-200 rounded-md"
                                    >
                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            {successMessage}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                请从左侧选择一个供应商进行配置
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
} 