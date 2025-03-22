# 聊天供应商支持

Maestro应用支持多种AI供应商，允许用户根据自己的需求选择不同的模型和服务。本文档详细介绍了各供应商的特点、配置方式和使用建议。

## 已支持的供应商

目前Maestro支持以下AI供应商：

1. **Anthropic** - Claude系列大语言模型
2. **OpenRouter** - 多模型聚合服务，支持多种供应商模型

## Anthropic

### 概述

Anthropic是一家AI安全企业，提供Claude系列大型语言模型。Claude以其安全性、有用性和真实性而闻名，能够理解复杂指令并产生有思考性的回应。

### 支持的模型

- **Claude 3 Opus** - 最强大的Claude模型，适合复杂任务
- **Claude 3 Sonnet** - 平衡性能和速度的中端模型
- **Claude 3 Haiku** - 高速响应模型，适合简单对话

### 配置方式

1. 获取Anthropic API密钥：访问[Anthropic Console](https://console.anthropic.com/)
2. 在Maestro应用的设置中添加Anthropic供应商配置：
   - 供应商ID：`anthropic`
   - API密钥：`你的Anthropic API密钥`
   - 基础URL：通常为默认值`https://api.anthropic.com`

### 特点与优势

- 优秀的上下文理解能力
- 强大的文本生成能力
- 内置的安全措施
- 支持工具调用和流式响应
- 遵守伦理AI原则

### 使用建议

- Claude 3 Opus适合复杂推理、深度分析等高要求任务
- Claude 3 Sonnet适合日常使用，性能和速度平衡
- Claude 3 Haiku适合需要快速响应的简单对话

## OpenRouter

### 概述

OpenRouter是一个AI模型路由服务，提供统一API访问多种AI模型。通过OpenRouter，用户可以使用单一API密钥访问来自OpenAI、Anthropic、Cohere等多家供应商的模型。

### 支持的模型

OpenRouter支持众多模型，包括但不限于：

- **OpenAI系列**：GPT-4、GPT-4 Turbo、GPT-3.5 Turbo等
- **Anthropic系列**：Claude 3 Opus、Claude 3 Sonnet、Claude 3 Haiku等
- **Cohere系列**：Command、Command Light等
- **其他**：Mistral系列、Meta Llama等

### 配置方式

1. 获取OpenRouter API密钥：访问[OpenRouter](https://openrouter.ai/)创建账户
2. 在Maestro应用的设置中添加OpenRouter供应商配置：
   - 供应商ID：`openrouter`
   - API密钥：`你的OpenRouter API密钥`
   - 基础URL：通常为默认值`https://openrouter.ai/api/v1`

### 特点与优势

- 一个API密钥访问多种模型
- 统一的API格式
- 灵活的模型选择
- 可按需支付，无需为每个供应商单独付费
- 方便比较不同模型的性能

### 使用建议

- 使用OpenRouter快速测试不同模型的表现
- 根据任务类型选择合适的模型：
  - 复杂分析：GPT-4、Claude 3 Opus
  - 一般对话：GPT-3.5 Turbo、Claude 3 Sonnet
  - 快速响应：Claude 3 Haiku、Command Light

## 如何选择合适的供应商

1. **根据需求**：如果有特定模型需求，直接选择对应供应商；如需灵活尝试多种模型，推荐OpenRouter
2. **根据成本**：评估各供应商的定价模式，选择最经济的选项
3. **根据任务**：不同模型在不同任务上表现各异，可以根据具体任务选择合适的供应商和模型

## 添加自定义供应商

用户可以在设置中添加和配置供应商：

1. 进入应用设置页面
2. 选择"AI供应商"选项卡
3. 点击"添加供应商"
4. 选择供应商类型，输入API密钥和其他必要信息
5. 点击"测试连接"验证配置是否有效
6. 保存设置

## 切换使用的供应商

用户可以在对话设置中选择使用的供应商和模型：

1. 在对话界面点击设置图标
2. 在对话设置面板中选择供应商和模型
3. 设置将应用于当前对话 