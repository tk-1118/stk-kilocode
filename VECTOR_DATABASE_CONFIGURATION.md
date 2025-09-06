# Kilocode 向量数据库动态配置功能说明

## 📋 功能概述

本功能实现了向量数据库（Qdrant）配置的动态管理，支持通过环境变量和用户界面进行灵活配置，提供智能的配置优先级处理。

## 🎯 主要特性

### 1. 智能配置优先级

- **用户界面输入** (最高优先级)
- **环境变量** (中等优先级)
- **默认值** (最低优先级)

### 2. 支持的环境变量

- `KILOCODE_QDRANT_BASE_URL`: Qdrant 服务器URL
- `KILOCODE_QDRANT_API_KEY`: Qdrant API密钥

### 3. 用户体验优化

- 环境变量状态提示
- 配置来源透明显示
- 用户可随时覆盖环境变量

## 🔧 技术实现

### 核心文件变更

#### 1. 类型定义 (`packages/types/src/codebase-index.ts`)

```typescript
// 新增环境变量状态字段
_envStatus: z.object({
	hasQdrantApiKey: z.boolean(),
	qdrantUrlFromEnv: z.boolean(),
}).optional()
```

#### 2. 配置管理器 (`src/services/code-index/config-manager.ts`)

```typescript
// 智能优先级处理逻辑
if (codebaseIndexQdrantUrl && codebaseIndexQdrantUrl.trim() !== "") {
	// 用户输入优先
	this.qdrantUrl = codebaseIndexQdrantUrl
} else {
	// 环境变量或默认值
	this.qdrantUrl = process.env.KILOCODE_QDRANT_BASE_URL || ""
}
```

#### 3. 向量存储客户端 (`src/services/code-index/vector-store/qdrant-client.ts`)

```typescript
// 支持环境变量的构造函数
constructor(workspacePath: string, url?: string, vectorSize?: number, apiKey?: string) {
    // ConfigManager已经处理了环境变量的优先级
    if (!url || url.trim() === "") {
        throw new Error("Qdrant URL is required...")
    }
}
```

#### 4. 前端界面 (`webview-ui/src/components/chat/CodeIndexPopover.tsx`)

```typescript
// 环境变量状态显示
{envStatus.qdrantUrlFromEnv && (
    <p className="text-xs text-vscode-descriptionForeground">
        <span className="text-green-500">✓</span>
        Built in KILOCODE_QDRANT_BASEURL loaded
    </p>
)}
```

## 💡 使用场景

### 场景1: 纯环境变量配置

```bash
export KILOCODE_QDRANT_BASE_URL="http://127.0.0.1:6333"
export KILOCODE_QDRANT_API_KEY="your-api-key"
```

- 界面自动显示环境变量值
- 显示绿色提示："Built in KILOCODE_QDRANT_BASEURL loaded"
- 用户可在输入框中覆盖

### 场景2: 用户覆盖环境变量

```bash
# 环境变量
export KILOCODE_QDRANT_BASE_URL="http://127.0.0.1:6333"
# 用户在界面输入不同URL
```

- 最终使用用户输入的值
- 不显示环境变量提示

### 场景3: 混合配置

```bash
# 只设置URL环境变量
export KILOCODE_QDRANT_BASE_URL="http://127.0.0.1:6333"
# API Key通过界面输入
```

- URL使用环境变量，显示提示
- API Key使用用户输入

## 🚀 快速设置

### 1. 设置环境变量

```bash
# macOS/Linux
export KILOCODE_QDRANT_BASE_URL="http://your-qdrant-server:6333"
export KILOCODE_QDRANT_API_KEY="your-api-key"

# 添加到shell配置文件
echo 'export KILOCODE_QDRANT_BASE_URL="http://your-server:6333"' >> ~/.zshrc
source ~/.zshrc
```

### 2. Windows系统

1. 打开"系统属性" → "高级" → "环境变量"
2. 添加用户变量或系统变量
3. 重启VSCode

### 3. 验证设置

```bash
# 检查环境变量
echo $KILOCODE_QDRANT_BASE_URL

# 在VSCode开发者工具中查看日志
# Help → Toggle Developer Tools → Console
# 查找 "[ConfigManager] 优先级决策" 日志
```

## 🔍 调试与故障排除

### 常见问题

#### 1. 环境变量未生效

- 确保重启了VSCode
- 检查环境变量设置：`echo $KILOCODE_QDRANT_BASE_URL`
- 从设置了环境变量的终端启动VSCode

#### 2. 界面显示默认值而非环境变量

- 检查VSCode开发者工具中的调试日志
- 确认环境变量在VSCode进程中可用
- 重新加载扩展

#### 3. 配置保存后未生效

- 检查配置优先级逻辑
- 查看后端日志确认配置加载
- 验证向量存储连接

### 调试日志

系统会输出详细的调试日志：

```
[ConfigManager] URL 优先级决策:
  用户输入URL: (用户输入的值)
  环境变量URL: (环境变量值)
  → 使用用户输入: (最终使用的值)
```

## ⚡ 优势

1. **零配置启动**: 设置环境变量后，所有项目自动工作
2. **灵活覆盖**: 特殊项目可使用不同配置
3. **清晰透明**: 用户始终知道配置来源
4. **向后兼容**: 不影响现有用户使用习惯
5. **安全性**: 敏感信息通过环境变量管理

## 🔒 安全注意事项

- 不要在代码仓库中提交真实API密钥
- 使用`.env`文件时确保添加到`.gitignore`
- 生产环境使用安全的密钥管理方案
- 环境变量中的敏感信息在界面中显示为`***已设置***`

## 📁 相关文件

### 后端文件

- `packages/types/src/codebase-index.ts` - 类型定义
- `src/services/code-index/config-manager.ts` - 配置管理
- `src/services/code-index/manager.ts` - 主管理器
- `src/services/code-index/service-factory.ts` - 服务工厂
- `src/services/code-index/vector-store/qdrant-client.ts` - 向量存储客户端

### 前端文件

- `webview-ui/src/components/chat/CodeIndexPopover.tsx` - 配置界面
- `webview-ui/src/context/ExtensionStateContext.tsx` - 状态管理
- `src/core/webview/ClineProvider.ts` - 状态提供者

### 配置文件

- `src/activate/registerCommands.ts` - 命令注册

---

_此文档涵盖了向量数据库动态配置功能的完整实现和使用说明。如有问题，请查看调试日志或联系开发团队。_
