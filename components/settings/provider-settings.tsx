'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROVIDER_PRESETS } from '@/lib/provider-presets';
import { useProviderStore } from '@/lib/provider-store';
import { isValidUrl } from '@/lib/utils';
import { AlertCircle, Check, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

    // 初始化状态跟踪
    const initializationRef = useRef(false);

    // 从store获取状态和方法
    const {
        configuredProviders,
        defaultProviderId,
        addProvider,
        updateProvider,
        setDefaultProvider,
        getPredefinedProvider,
        getProviderConfig,
        testProviderConnection
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

        setTimeout(initializeModelLists, 500);

        return () => {
            isMounted = false;
        };
    }, []);

    // 监听刷新状态
    useEffect(() => {
        console.log('组件状态更新:', {
            refreshCounter,
            providersCount: configuredProviders.length,
            defaultProviderId
        });
    }, [refreshCounter, configuredProviders, defaultProviderId]);

    // 选择供应商
    const selectProvider = (providerId: string) => {
        setSelectedProviderId(providerId);
        setErrorMessage('');
        setSuccessMessage('');

        // 查找是否已配置
        const configuredProvider = getProviderConfig(providerId);
        if (configuredProvider) {
            setApiKey(configuredProvider.apiKey);
            setBaseUrl(configuredProvider.baseUrl || '');
        } else {
            // 未配置，使用默认值
            setApiKey('');
            const preset = PROVIDER_PRESETS.find(p => p.id === providerId);
            setBaseUrl(preset?.baseUrl || '');
        }
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

            // 简短的成功提示并自动清除
            setSuccessMessage('已保存');
            setTimeout(() => {
                if (successMessage === '已保存') {
                    setSuccessMessage('');
                }
            }, 2000);

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
            } else {
                setErrorMessage('API密钥无效，请检查后重试。');
            }
        } catch (error) {
            setErrorMessage('验证失败，请检查API密钥和网络连接。');
        } finally {
            setIsVerifying(false);
        }
    };

    // 设置为默认供应商
    const handleSetDefault = () => {
        if (!selectedProviderId) return;

        // 检查是否已配置
        const configuredProvider = getProviderConfig(selectedProviderId);
        if (!configuredProvider && apiKey.trim()) {
            // 自动保存配置
            autoSaveConfig(selectedProviderId, apiKey, baseUrl);
        }

        setDefaultProvider(selectedProviderId);
        setSuccessMessage('已设置为默认供应商');
        setRefreshCounter(prev => prev + 1);
    };

    // 获取供应商是否已配置
    const isProviderConfigured = (providerId: string) => {
        return configuredProviders.some(p => p.providerId === providerId);
    };

    // 获取供应商图标
    const getProviderLogo = (providerId: string) => {
        const predefinedProvider = getPredefinedProvider(providerId);

        if (predefinedProvider?.logoUrl) {
            return (
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-muted">
                    <img src={predefinedProvider.logoUrl} alt={predefinedProvider.name} className="w-5 h-5" />
                </div>
            );
        }

        // 如果没有找到图标，显示首字母
        const name = predefinedProvider?.name || 'API';
        const initial = name.charAt(0).toUpperCase();

        return (
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary text-primary-foreground">
                {initial}
            </div>
        );
    };

    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 左侧供应商列表 */}
                <div className="md:col-span-1 border-r pr-4">
                    <h3 className="text-sm font-medium mb-3">供应商列表</h3>
                    <div className="space-y-1">
                        {PROVIDER_PRESETS.map((provider) => {
                            const isConfigured = isProviderConfigured(provider.id);
                            const isSelected = selectedProviderId === provider.id;
                            const isDefault = defaultProviderId === provider.id;

                            return (
                                <div
                                    key={provider.id}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                                        }`}
                                    onClick={() => selectProvider(provider.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {getProviderLogo(provider.id)}
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {provider.name}
                                                {isDefault && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                                        默认
                                                    </span>
                                                )}
                                            </div>
                                            {isConfigured && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    已配置
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 右侧配置面板 */}
                <div className="md:col-span-2">
                    {selectedProviderId && (
                        <>
                            <h3 className="text-lg font-medium mb-4">
                                {getPredefinedProvider(selectedProviderId)?.name || '供应商'} 配置
                            </h3>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="api-key">API密钥</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="api-key"
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                                placeholder="输入您的API密钥"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedProviderId === 'openai' &&
                                            '请在OpenAI开发者控制台获取API密钥：https://platform.openai.com/api-keys'}
                                        {selectedProviderId === 'anthropic' &&
                                            '请在Anthropic控制台获取API密钥：https://console.anthropic.com/'}
                                        {selectedProviderId === 'gemini' &&
                                            '请在Google AI Studio获取API密钥：https://makersuite.google.com/app/apikey'}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="base-url">基础URL（可选）</Label>
                                    <Input
                                        id="base-url"
                                        type="text"
                                        value={baseUrl}
                                        onChange={(e) => handleBaseUrlChange(e.target.value)}
                                        placeholder="例如: https://api.openai.com/v1"
                                        className={!isBaseUrlValid ? 'border-red-500' : ''}
                                    />
                                    {!isBaseUrlValid && (
                                        <p className="text-sm text-red-500">请输入有效的URL</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        如果为空，将使用供应商的默认基础URL
                                    </p>
                                </div>

                                {errorMessage && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {errorMessage}
                                        </p>
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            {successMessage}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex gap-2">
                                        {isProviderConfigured(selectedProviderId) && defaultProviderId !== selectedProviderId && (
                                            <Button
                                                variant="outline"
                                                onClick={handleSetDefault}
                                                className="gap-2"
                                                size="sm"
                                            >
                                                <Check className="h-4 w-4" />
                                                设为默认
                                            </Button>
                                        )}
                                        
                                        {apiKey.trim() && (
                                            <Button
                                                variant="default"
                                                onClick={handleTestConnection}
                                                className="gap-2"
                                                size="sm"
                                                disabled={isVerifying || !apiKey.trim()}
                                            >
                                                {isVerifying ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4" />
                                                )}
                                                测试模型API
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
} 