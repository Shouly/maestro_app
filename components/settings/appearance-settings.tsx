'use client';

import { useTheme } from '@/components/theme/theme-provider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Layout, Monitor, Moon, Paintbrush, Sun, SquareCode } from 'lucide-react';
import { useState, useEffect } from 'react';

// 使用localStorage保存图标设置
const useIconSettings = () => {
    // 默认启用
    const [useLobeIcons, setUseLobeIcons] = useState(true);
    
    useEffect(() => {
        // 从localStorage读取设置
        const savedSetting = localStorage.getItem('useLobeIcons');
        if (savedSetting !== null) {
            setUseLobeIcons(savedSetting === 'true');
        }
    }, []);
    
    const updateUseLobeIcons = (value: boolean) => {
        setUseLobeIcons(value);
        localStorage.setItem('useLobeIcons', value.toString());
        // 可以添加重新加载页面的逻辑，以应用新设置
    };
    
    return { useLobeIcons, updateUseLobeIcons };
};

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    const [layoutStyle, setLayoutStyle] = useState('默认');
    const [accentColor, setAccentColor] = useState('默认');
    const [borderRadius, setBorderRadius] = useState('标准');
    const [enableAnimation, setEnableAnimation] = useState(true);
    const { useLobeIcons, updateUseLobeIcons } = useIconSettings();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Paintbrush className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">外观设置</h2>
                </div>
            </div>

            <p className="text-muted-foreground -mt-1">
                自定义应用主题、颜色和界面布局
            </p>

            <Card className="p-6">
                <div className="space-y-6">
                    {/* 主题模式设置 */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">主题模式</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <Label
                                        htmlFor="light-theme"
                                        className="flex flex-col items-center border rounded-lg p-4 cursor-pointer w-full hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="rounded-full bg-background border p-2 mb-3">
                                            <Sun className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <input
                                            type="radio"
                                            id="light-theme"
                                            className="sr-only"
                                            name="theme"
                                            value="light"
                                            checked={theme === 'light'}
                                            onChange={() => setTheme('light')}
                                        />
                                        <span className="font-medium">浅色模式</span>
                                    </Label>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <Label
                                        htmlFor="dark-theme"
                                        className="flex flex-col items-center border rounded-lg p-4 cursor-pointer w-full hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="rounded-full bg-background border p-2 mb-3">
                                            <Moon className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <input
                                            type="radio"
                                            id="dark-theme"
                                            className="sr-only"
                                            name="theme"
                                            value="dark"
                                            checked={theme === 'dark'}
                                            onChange={() => setTheme('dark')}
                                        />
                                        <span className="font-medium">深色模式</span>
                                    </Label>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <Label
                                        htmlFor="system-theme"
                                        className="flex flex-col items-center border rounded-lg p-4 cursor-pointer w-full hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="rounded-full bg-background border p-2 mb-3">
                                            <Monitor className="h-5 w-5 text-green-500" />
                                        </div>
                                        <input
                                            type="radio"
                                            id="system-theme"
                                            className="sr-only"
                                            name="theme"
                                            value="system"
                                            checked={theme === 'system'}
                                            onChange={() => setTheme('system')}
                                        />
                                        <span className="font-medium">系统模式</span>
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* 布局设置 */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">布局设置</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base flex items-center">
                                        <Layout className="h-4 w-4 mr-2" />
                                        界面布局
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        选择应用程序的界面布局样式
                                    </p>
                                </div>
                                <Select
                                    value={layoutStyle}
                                    onValueChange={setLayoutStyle}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="选择布局" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="默认">默认</SelectItem>
                                        <SelectItem value="紧凑">紧凑</SelectItem>
                                        <SelectItem value="宽松">宽松</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">动画过渡效果</Label>
                                    <p className="text-sm text-muted-foreground">
                                        启用界面动画和过渡效果
                                    </p>
                                </div>
                                <Switch
                                    checked={enableAnimation}
                                    onCheckedChange={setEnableAnimation}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base flex items-center">
                                        <SquareCode className="h-4 w-4 mr-2" />
                                        使用Lobe图标
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        为AI供应商使用Lobe高质量图标
                                    </p>
                                </div>
                                <Switch
                                    checked={useLobeIcons}
                                    onCheckedChange={updateUseLobeIcons}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* 颜色与样式 */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">颜色与样式</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">强调色</Label>
                                    <p className="text-sm text-muted-foreground">
                                        应用程序的主要强调色
                                    </p>
                                </div>
                                <Select
                                    value={accentColor}
                                    onValueChange={setAccentColor}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="选择强调色" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="默认">默认</SelectItem>
                                        <SelectItem value="蓝色">蓝色</SelectItem>
                                        <SelectItem value="紫色">紫色</SelectItem>
                                        <SelectItem value="绿色">绿色</SelectItem>
                                        <SelectItem value="橙色">橙色</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">圆角样式</Label>
                                    <p className="text-sm text-muted-foreground">
                                        界面元素的圆角程度
                                    </p>
                                </div>
                                <Select
                                    value={borderRadius}
                                    onValueChange={setBorderRadius}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="选择圆角样式" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="无">无</SelectItem>
                                        <SelectItem value="轻微">轻微</SelectItem>
                                        <SelectItem value="标准">标准</SelectItem>
                                        <SelectItem value="完全">完全</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
} 