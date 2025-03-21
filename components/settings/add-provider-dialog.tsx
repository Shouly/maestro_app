'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROVIDER_PRESETS } from '@/lib/provider-presets';
import { useProviderStore } from '@/lib/provider-store';
import { isValidUrl } from '@/lib/utils';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModelServiceFactory } from '@/lib/services/service-factory';

// 获取模型服务工厂
const modelServiceFactory = ModelServiceFactory.getInstance();

type AddProviderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProviderId?: string;
};

export function AddProviderDialog({ open, onOpenChange, editingProviderId }: AddProviderDialogProps) {
    const { addProvider, getProviderConfig, fetchProviderModels, testProviderConnection } = useProviderStore();

    // 状态
    const [selectedProviderId, setSelectedProviderId] = useState<string>('openai');
    const [apiKey, setApiKey] = useState<string>('');
    const [baseUrl, setBaseUrl] = useState<string>('');
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
    const [isBaseUrlValid, setIsBaseUrlValid] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 当对话框打开或正在编辑的提供商ID更改时重置表单
    useEffect(() => {
        if (open) {
            if (editingProviderId) {
                // 编辑现有提供商
                const provider = getProviderConfig(editingProviderId);
                if (provider) {
                    setSelectedProviderId(provider.providerId);
                    setApiKey(provider.apiKey);
                    setBaseUrl(provider.baseUrl || '');
                }
            } else {
                // 添加新提供商
                setSelectedProviderId('openai');
                setApiKey('');
                const preset = PROVIDER_PRESETS.find(p => p.id === 'openai');
                setBaseUrl(preset?.baseUrl || '');
            }
            setErrorMessage('');
            setSuccessMessage('');
            setIsBaseUrlValid(true);
        }
    }, [open, editingProviderId, getProviderConfig]);

    // 当选择的提供商更改时更新基础URL
    const handleProviderChange = (value: string) => {
        setSelectedProviderId(value);
        const preset = PROVIDER_PRESETS.find(p => p.id === value);
        setBaseUrl(preset?.baseUrl || '');
    };

    // 验证基础URL
    const handleBaseUrlChange = (url: string) => {
        setBaseUrl(url);
        setIsBaseUrlValid(url === '' || isValidUrl(url));
    };

    // 测试连接
    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            setErrorMessage('请输入API密钥');
            return;
        }

        if (baseUrl && !isBaseUrlValid) {
            setErrorMessage('请输入有效的基础URL');
            return;
        }

        setIsValidating(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // 使用服务测试连接
            const isSuccess = await testProviderConnection(
                selectedProviderId, 
                apiKey, 
                baseUrl || undefined
            );

            if (isSuccess) {
                setSuccessMessage('连接成功！API密钥有效。');
                
                // 尝试获取模型列表
                await handleFetchModels();
            } else {
                setErrorMessage('连接失败，请检查您的API密钥和基础URL。');
            }
        } catch (error) {
            setErrorMessage('连接失败，请检查您的API密钥和基础URL。');
        } finally {
            setIsValidating(false);
        }
    };
    
    // 获取模型列表
    const handleFetchModels = async () => {
        if (!apiKey.trim()) return;
        
        setIsFetchingModels(true);
        setErrorMessage('');
        
        try {
            // 创建临时提供商以获取模型
            addProvider(selectedProviderId, apiKey, baseUrl || undefined);
            await fetchProviderModels(selectedProviderId);
            setSuccessMessage(prevMessage => 
                prevMessage ? `${prevMessage} 已获取最新模型列表。` : '已获取最新模型列表。'
            );
        } catch (error) {
            console.error('获取模型列表失败', error);
            setErrorMessage('获取模型列表失败，但您仍然可以使用默认模型。');
        } finally {
            setIsFetchingModels(false);
        }
    };

    // 保存提供商
    const handleSave = () => {
        if (!apiKey.trim()) {
            setErrorMessage('请输入API密钥');
            return;
        }

        if (baseUrl && !isBaseUrlValid) {
            setErrorMessage('请输入有效的基础URL');
            return;
        }

        try {
            const providerId = editingProviderId || selectedProviderId;

            // 添加或更新提供商
            addProvider(providerId, apiKey, baseUrl || undefined);
            
            // 取消自动获取模型的逻辑，依赖用户手动获取
            // 只在用户明确请求时获取模型列表
            
            // 关闭对话框
            onOpenChange(false);
        } catch (error) {
            setErrorMessage('保存提供商时出错');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingProviderId ? '编辑AI供应商' : '添加AI供应商'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="provider-type">供应商类型</Label>
                        <Select
                            value={selectedProviderId}
                            onValueChange={handleProviderChange}
                            disabled={!!editingProviderId}
                        >
                            <SelectTrigger id="provider-type">
                                <SelectValue placeholder="选择AI供应商" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROVIDER_PRESETS.map((provider) => (
                                    <SelectItem key={provider.id} value={provider.id}>
                                        {provider.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="api-key">API密钥</Label>
                        <Input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="输入您的API密钥"
                        />
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
                </div>

                <DialogFooter className="flex gap-2">
                    {modelServiceFactory.supportsProvider(selectedProviderId) && (
                        <Button
                            variant="outline"
                            disabled={isValidating || isFetchingModels || !apiKey.trim()}
                            onClick={handleFetchModels}
                            className="mr-auto"
                        >
                            {isFetchingModels ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    获取模型中...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    获取模型列表
                                </span>
                            )}
                        </Button>
                    )}
                
                    <Button
                        variant="outline"
                        disabled={isValidating || isFetchingModels}
                        onClick={handleTestConnection}
                    >
                        {isValidating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                测试中...
                            </span>
                        ) : (
                            '测试连接'
                        )}
                    </Button>
                    <Button
                        disabled={isValidating || !apiKey.trim() || (baseUrl !== '' && !isBaseUrlValid)}
                        onClick={handleSave}
                    >
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 