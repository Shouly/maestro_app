import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from './config';
import { ModelPreset, PROVIDER_PRESETS, ProviderPreset } from './provider-presets';
import { ModelServiceFactory } from './services/service-factory';

// 预定义的供应商
export interface Provider {
    id: string;           // 唯一标识符
    name: string;         // 显示名称
    logoUrl: string;      // 供应商Logo
    defaultBaseUrl: string; // 默认API基础URL
    apiKeyRequired: boolean; // 是否需要API密钥
    models: Model[];      // 供应商支持的模型列表
    isDefault?: boolean;
}

// 用户配置的供应商
export interface ConfiguredProvider {
    providerId: string;   // 对应预设供应商ID
    apiKey: string;       // 用户的API密钥
    baseUrl?: string;     // 可选的自定义基础URL
    isActive: boolean;    // 是否激活此供应商
    customModels?: ModelPreset[]; // 从API获取的自定义模型列表
    defaultModelId?: string; // 该供应商的默认模型ID
}

// 模型定义
export interface Model {
    id: string;           // 模型ID
    name: string;         // 显示名称
    providerId: string;   // 所属供应商ID
    maxTokens: number;    // 最大Token数
}

// 供应商设置状态
interface ProviderState {
    // 已配置的供应商
    configuredProviders: ConfiguredProvider[];

    // 默认使用的供应商和模型
    defaultProviderId: string | null;
    defaultModelId: string | null;

    // 添加新供应商
    addProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;

    // 更新现有供应商配置
    updateProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;

    // 切换供应商激活状态
    toggleProvider: (providerId: string, active: boolean) => void;

    // 设置默认供应商
    setDefaultProvider: (providerId: string | null) => void;

    // 设置默认模型
    setDefaultModel: (modelId: string | null) => void;

    // 获取所有可用模型列表
    getAvailableModels: () => { value: string; label: string; group: string }[];

    // 获取特定供应商配置
    getProviderConfig: (providerId: string) => ConfiguredProvider | undefined;

    // 获取预设供应商信息
    getPredefinedProvider: (providerId: string) => ProviderPreset | undefined;

    // 从API获取并更新模型列表
    fetchProviderModels: (providerId: string) => Promise<void>;

    // 测试供应商连接
    testProviderConnection: (providerId: string, apiKey: string, baseUrl?: string) => Promise<boolean>;

    // 设置供应商的默认模型
    setProviderDefaultModel: (providerId: string, modelId: string) => void;

    // 获取供应商的默认模型
    getProviderDefaultModel: (providerId: string) => string | undefined;
}

// 获取模型服务工厂实例
const modelServiceFactory = ModelServiceFactory.getInstance();

