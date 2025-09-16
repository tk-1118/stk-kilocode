#!/bin/bash

# 批量修复 ModeConfig 对象中缺少的 roleName 字段

echo "开始批量修复 roleName 字段..."

# 需要修复的文件列表
files=(
    "src/core/config/__tests__/CustomModesManager.exportImportSlugChange.spec.ts"
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
        
        # 使用 sed 在 name 字段后添加 roleName 字段
        # 匹配模式：在包含 name: "..." 的行后添加 roleName 行
        sed -i.bak '/name: ".*",/a\
			roleName: "Test Role",' "$file"
        
        # 清理备份文件
        rm -f "$file.bak"
        
        echo "已修复: $file"
    else
        echo "文件不存在: $file"
    fi
done

echo "批量修复完成！"
echo "请运行类型检查验证修复结果：pnpm run check-types"
