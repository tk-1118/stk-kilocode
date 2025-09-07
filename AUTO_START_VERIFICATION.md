# 向量库自动启动验证指南

## 🎯 目标

验证当环境变量正确设置后，向量库是否会自动启动索引过程。

## 📋 自动启动的条件

根据代码分析，向量库会在以下条件**全部满足**时自动启动：

### 1. 功能启用 (`isFeatureEnabled`)

- `codebaseIndexEnabled` 为 `true`（默认值）

### 2. 功能已配置 (`isFeatureConfigured`)

根据不同的嵌入提供商，需要满足以下条件：

#### OpenAI 提供商（默认）

- ✅ **OpenAI API Key** 已设置
- ✅ **Qdrant URL** 已设置（通过环境变量或用户输入）

#### Ollama 提供商

- ✅ **Ollama Base URL** 已设置
- ✅ **Qdrant URL** 已设置

#### 其他提供商

- 各自的 API Key 和 Base URL
- Qdrant URL

### 3. 工作区可用

- VSCode 中打开了工作区文件夹

## 🔍 当前状态检查

### 检查点 1: 环境变量是否正确加载

```bash
# 在终端中检查环境变量
echo $KILOCODE_QDRANT_BASE_URL
echo $KILOCODE_QDRANT_API_KEY
```

### 检查点 2: VSCode 开发者工具检查

1. 打开 VSCode 开发者工具（`Cmd+Shift+I`）
2. 查看 Console 输出，寻找：
    ```
    [ConfigManager] URL 优先级决策:
    [ConfigManager] API Key 优先级决策:
    ```

### 检查点 3: 扩展状态检查

在开发者工具 Console 中运行：

```javascript
// 检查配置状态
console.log("Environment variables:", {
	QDRANT_URL: process.env.KILOCODE_QDRANT_BASE_URL,
	QDRANT_API_KEY: process.env.KILOCODE_QDRANT_API_KEY ? "***SET***" : "NOT_SET",
})
```

## 🚀 预期的自动启动流程

如果配置正确，应该看到以下流程：

### 1. 扩展激活时（`extension.ts`）

```
[CodeIndexManager] Initializing for workspace: /path/to/workspace
```

### 2. 配置加载（`config-manager.ts`）

```
[ConfigManager] Loading configuration...
[ConfigManager] URL 优先级决策:
  环境变量URL: http://127.0.0.1:6333
  → 使用环境变量: http://127.0.0.1:6333
```

### 3. 服务初始化（`manager.ts`）

```
[CodeIndexManager] Feature enabled: true
[CodeIndexManager] Feature configured: true
[CodeIndexManager] Starting indexing automatically...
```

### 4. 索引开始（`orchestrator.ts`）

```
[CodeIndexOrchestrator] Starting indexing process...
[QdrantVectorStore] Initializing collection...
[CodeIndexOrchestrator] Services ready. Starting workspace scan...
```

## ❌ 可能的问题

### 问题 1: OpenAI API Key 未设置

**症状**: 即使 Qdrant URL 正确，也不会自动启动
**解决**: 在 Kilocode 设置中添加 OpenAI API Key

### 问题 2: 环境变量未正确加载

**症状**: 配置显示空值
**解决**:

1. 确保从设置了环境变量的终端启动 VSCode
2. 重启 VSCode

### 问题 3: 工作区未打开

**症状**: 显示 "No workspace folder open"
**解决**: 打开一个文件夹作为工作区

## 🧪 测试步骤

### 步骤 1: 设置环境变量

```bash
export KILOCODE_QDRANT_BASE_URL="http://127.0.0.1:6333"
export KILOCODE_QDRANT_API_KEY="your-api-key-if-needed"
```

### 步骤 2: 从终端启动 VSCode

```bash
code /path/to/your/project
```

### 步骤 3: 检查 Kilocode 设置

1. 打开 Kilocode 界面
2. 点击设置图标
3. 查看 "Codebase Indexing" 部分
4. 确认：
    - ✅ "Enable codebase indexing" 已勾选
    - ✅ Qdrant URL 显示环境变量的值
    - ✅ 显示绿色提示 "Built in KILOCODE_QDRANT_BASEURL loaded"
    - ✅ OpenAI API Key 已设置

### 步骤 4: 观察自动启动

- 如果配置正确，应该在几秒内看到索引状态变为 "Indexing"
- 可以在状态栏或 Kilocode 界面中看到索引进度

## 🔧 手动启动（如果自动启动失败）

如果自动启动失败，可以手动启动：

1. 打开 Kilocode 界面
2. 点击设置图标
3. 在 "Codebase Indexing" 部分点击 "Start Indexing" 按钮

## 📊 成功指标

自动启动成功的标志：

- ✅ 环境变量正确显示在界面中
- ✅ 配置状态显示为已配置
- ✅ 索引自动开始，无需手动点击
- ✅ 可以看到文件扫描和索引进度
- ✅ 最终状态变为 "Indexed" 并显示索引的文件数量

---

**注意**: 如果使用的是 OpenAI 提供商（默认），必须设置 OpenAI API Key 才能自动启动。如果只想测试 Qdrant 连接，可以切换到 Ollama 提供商并设置相应的 Base URL。
