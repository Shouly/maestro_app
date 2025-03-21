# 模型设置模块设计文档

## 1. 概述

模型设置模块是Maestro AI聊天应用的核心功能之一，允许用户配置和管理不同的AI供应商、模型以及API密钥。本文档描述了模型设置模块的架构设计、数据流和组件结构。

## 2. 目录结构

```
maestro/
├── app/
│   └── settings/
│       ├── page.tsx              # 设置页面
├── components/
│   ├── ui/                       # 通用UI组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── chat/                     # 聊天相关组件
│   │   └── model-selector.tsx    # 模型选择器
│   └── settings/                 # 设置相关组件
│       └── provider-settings.tsx    # 供应商设置页面
├── lib/
│   ├── provider-store.ts         # 供应商状态管理
│   ├── provider-presets.ts       # 预设供应商配置
│   ├── services/                 # 服务模块
│   │   ├── index.ts              # 服务总体导出
│   │   ├── service-factory.ts    # 服务工厂
│   │   ├── models/               # 模型服务
│   │   │   ├── model-service.ts  # 模型服务接口
│   │   │   ├── openrouter-model-service.ts # OpenRouter实现
│   │   │   └── anthropic-model-service.ts  # Anthropic实现
│   │   └── chat/                 # 聊天服务
│   │       └── chat-service.ts   # 聊天服务实现
│   ├── chat-store.ts             # 聊天状态管理
│   └── utils.ts                  # 工具函数
```

## 3. 数据模型

### 3.1 供应商模型

```typescript
// 供应商数据模型
export interface Provider {
  id: string;         // 唯一标识符
  name: string;       // 供应商名称
  logoUrl: string;    // 供应商Logo
  defaultBaseUrl: string; // 默认API基础URL
  apiKeyRequired: boolean; // 是否需要API密钥
  models: Model[];    // 供应商支持的模型列表
  isDefault?: boolean; // 是否为默认供应商
};

// 用户配置的供应商
export interface ConfiguredProvider {
  providerId: string;   // 对应预设供应商ID
  apiKey: string;       // 用户的API密钥
  baseUrl?: string;     // 可选的自定义基础URL
  isActive: boolean;    // 是否激活此供应商
  customModels?: ModelPreset[]; // 从API获取的自定义模型列表
};

// 模型数据模型
export interface Model {
  id: string;         // 模型ID
  name: string;       // 模型名称
  providerId: string; // 所属供应商ID
  maxTokens: number;  // 最大Token数
};

// 模型预设
export interface ModelPreset {
  id: string;           // 模型ID
  name: string;         // 显示名称
  maxTokens: number;    // 最大Token数
}
```

### 3.2 预设供应商

- OpenAI - 提供GPT-3.5/GPT-4系列模型
- Anthropic - 提供Claude系列模型
- OpenRouter - 统一网关，可访问多种模型

每个预设供应商包含默认的API端点和支持的模型列表。

## 4. 模块化服务架构

### 4.1 服务接口

模型服务接口定义了所有模型服务的统一行为：

```typescript
export interface IModelService {
  // 获取供应商支持的模型列表
  fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]>;
  
  // 测试API连接是否有效
  testConnection(apiKey: string, baseUrl?: string): Promise<boolean>;
  
  // 获取供应商ID
  getProviderId(): string;
}
```

### 4.2 服务工厂

使用工厂模式创建和管理不同的服务实例：

```typescript
export interface IModelServiceFactory {
  // 获取特定供应商的模型服务实例
  getModelService(providerId: string): IModelService | undefined;
  
  // 注册模型服务
  registerModelService(service: IModelService): void;
}

// 工厂实现
export class ModelServiceFactory implements IModelServiceFactory {
  private static instance: ModelServiceFactory;
  private modelServices: Map<string, IModelService> = new Map();
  
  // 单例模式
  public static getInstance(): ModelServiceFactory {
    if (!ModelServiceFactory.instance) {
      ModelServiceFactory.instance = new ModelServiceFactory();
    }
    return ModelServiceFactory.instance;
  }
  
  // 注册新的服务实现
  public registerModelService(service: IModelService): void {
    this.modelServices.set(service.getProviderId(), service);
  }
  
  // 获取特定服务
  public getModelService(providerId: string): IModelService | undefined {
    return this.modelServices.get(providerId);
  }
}
```

