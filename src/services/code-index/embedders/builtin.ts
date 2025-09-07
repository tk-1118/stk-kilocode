import { IEmbedder, EmbeddingResponse } from "../interfaces/embedder"

/**
 * 内置嵌入器实现
 * 提供简单的基于词汇的向量化，无需外部API依赖
 * 适用于离线环境和快速原型开发
 */
export class BuiltinEmbedder implements IEmbedder {
	private readonly modelId: string
	private readonly dimension: number

	constructor(modelId: string = "builtin-embedding-v1") {
		this.modelId = modelId
		this.dimension = 384 // 固定维度，与 embeddingModels.ts 中定义一致
	}

	/**
	 * 生成文本的嵌入向量
	 * 使用简单的基于词汇的方法，将文本转换为固定维度的向量
	 */
	async createEmbeddings(texts: string[]): Promise<EmbeddingResponse> {
		const embeddings = texts.map((text) => this.textToVector(text))

		return {
			embeddings,
			usage: {
				promptTokens: texts.reduce((sum, text) => sum + this.countTokens(text), 0),
				totalTokens: texts.reduce((sum, text) => sum + this.countTokens(text), 0),
			},
		}
	}

	/**
	 * 将文本转换为向量
	 * 使用简单的哈希和归一化方法
	 */
	private textToVector(text: string): number[] {
		// 预处理文本：转小写，移除特殊字符
		const cleanText = text.toLowerCase().replace(/[^\w\s]/g, " ")
		const words = cleanText.split(/\s+/).filter((word) => word.length > 0)

		// 创建固定维度的向量
		const vector = new Array(this.dimension).fill(0)

		// 基于词汇的简单向量化
		words.forEach((word, index) => {
			// 使用简单的哈希函数将词汇映射到向量维度
			const hash1 = this.simpleHash(word) % this.dimension
			const hash2 = this.simpleHash(word + "_2") % this.dimension
			const hash3 = this.simpleHash(word + "_3") % this.dimension

			// 增加对应维度的权重
			vector[hash1] += 1.0
			vector[hash2] += 0.5
			vector[hash3] += 0.3
		})

		// 添加文本长度特征
		const lengthFeature = Math.log(text.length + 1) / 10
		for (let i = 0; i < Math.min(10, this.dimension); i++) {
			vector[i] += lengthFeature
		}

		// 添加代码特征检测
		if (this.isCodeLike(text)) {
			// 为代码文本添加特殊特征
			for (let i = this.dimension - 20; i < this.dimension; i++) {
				vector[i] += 0.5
			}
		}

		// L2 归一化
		const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
		if (norm > 0) {
			return vector.map((val) => val / norm)
		}

		return vector
	}

	/**
	 * 简单的哈希函数
	 */
	private simpleHash(str: string): number {
		let hash = 0
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i)
			hash = (hash << 5) - hash + char
			hash = hash & hash // 转换为32位整数
		}
		return Math.abs(hash)
	}

	/**
	 * 检测文本是否像代码
	 */
	private isCodeLike(text: string): boolean {
		const codeIndicators = [
			/function\s+\w+\s*\(/,
			/class\s+\w+/,
			/import\s+.*from/,
			/export\s+(default\s+)?/,
			/const\s+\w+\s*=/,
			/let\s+\w+\s*=/,
			/var\s+\w+\s*=/,
			/if\s*\(/,
			/for\s*\(/,
			/while\s*\(/,
			/\{\s*$/m,
			/;\s*$/m,
			/\/\*[\s\S]*?\*\//,
			/\/\/.*$/m,
		]

		return codeIndicators.some((pattern) => pattern.test(text))
	}

	/**
	 * 简单的token计数
	 */
	private countTokens(text: string): number {
		// 简单的词汇计数作为token估算
		return text.split(/\s+/).length
	}

	/**
	 * 获取模型信息
	 */
	getModelId(): string {
		return this.modelId
	}

	/**
	 * 获取向量维度
	 */
	getDimension(): number {
		return this.dimension
	}

	/**
	 * 验证嵌入器配置
	 * 内置嵌入器总是有效的，因为它没有外部依赖
	 */
	async validateConfiguration(): Promise<{ valid: boolean; error?: string }> {
		return { valid: true }
	}

	/**
	 * 获取嵌入器信息
	 */
	get embedderInfo() {
		return { name: "builtin" as const }
	}
}
