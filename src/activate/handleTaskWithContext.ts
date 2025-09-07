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

			await provider.cancelTask()
			// 等待任务完全关闭
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		// 如果指定了模式，先切换模式
		if (mode) {
			await provider.handleModeSwitch(mode)
			// handleModeSwitch 是异步的，已经等待完成，不需要额外延迟
		}

		// 创建任务，传入临时系统提示词
		const task = await provider.createTask(userPrompt, images, undefined, {
			// 传入临时系统提示词作为选项
			temporarySystemPrompt,
		})

		if (!task) {
			throw new Error(t("commands:createTaskWithContext.errors.task_creation_failed"))
		}

		// 设置任务完成/取消时的清理回调
		const cleanupTemporaryPrompt = () => {
			// 临时系统提示词会在任务实例销毁时自动清理
			// 这里可以添加额外的清理逻辑
		}

		task.once(RooCodeEventName.TaskCompleted, cleanupTemporaryPrompt)
		task.once(RooCodeEventName.TaskAborted, cleanupTemporaryPrompt)

		// 注意：不需要手动发送 newChat 消息，createTask 会自动处理 webview 更新
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		vscode.window.showErrorMessage(t("commands:createTaskWithContext.errors.general", { error: errorMessage }))
	}
}
