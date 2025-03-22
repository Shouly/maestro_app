'use client';

import { cn } from '@/lib/utils';
import { PROVIDER_PRESETS } from '@/lib/provider-presets';
import { ServerCog } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as LobeIcons from '@lobehub/icons';

// 检查是否使用Lobe图标
const getUseLobeIcons = () => {
  if (typeof window === 'undefined') return true; // 服务器端渲染时默认为true
  
  const savedSetting = localStorage.getItem('useLobeIcons');
  return savedSetting === null || savedSetting === 'true';
};

// 获取Lobe图标组件
const getLobeiconComponent = (providerId: string) => {
  switch (providerId.toLowerCase()) {
    case 'anthropic':
      return LobeIcons.Anthropic;
    case 'openrouter':
      return LobeIcons.OpenRouter;
    case 'openai':
      return LobeIcons.OpenAI;
    case 'google':
      return LobeIcons.Google;
    case 'mistral':
      return LobeIcons.Mistral;
    case 'cohere':
      return LobeIcons.Cohere;
    case 'deepmind':
      return LobeIcons.DeepMind;
    case 'groq':
      return LobeIcons.Groq;
    default:
      return null;
  }
};

interface ProviderIconProps {
  providerId: string;
  className?: string;
  size?: number;
}

export function ProviderIcon({ providerId, className, size = 24 }: ProviderIconProps) {
  const [useLobeIcons, setUseLobeIcons] = useState(true);
  
  // 读取localStorage中的设置
  useEffect(() => {
    setUseLobeIcons(getUseLobeIcons());
    
    // 监听localStorage的变化
    const handleStorageChange = () => {
      setUseLobeIcons(getUseLobeIcons());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // 获取预设供应商信息
  const provider = PROVIDER_PRESETS.find(p => p.id === providerId);
  
  // 如果启用了Lobe图标，并且有匹配的图标，则使用
  if (useLobeIcons) {
    const IconComponent = getLobeiconComponent(providerId);
    if (IconComponent) {
      return <IconComponent size={size} className={className} />;
    }
  }
  
  // 如果没有匹配的图标或禁用了Lobe图标，则使用首字母或默认图标
  const name = provider?.name || providerId;
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div 
      className={cn('flex items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20', className)}
      style={{ width: size, height: size }}
    >
      {initial || <ServerCog size={size * 0.7} />}
    </div>
  );
} 