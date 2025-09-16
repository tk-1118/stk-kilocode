#!/bin/bash

# Script to add missing roleName fields to ModeConfig objects

echo "修复 ModeConfig 对象中缺少的 roleName 字段..."

# 定义需要修复的文件列表
files=(
    "src/core/config/__tests__/CustomModesManager.exportImportSlugChange.spec.ts"
    "src/core/config/__tests__/CustomModesManager.spec.ts"
    "src/core/config/__tests__/CustomModesSettings.spec.ts"
    "src/core/config/__tests__/ModeConfig.spec.ts"
    "src/core/prompts/__tests__/system-prompt.spec.ts"
    "src/core/tools/__tests__/newTaskTool.spec.ts"
    "src/core/tools/__tests__/validateToolUse.spec.ts"
    "src/core/webview/__tests__/ClineProvider.spec.ts"
    "src/core/webview/__tests__/webviewMessageHandler.spec.ts"
    "src/core/webview/ClineProvider.ts"
    "src/core/webview/webviewMessageHandler.ts"
)

# 对每个文件进行修复
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "修复文件: $file"
        
        # 添加 roleName 字段，使用 name 或 roleDefinition 的值
        # 这个sed命令会在 name 字段后面添加 roleName 字段
        sed -i.bak -E 's/(\s+name: "[^"]+",)/\1\n\t\t\troleName: "Test Role",/g' "$file"
        
        # 对于一些特殊情况，直接替换常见的模式
        sed -i.bak -E 's/(name: "Updated Mode 1",)/\1\n\t\t\troleName: "Updated Role 1",/g' "$file"
        sed -i.bak -E 's/(name: "Mode 1",)/\1\n\t\t\troleName: "Mode 1 Role",/g' "$file"
        sed -i.bak -E 's/(name: "Mode 2",)/\1\n\t\t\troleName: "Mode 2 Role",/g' "$file"
        sed -i.bak -E 's/(name: "Test Mode",)/\1\n\t\t\troleName: "Test Role",/g' "$file"
        sed -i.bak -E 's/(name: "Project Mode",)/\1\n\t\t\troleName: "Project Role",/g' "$file"
        
        # 清理备份文件
        rm -f "$file.bak"
    else
        echo "文件不存在: $file"
    fi
done

echo "修复完成！"
