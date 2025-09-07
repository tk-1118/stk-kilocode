import { GhostServiceSettings } from "@roo-code/types"
import { ApiHandler, buildApiHandler } from "../../api"
import { ContextProxy } from "../../core/config/ContextProxy"
import { ProviderSettingsManager } from "../../core/config/ProviderSettingsManager"
import { OpenRouterHandler } from "../../api/providers"
import { ApiStreamChunk } from "../../api/transform/stream"

const KILOCODE_DEFAULT_MODEL = "mistralai/codestral-2508"
const MISTRAL_DEFAULT_MODEL = "codestral-latest"

// 暂时注释掉 kilocode，添加 openai 作为默认支持的提供商
const SUPPORTED_DEFAULT_PROVIDERS = ["mistral", "openai", "openrouter"] // "kilocode" 暂时注释

export class GhostModel {
	private apiHandler: ApiHandler | null = null
	private apiConfigId: string | null = null
	public loaded = false

	constructor(apiHandler: ApiHandler | null = null) {
		if (apiHandler) {
			this.apiHandler = apiHandler
			this.loaded = true
		}
	}

	public getApiConfigId() {
		return this.apiConfigId
	}

	public async reload(settings: GhostServiceSettings, providerSettingsManager: ProviderSettingsManager) {
		let enableCustomProvider = settings?.enableCustomProvider || false

		if (!enableCustomProvider) {
			const profiles = await providerSettingsManager.listConfig()
			const validProfiles = profiles
				.filter((x) => x.apiProvider && SUPPORTED_DEFAULT_PROVIDERS.includes(x.apiProvider))
				.sort((a, b) => {
					if (!a.apiProvider) {
						return 1 // Place undefined providers at the end
					}
					if (!b.apiProvider) {
						return -1 // Place undefined providers at the beginning
					}
					return (
						SUPPORTED_DEFAULT_PROVIDERS.indexOf(a.apiProvider) -
						SUPPORTED_DEFAULT_PROVIDERS.indexOf(b.apiProvider)
					)
				})

			const selectedProfile = validProfiles[0] || null
			if (selectedProfile) {
				this.apiConfigId = selectedProfile.id
				const profile = await providerSettingsManager.getProfile({
					id: this.apiConfigId,
				})
				const profileProvider = profile.apiProvider
				let modelDefinition = {}
				// 暂时注释掉 kilocode 提供商的处理
				// if (profileProvider === "kilocode") {
				// 	modelDefinition = {
				// 		kilocodeModel: KILOCODE_DEFAULT_MODEL,
				// 	}
				// } else
				if (profileProvider === "openrouter") {
					modelDefinition = {
						openRouterModelId: KILOCODE_DEFAULT_MODEL,
					}
				} else if (profileProvider === "mistral") {
					modelDefinition = {
						apiModelId: MISTRAL_DEFAULT_MODEL,
					}
				} else if (profileProvider === "openai") {
					// 为 OpenAI Compatible 提供商设置默认模型
					modelDefinition = {
						apiModelId: "gpt-4o-mini", // 设置一个常用的默认模型
					}
				}
				this.apiHandler = buildApiHandler({
					...profile,
					...modelDefinition,
				})
			} else {
				enableCustomProvider = true
			}
		}

		if (enableCustomProvider) {
			this.apiConfigId = settings?.apiConfigId || null
			const defaultApiConfigId = ContextProxy.instance?.getValues?.()?.currentApiConfigName || ""
			const profileQuery = this.apiConfigId
				? {
						id: this.apiConfigId,
					}
				: {
						name: defaultApiConfigId,
					}

			const profile = await providerSettingsManager.getProfile(profileQuery)
			this.apiHandler = buildApiHandler(profile)
		}

		if (this.apiHandler instanceof OpenRouterHandler) {
			await this.apiHandler.fetchModel()
		}

		this.loaded = true
	}

	/**
	 * Generate response with streaming callback support
	 */
	public async generateResponse(
		systemPrompt: string,
		userPrompt: string,
		onChunk: (chunk: ApiStreamChunk) => void,
	): Promise<{
		cost: number
		inputTokens: number
		outputTokens: number
		cacheWriteTokens: number
		cacheReadTokens: number
	}> {
		if (!this.apiHandler) {
			console.error("API handler is not initialized")
			throw new Error("API handler is not initialized. Please check your configuration.")
		}

		console.log("USED MODEL", this.apiHandler.getModel())

		const stream = this.apiHandler.createMessage(systemPrompt, [
			{ role: "user", content: [{ type: "text", text: userPrompt }] },
		])

		let cost = 0
		let inputTokens = 0
		let outputTokens = 0
		let cacheReadTokens = 0
		let cacheWriteTokens = 0

		try {
			for await (const chunk of stream) {
				// Call the callback with each chunk
				onChunk(chunk)

				// Track usage information
				if (chunk.type === "usage") {
					cost = chunk.totalCost ?? 0
					cacheReadTokens = chunk.cacheReadTokens ?? 0
					cacheWriteTokens = chunk.cacheWriteTokens ?? 0
					inputTokens = chunk.inputTokens ?? 0
					outputTokens = chunk.outputTokens ?? 0
				}
			}
		} catch (error) {
			console.error("Error streaming completion:", error)
			throw error
		}

		return {
			cost,
			inputTokens,
			outputTokens,
			cacheWriteTokens,
			cacheReadTokens,
		}
	}

	public getModelName(): string | null {
		if (!this.apiHandler) {
			return null
		}
		// Extract model name from API handler
		return this.apiHandler.getModel().id ?? "unknown"
	}

	public hasValidCredentials(): boolean {
		return this.apiHandler !== null && this.loaded
	}
}