// 生成供应商状态存储
export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({
            configuredProviders: [],
            defaultProviderId: null,
            defaultModelId: null,

            // 添加新供应商
            addProvider: (providerId, apiKey, baseUrl) => {
                const provider = PROVIDER_PRESETS.find(p => p.id === providerId);

                if (!provider) return;

                // 检查是否已存在相同ID的供应商
                const exists = get().configuredProviders.some(
                    p => p.providerId === providerId
                );

                if (exists) {
                    // 如果已存在则更新
                    get().updateProvider(providerId, apiKey, baseUrl);
                    return;
                }

                const newProvider: ConfiguredProvider = {
                    providerId,
                    apiKey,
                    baseUrl: baseUrl || provider.baseUrl,
                    isActive: true
                };

                set(state => ({
                    configuredProviders: [...state.configuredProviders, newProvider],
                    // 只设置默认提供商ID，不设置默认模型ID
                    defaultProviderId: state.defaultProviderId === null ? providerId : state.defaultProviderId
                    // 移除自动设置默认模型的逻辑
                }));

                // 移除自动获取模型列表的代码
                // 用户将通过UI手动获取模型列表
            },

            // 更新供应商
            updateProvider: (providerId, apiKey, baseUrl) => {
                set(state => ({
                    configuredProviders: state.configuredProviders.map(provider =>
                        provider.providerId === providerId
                            ? { ...provider, apiKey, baseUrl: baseUrl || provider.baseUrl }
                            : provider
                    )
                }));

                // 移除自动获取模型列表的代码
                // 用户将通过UI手动获取模型列表
            },

            // 切换供应商激活状态
            toggleProvider: (providerId, active) => {
                set(state => ({
                    configuredProviders: state.configuredProviders.map(provider =>
                        provider.providerId === providerId
                            ? { ...provider, isActive: active }
                            : provider
                    ),
                    // 如果禁用当前默认供应商，则重置默认值
                    defaultProviderId: state.defaultProviderId === providerId && !active
                        ? state.configuredProviders.find(p => p.isActive && p.providerId !== providerId)?.providerId || null
                        : state.defaultProviderId
                }));
            },

            // 设置默认供应商
            setDefaultProvider: (providerId) => {
                set({ defaultProviderId: providerId });

                // 同步更新chat-store中的默认设置
                try {
                    const chatStore = require('./chat-store').useChatStore.getState();
                    if (chatStore && chatStore.updateDefaultSettings) {
                        // 先获取当前的默认设置
                        const currentDefaults = chatStore.getDefaultSettings() || {};
                        
                        // 更新供应商ID，保留其他设置
                        chatStore.updateDefaultSettings({
                            ...currentDefaults,
                            providerId
                        });
                        
                        console.log('已同步更新chat-store默认供应商设置:', providerId);
                    }
                } catch (error) {
                    console.error('更新chat-store默认设置失败:', error);
                }
            },

            // 设置默认模型
            setDefaultModel: (modelId) => {
                // 检查modelId是否包含冒号，如果不包含可能需要添加providerId前缀
                let fullModelId = modelId;
                const providerId = get().defaultProviderId;
                
                if (providerId && modelId && !modelId.includes(':')) {
                    // 如果modelId不包含冒号，且有defaultProviderId，则添加providerId前缀
                    fullModelId = `${providerId}:${modelId}`;
                    console.log(`ModelId不包含冒号，添加providerId前缀: ${modelId} -> ${fullModelId}`);
                }
                
                // 设置默认模型ID
                set({ defaultModelId: modelId });
                console.log('已设置默认模型ID:', modelId);

                // 同步更新chat-store中的默认设置
                try {
                    const chatStore = require('./chat-store').useChatStore.getState();
                    
                    if (chatStore && chatStore.updateDefaultSettings && providerId) {
                        // 先获取当前的默认设置
                        const currentDefaults = chatStore.getDefaultSettings() || {};
                        
                        // 更新模型ID，保留其他设置
                        chatStore.updateDefaultSettings({
                            ...currentDefaults,
                            providerId,
                            modelId
                        });
                        
                        console.log('已同步更新chat-store默认模型设置:', providerId, modelId);
                    }
                } catch (error) {
                    console.error('更新chat-store默认设置失败:', error);
                }
            },

            // 获取所有可用模型
            getAvailableModels: () => {
                const { configuredProviders } = get();

                return configuredProviders
                    .filter(cp => cp.isActive)
                    .flatMap(cp => {
                        const provider = PROVIDER_PRESETS.find(p => p.id === cp.providerId);
                        if (!provider) return [];

                        // 如果有自定义模型列表，优先使用
                        const modelsList = cp.customModels || provider.models;

                        return modelsList.map(model => ({
                            value: `${cp.providerId}:${model.id}`,
                            label: model.name,
                            group: provider.name
                        }));
                    });
            },

            // 获取特定供应商配置
            getProviderConfig: (providerId) => {
                return get().configuredProviders.find(p => p.providerId === providerId);
            },

            // 获取预设供应商信息
            getPredefinedProvider: (providerId) => {
                return PROVIDER_PRESETS.find(p => p.id === providerId);
            },

            // 从API获取并更新模型列表
            fetchProviderModels: async (providerId) => {
                // 获取对应的模型服务
                const modelService = modelServiceFactory.getModelService(providerId);
                if (!modelService) return;

                const providerConfig = get().getProviderConfig(providerId);
                if (!providerConfig || !providerConfig.apiKey) return;

                try {
                    // 获取模型列表
                    const models = await modelService.fetchModels(
                        providerConfig.apiKey,
                        providerConfig.baseUrl
                    );

                    if (models.length > 0) {
                        // 更新供应商的模型列表
                        set(state => ({
                            configuredProviders: state.configuredProviders.map(provider =>
                                provider.providerId === providerId
                                    ? { ...provider, customModels: models }
                                    : provider
                            )
                        }));
                    }
                } catch (error) {
                    console.error('获取模型列表失败:', error);
                }
            },

            // 测试供应商连接
            testProviderConnection: async (providerId, apiKey, baseUrl) => {
                // 获取对应的模型服务
                const modelService = modelServiceFactory.getModelService(providerId);
                if (!modelService) {
                    // 如果没有对应的模型服务，返回模拟成功
                    // 实际应用中可能需要更复杂的处理
                    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
                }

                // 使用模型服务测试连接
                return await modelService.testConnection(apiKey, baseUrl);
            },

            // 设置供应商的默认模型
            setProviderDefaultModel: (providerId, modelId) => {
                set(state => ({
                    configuredProviders: state.configuredProviders.map(provider =>
                        provider.providerId === providerId
                            ? { ...provider, defaultModelId: modelId }
                            : provider
                    )
                }));
            },
            
            // 获取供应商的默认模型
            getProviderDefaultModel: (providerId) => {
                const provider = get().getProviderConfig(providerId);
                return provider?.defaultModelId;
            }
        }),
        {
            name: STORAGE_KEYS.PROVIDERS,
            // 设置同步选项
            skipHydration: false
        }
    )
); 