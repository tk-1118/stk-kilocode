#!/bin/bash

# 批量修复 webviewMessageHandler.ts 中的类型错误

echo "修复 webviewMessageHandler.ts 中的类型错误..."

file="src/core/webview/webviewMessageHandler.ts"

if [ -f "$file" ]; then
    # 备份原文件
    cp "$file" "$file.backup"
    
    # 修复 message.value 的类型问题
    # 对于需要 number | undefined 的情况
    sed -i '' 's/message\.value ?? \([0-9.]*\)/typeof message.value === '\''number'\'' ? message.value : \1/g' "$file"
    
    # 对于直接使用 message.value 的情况，添加类型检查
    sed -i '' 's/updateGlobalState("\([^"]*\)", message\.value)/updateGlobalState("\1", typeof message.value === '\''number'\'' ? message.value : undefined)/g' "$file"
    
    # 对于 Math.min/Math.max 中使用 message.value 的情况
    sed -i '' 's/Math\.\(min\|max\)(\([^,]*\), message\.value ?? \([^)]*\))/Math.\1(\2, typeof message.value === '\''number'\'' ? message.value : \3)/g' "$file"
    
    echo "已修复 $file"
    echo "原文件备份为 $file.backup"
else
    echo "文件不存在: $file"
fi

echo "修复完成！"
