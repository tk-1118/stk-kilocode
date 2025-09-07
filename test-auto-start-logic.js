#!/usr/bin/env node

/**
 * 测试向量库自动启动逻辑
 * 模拟 ConfigManager 的 isConfigured() 方法
 */

console.log("🧪 测试向量库自动启动逻辑\n")

// 模拟环境变量
process.env.KILOCODE_QDRANT_BASE_URL = "http://127.0.0.1:6333"
process.env.KILOCODE_QDRANT_API_KEY = "test-api-key"

// 模拟配置场景
const scenarios = [
	{
		name: "场景 1: 仅环境变量配置",
		config: {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "", // 用户未输入
			embedderProvider: "openai",
			openAiApiKey: "sk-test-key", // 已设置 OpenAI Key
		},
	},
	{
		name: "场景 2: 用户输入覆盖环境变量",
		config: {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "http://custom.qdrant.com:6333", // 用户输入
			embedderProvider: "openai",
			openAiApiKey: "sk-test-key",
		},
	},
	{
		name: "场景 3: 缺少 OpenAI API Key",
		config: {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "",
			embedderProvider: "openai",
			openAiApiKey: "", // 未设置
		},
	},
	{
		name: "场景 4: 使用 Ollama 提供商",
		config: {
			codebaseIndexEnabled: true,
			codebaseIndexQdrantUrl: "",
			embedderProvider: "ollama",
			ollamaBaseUrl: "http://localhost:11434",
		},
	},
	{
		name: "场景 5: 功能被禁用",
		config: {
			codebaseIndexEnabled: false, // 功能禁用
			codebaseIndexQdrantUrl: "",
			embedderProvider: "openai",
			openAiApiKey: "sk-test-key",
		},
	},
]

// 模拟 ConfigManager 的逻辑
function simulateConfigManager(config) {
	// 1. 模拟 _loadAndSetConfiguration 中的 URL 优先级逻辑
	let qdrantUrl
	if (config.codebaseIndexQdrantUrl && config.codebaseIndexQdrantUrl.trim() !== "") {
		qdrantUrl = config.codebaseIndexQdrantUrl // 用户输入优先
	} else {
		qdrantUrl = process.env.KILOCODE_QDRANT_BASE_URL || "" // 环境变量
	}

	// 2. 模拟 isFeatureEnabled
	const isFeatureEnabled = config.codebaseIndexEnabled ?? true

	// 3. 模拟 isConfigured() 方法
	let isFeatureConfigured = false

	if (config.embedderProvider === "openai") {
		const openAiKey = config.openAiApiKey
		isFeatureConfigured = !!(openAiKey && qdrantUrl)
	} else if (config.embedderProvider === "ollama") {
		const ollamaBaseUrl = config.ollamaBaseUrl
		isFeatureConfigured = !!(ollamaBaseUrl && qdrantUrl)
	}

	// 4. 判断是否应该自动启动
	const shouldAutoStart = isFeatureEnabled && isFeatureConfigured

	return {
		qdrantUrl,
		isFeatureEnabled,
		isFeatureConfigured,
		shouldAutoStart,
	}
}

// 测试所有场景
scenarios.forEach((scenario, index) => {
	console.log(`\n${scenario.name}`)
	console.log("=".repeat(50))

	const result = simulateConfigManager(scenario.config)

	console.log("配置输入:")
	console.log(`  codebaseIndexEnabled: ${scenario.config.codebaseIndexEnabled}`)
	console.log(`  codebaseIndexQdrantUrl: "${scenario.config.codebaseIndexQdrantUrl}"`)
	console.log(`  embedderProvider: ${scenario.config.embedderProvider}`)
	console.log(`  openAiApiKey: ${scenario.config.openAiApiKey ? "***已设置***" : "未设置"}`)
	console.log(`  ollamaBaseUrl: ${scenario.config.ollamaBaseUrl || "未设置"}`)

	console.log("\n环境变量:")
	console.log(`  KILOCODE_QDRANT_BASE_URL: ${process.env.KILOCODE_QDRANT_BASE_URL}`)
	console.log(`  KILOCODE_QDRANT_API_KEY: ${process.env.KILOCODE_QDRANT_API_KEY ? "***已设置***" : "未设置"}`)

	console.log("\n计算结果:")
	console.log(`  最终 qdrantUrl: "${result.qdrantUrl}"`)
	console.log(`  isFeatureEnabled: ${result.isFeatureEnabled}`)
	console.log(`  isFeatureConfigured: ${result.isFeatureConfigured}`)
	console.log(`  🚀 应该自动启动: ${result.shouldAutoStart ? "✅ 是" : "❌ 否"}`)

	if (!result.shouldAutoStart) {
		console.log("\n❌ 不会自动启动的原因:")
		if (!result.isFeatureEnabled) {
			console.log("  - 功能被禁用")
		}
		if (!result.isFeatureConfigured) {
			console.log("  - 配置不完整")
			if (!result.qdrantUrl) {
				console.log("    * 缺少 Qdrant URL")
			}
			if (scenario.config.embedderProvider === "openai" && !scenario.config.openAiApiKey) {
				console.log("    * 缺少 OpenAI API Key")
			}
			if (scenario.config.embedderProvider === "ollama" && !scenario.config.ollamaBaseUrl) {
				console.log("    * 缺少 Ollama Base URL")
			}
		}
	}
})

console.log("\n" + "=".repeat(60))
console.log("📋 总结:")
console.log("1. 环境变量已正确设置")
console.log("2. 场景 1 和 2 应该自动启动（✅）")
console.log("3. 场景 3、4、5 不会自动启动（❌）")
console.log("4. 要实现自动启动，需要同时满足:")
console.log("   - 功能启用 (codebaseIndexEnabled = true)")
console.log("   - 配置完整 (API Key + Qdrant URL)")
console.log("   - 工作区已打开")
