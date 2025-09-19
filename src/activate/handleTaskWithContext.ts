import * as vscode from "vscode"

import { RooCodeEventName } from "@roo-code/types"

import { Package } from "../shared/package"
import { ClineProvider } from "../core/webview/ClineProvider"
import { t } from "../i18n"

/**
 * 创建带有自定义上下文的任务的参数接口
 * 支持其他扩展程序通过 vscode.commands.executeCommand 调用
 */
export interface CreateTaskWithContextParams {
	/** 用户提示词（将显示在聊天框中） */
	userPrompt: string
	/** 临时系统提示词（仅在本次任务中生效，任务结束后自动清除） */
	temporarySystemPrompt?: string
	/** 可选的图片数据（base64 编码） */
	images?: string[]
	/** 是否在新标签页中打开任务 */
	newTab?: boolean
	/** 可选的模式（如 "code", "ask", "architect"） */
	mode?: string
}

/**
 * 处理创建带有自定义上下文的任务命令
 *
 * 业务逻辑：
 * 1. 验证必需参数
 * 2. 关闭当前运行的任务（如果存在）
 * 3. 创建带有临时系统提示词的任务
 * 4. 确保任务结束时清除临时系统提示词
 *
 * @param params 任务创建参数
 */
export const handleCreateTaskWithContext = async (params: CreateTaskWithContextParams | null | undefined) => {
	// 参数验证
	if (!params || !params.userPrompt) {
		const errorMessage = t("commands:createTaskWithContext.errors.missing_user_prompt")
		vscode.window.showErrorMessage(errorMessage)
		return
	}

	const { userPrompt, temporarySystemPrompt, images, newTab = false, mode } = params

	try {
		// 获取当前的 provider 实例
		// 聚焦到侧边栏（暂时不支持新标签页，因为需要扩展上下文）
		await vscode.commands.executeCommand(`${Package.name}.SidebarProvider.focus`)
		const provider = ClineProvider.getVisibleInstance()

		if (!provider) {
			throw new Error(t("commands:createTaskWithContext.errors.no_provider"))
		}

		// 在创建新任务前，先关闭当前运行的任务
		const currentTask = provider.getCurrentTask()
		if (currentTask) {
			console.log(`[createTaskWithContext] 关闭当前任务 ${currentTask.taskId}.${currentTask.instanceId}`)

			// 显示用户通知
			vscode.window.showInformationMessage(t("commands:createTaskWithContext.info.closing_current_task"))

			// 取消任务
			await provider.cancelTask()
			// 等待任务完全关闭
			await new Promise((resolve) => setTimeout(resolve, 600))
		}

		// 清理任务栈，创建一个新的聊天会话
		await provider.clearTask()

		// 如果指定了模式，先切换模式
		if (mode) {
			// handleModeSwitch 是异步的，已经等待完成，不需要额外延迟
			await provider.handleModeSwitch(mode)
		}

		// 更新 webview 状态
		await provider.postStateToWebview()

		// 构建要发送到聊天框的消息
		let chatMessage = userPrompt

		// 如果有临时系统提示词，将其作为上下文信息添加到用户消息中
		if (temporarySystemPrompt) {
			console.log(`[createTaskWithContext] 包含临时系统提示词到聊天消息中`)
			chatMessage = `## 任务上下文\n\n${temporarySystemPrompt}\n\n## 用户请求\n\n${userPrompt}`
		}

		// 将构建的消息设置到聊天框中，而不是自动执行任务
		await provider.postMessageToWebview({
			type: "invoke",
			invoke: "newChat",
			text: "",
		})

		// 等待 600ms
		await new Promise((resolve) => setTimeout(resolve, 600))

		// 将构建的消息设置到聊天框中，而不是自动执行任务
		await provider.postMessageToWebview({
			type: "invoke",
			invoke: "setChatBoxMessage",
			text: chatMessage,
		})

		// 聚焦到聊天界面
		await provider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		vscode.window.showErrorMessage(t("commands:createTaskWithContext.errors.general", { error: errorMessage }))
	}
}