### 4.3 OpenRouter模型服务实现

```typescript
export class OpenRouterModelService implements IModelService {
  private readonly providerId = 'openrouter';
  private readonly defaultBaseUrl = 'https://openrouter.ai/api/v1';
  
  // 获取供应商ID
  getProviderId(): string {
    return this.providerId;
  }
  
  // 获取模型列表
  async fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 解析结果并返回模型数据
    const data = await response.json();
    return data.data.map(model => ({
      id: model.id,
      name: model.name.includes(':') ? model.name.split(':')[1] : model.name,
      maxTokens: model.context_length || 4096
    }));
  }
  
  // 测试连接
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || this.defaultBaseUrl}/models`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## 5. 状态管理

使用Zustand进行状态管理，创建了供应商存储：

### 5.1 供应商存储 (ProviderStore)

```typescript
interface ProviderState {
  // 状态
  configuredProviders: ConfiguredProvider[];
  defaultProviderId: string | null;
  defaultModelId: string | null;
  
  // 操作
  addProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  updateProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  removeProvider: (providerId: string) => void;
  setDefaultProvider: (providerId: string | null) => void;
  setDefaultModel: (modelId: string | null) => void;
  
  // 查询
  getAvailableModels: () => { value: string; label: string; group: string }[];
  getProviderConfig: (providerId: string) => ConfiguredProvider | undefined;
  
  // API交互
  fetchProviderModels: (providerId: string) => Promise<void>;
  testProviderConnection: (providerId: string, apiKey: string, baseUrl?: string) => Promise<boolean>;
}
```

此存储中集成了模型服务工厂，动态调用相应服务的方法获取模型列表：

```typescript
// 从API获取并更新模型列表
fetchProviderModels: async (providerId) => {
  // 获取对应的模型服务
  const modelService = modelServiceFactory.getModelService(providerId);
  if (!modelService) return;
  
  const providerConfig = get().getProviderConfig(providerId);
  if (!providerConfig || !providerConfig.apiKey) return;
  
  // 调用服务获取模型列表
  const models = await modelService.fetchModels(
    providerConfig.apiKey, 
    providerConfig.baseUrl
  );
  
  // 更新状态
  if (models.length > 0) {
    set(state => ({
      configuredProviders: state.configuredProviders.map(provider => 
        provider.providerId === providerId
          ? { ...provider, customModels: models }
          : provider
      )
    }));
  }
}
```

## 6. 用户界面组件

### 6.1 供应商设置页面

`ProviderSettings` 组件是管理AI供应商配置的核心界面，实现了以下主要功能：

1. **供应商选择与展示**
   - 左侧显示预设供应商列表，包括名称和Logo
   - 支持供应商配置状态指示（已配置/未配置）
   - 显示默认供应商标记

2. **配置管理**
   - API密钥输入与自动保存
   - 可选的自定义基础URL配置
   - 输入验证和错误提示
   - 供应商特定的帮助信息

3. **自动保存机制**
   - 当用户修改API密钥或基础URL时自动保存配置
   - 提供简短的成功/失败反馈并自动清除
   - 防止无效配置的保存（空API密钥或无效URL）

4. **验证功能**
   - 通过"测试模型API"按钮验证API配置
   - 验证过程中显示加载指示器
   - 显示明确的验证结果反馈

5. **默认供应商设置**
   - 允许将已配置的供应商设为默认
   - 防止已设为默认的供应商重复设置

**组件状态管理：**

```typescript
// 核心状态
const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
const [apiKey, setApiKey] = useState<string>('');
const [baseUrl, setBaseUrl] = useState<string>('');
const [isBaseUrlValid, setIsBaseUrlValid] = useState<boolean>(true);
const [isVerifying, setIsVerifying] = useState<boolean>(false);
const [errorMessage, setErrorMessage] = useState<string>('');
const [successMessage, setSuccessMessage] = useState<string>('');
```

**自动保存实现：**

