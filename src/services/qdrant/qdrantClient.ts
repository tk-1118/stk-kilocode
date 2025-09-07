/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode"

/**
 * Qdrant 连接信息接口
 */
export interface IQdrantConnectionInfo {
	readonly httpPort: number
	readonly grpcPort: number
	readonly apiKey: string
	readonly baseUrl: string
}

/**
 * Qdrant 服务状态枚举
 */
export enum QdrantStatus {
	Stopped = "stopped",
	Starting = "starting",
	Running = "running",
	Error = "error",
	Stopping = "stopping",
}

/**
 * Qdrant 客户端
 * 通过 VSCode 的 IPC 机制与主进程中的 Qdrant 服务通信
 */
export class QdrantClient {
	private static _instance: QdrantClient | undefined

	/**
	 * 获取 Qdrant 客户端单例
	 */
	static getInstance(): QdrantClient {
		if (!QdrantClient._instance) {
			QdrantClient._instance = new QdrantClient()
		}
		return QdrantClient._instance
	}

	private constructor() {}

	/**
	 * 获取 Qdrant 连接信息
	 * 这是扩展最常用的方法
	 */
	async getConnectionInfo(): Promise<IQdrantConnectionInfo | undefined> {
		try {
			// 通过 VSCode 的命令系统调用主进程的 Qdrant 服务
			const connectionInfo = await vscode.commands.executeCommand("_internal.qdrant.getConnectionInfo")
			return connectionInfo as IQdrantConnectionInfo | undefined
		} catch (error) {
			console.error("[QdrantClient] 获取连接信息失败:", error)
			return undefined
		}
	}

	/**
	 * 获取 Qdrant 服务状态
	 */
	async getStatus(): Promise<QdrantStatus> {
		try {
			const status = await vscode.commands.executeCommand("_internal.qdrant.getStatus")
			return status as QdrantStatus
		} catch (error) {
			console.error("[QdrantClient] 获取状态失败:", error)
			return QdrantStatus.Error
		}
	}

	/**
	 * 检查 Qdrant 服务健康状态
	 */
	async checkHealth(): Promise<boolean> {
		try {
			const isHealthy = await vscode.commands.executeCommand("_internal.qdrant.checkHealth")
			return isHealthy as boolean
		} catch (error) {
			console.error("[QdrantClient] 健康检查失败:", error)
			return false
		}
	}

	/**
	 * 等待 Qdrant 服务就绪
	 * @param timeout 超时时间（毫秒），默认 30 秒
	 */
	async waitForReady(timeout: number = 30000): Promise<IQdrantConnectionInfo> {
		const startTime = Date.now()

		while (Date.now() - startTime < timeout) {
			const status = await this.getStatus()

			if (status === QdrantStatus.Running) {
				const connectionInfo = await this.getConnectionInfo()
				if (connectionInfo) {
					return connectionInfo
				}
			}

			if (status === QdrantStatus.Error) {
				throw new Error("Qdrant 服务启动失败")
			}

			// 等待 500ms 后重试
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		throw new Error(`Qdrant 服务在 ${timeout}ms 内未就绪`)
	}

	/**
	 * 获取环境变量格式的连接信息（向后兼容）
	 */
	async getEnvironmentVariables(): Promise<Record<string, string>> {
		const connectionInfo = await this.getConnectionInfo()

		if (!connectionInfo) {
			return {}
		}

		return {
			KILOCODE_QDRANT_HTTP_PORT: String(connectionInfo.httpPort),
			KILOCODE_QDRANT_GRPC_PORT: String(connectionInfo.grpcPort),
			KILOCODE_QDRANT_API_KEY: connectionInfo.apiKey,
			KILOCODE_QDRANT_BASE_URL: connectionInfo.baseUrl,
		}
	}
}