```typescript
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

        setRefreshCounter(prev => prev + 1);
    } catch (error) {
        setErrorMessage('保存失败');
    }
};
```

**验证实现：**

```typescript
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
```

**用户界面布局：**

组件采用双栏布局：
- 左侧栏（1/3宽度）：供应商列表，显示图标、名称和状态
- 右侧栏（2/3宽度）：配置面板，包含API密钥和基础URL输入、验证和状态信息
- 底部操作区：提供"设为默认"和"测试模型API"按钮

当用户选择一个供应商时，右侧面板显示相应的配置选项，并根据已保存的配置自动填充表单。输入值变更时会自动保存，提供即时反馈。

### 6.2 模型选择器

用于选择默认模型或当前对话的模型：

- 根据已配置的供应商显示可用模型
- 按供应商分组展示模型
- 自动处理默认值和变更事件

```typescript
export function ModelSelector({ 
  value, 
  onChange,
  disabled = false,
  title = "模型"
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  title?: string
}) {
  const { configuredProviders, getAvailableModels } = useProviderStore();
  const [options, setOptions] = useState<SelectOption[]>([]);
  
  // 获取所有可用模型
  useEffect(() => {
    const models = getAvailableModels();
    setOptions(models);
  }, [configuredProviders, getAvailableModels]);

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm">{title}:</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger className="flex-1 h-8">
          <SelectValue placeholder="选择模型" />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <SelectItem value="none" disabled>
              无可用模型
            </SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} {option.group && `(${option.group})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
```

## 7. 扩展指南

### 7.1 添加新的模型服务

1. 创建新的服务类，实现`IModelService`接口：

```typescript
export class NewProviderModelService implements IModelService {
  private readonly providerId = 'new-provider';
  
  getProviderId(): string {
    return this.providerId;
  }
  
  async fetchModels(apiKey: string, baseUrl?: string): Promise<ModelPreset[]> {
    // 实现获取模型列表的逻辑
  }
  
  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    // 实现测试连接的逻辑
  }
}
```

2. 在服务工厂中注册新服务：

```typescript
// 在ModelServiceFactory的构造函数中
private constructor() {
  // 注册现有服务
  this.registerModelService(new OpenRouterModelService());
  this.registerModelService(new AnthropicModelService());
  
  // 注册新服务
  this.registerModelService(new NewProviderModelService());
}
```

3. 在预设供应商列表中添加新供应商配置：

```typescript
// provider-presets.ts
export const PROVIDER_PRESETS: ProviderPreset[] = [
  // 现有供应商
  {
    id: "anthropic",
    name: "Anthropic",
    // ...其他配置
  },
  
  // 新供应商
  {
    id: "new-provider",
    name: "New Provider",
    baseUrl: "https://api.new-provider.com",
    logoUrl: "/logos/new-provider.svg",
    apiKeyRequired: true,
    models: [
      // 默认模型列表，可通过API动态更新
    ]
  }
];
```

## 8. 后续改进方向

1. **聊天服务完善**
   - 实现实际的API调用逻辑
   - 支持流式响应和取消请求

2. **多模态支持**
   - 支持图像输入
   - 处理模型的多模态能力

3. **API密钥管理**
   - 加密存储API密钥
   - 支持API使用配额和计费管理

4. **细粒度权限控制**
   - 模型特性和能力筛选
   - 基于权限的模型访问控制

## 9. 优化修改记录

### 9.1 简化模型数据结构

为了优化应用性能和简化模型设置，移除了以下非必要字段：

1. **移除模型描述字段**：
   - 简化了模型数据结构
   - 避免了不必要的数据传输和存储
   - 更加专注于模型的核心功能

2. **移除能力标签字段**：
   - 降低UI复杂度
   - 提高模型列表加载性能
   - 避免标签与实际模型功能不一致的问题

相关修改包括：
- 更新了所有服务实现(OpenRouter, Anthropic)，不再处理和返回这些字段
- 修改了提供商存储中的数据转换逻辑
- 简化了UI组件，专注于显示模型名称和必要信息

这些优化使得模型配置和选择过程更加简洁高效，提高了整体用户体验。 