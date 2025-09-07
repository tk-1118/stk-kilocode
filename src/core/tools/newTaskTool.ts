import delay from "delay"
import * as vscode from "vscode"

import { RooCodeEventName, TodoItem } from "@roo-code/types"

import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { Task } from "../task/Task"
import { defaultModeSlug, getModeBySlug } from "../../shared/modes"
import { formatResponse } from "../prompts/responses"
import { t } from "../../i18n"
import { parseMarkdownChecklist } from "./updateTodoListTool"

export async function newTaskTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const mode: string | undefined = block.params.mode
	const message: string | undefined = block.params.message
	const todos: string | undefined = block.params.todos

	try {
		if (block.partial) {
			const partialMessage = JSON.stringify({
				tool: "newTask",
				mode: removeClosingTag("mode", mode),
				content: removeClosingTag("message", message),
				todos: removeClosingTag("todos", todos),
			})

			await cline.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		} else {
			// 简化的参数验证：只检查必需参数是否存在
			if (!mode) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("new_task")

				// 提供清晰的错误提示，引导AI主动分析和选择
				const errorMessage = [
					"❌ new_task 工具缺少必需参数 'mode'",
					"",
					"💡 请按照以下步骤操作：",
					"1. 🔍 分析任务的技术需求和专业领域",
					"2. 📋 查看 TEAM MEMBERS 部分了解可用的专业团队成员",
					"3. 🎯 选择最匹配任务需求的专业成员（优先专业成员，避免通用模式）",
					"4. 📝 说明选择该团队成员的专业理由",
					"",
					"📝 正确格式：",
					"<new_task>",
					"<mode>团队成员标识符</mode>",
					"<message>详细的任务描述</message>",
					"</new_task>",
					"",
					"⚠️ 重要：请主动分析任务需求，选择最专业的团队成员来处理",
				].join("\n")

				await cline.say("error", errorMessage)
				pushToolResult(await cline.sayAndCreateMissingParamError("new_task", "mode"))
				return
			}

			if (!message) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("new_task")
				pushToolResult(await cline.sayAndCreateMissingParamError("new_task", "message"))
				return
			}

			// Get the VSCode setting for requiring todos
			const provider = cline.providerRef.deref()
			if (!provider) {
				pushToolResult(formatResponse.toolError("Provider reference lost"))
				return
			}
			const state = await provider.getState()
			const requireTodos = vscode.workspace
				.getConfiguration("kilo-code")
				.get<boolean>("newTaskRequireTodos", false)

			// Check if todos are required based on VSCode setting
			// Note: undefined means not provided, empty string is valid
			if (requireTodos && todos === undefined) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("new_task")
				pushToolResult(await cline.sayAndCreateMissingParamError("new_task", "todos"))
				return
			}

			// Parse todos if provided, otherwise use empty array
			let todoItems: TodoItem[] = []
			if (todos) {
				try {
					todoItems = parseMarkdownChecklist(todos)
				} catch (error) {
					cline.consecutiveMistakeCount++
					cline.recordToolError("new_task")
					pushToolResult(formatResponse.toolError("Invalid todos format: must be a markdown checklist"))
					return
				}
			}

			cline.consecutiveMistakeCount = 0
			// Un-escape one level of backslashes before '@' for hierarchical subtasks
			// Un-escape one level: \\@ -> \@ (removes one backslash for hierarchical subtasks)
			const unescapedMessage = message.replace(/\\\\@/g, "\\@")

			// Verify the mode exists
			const targetMode = getModeBySlug(mode, state?.customModes)

			if (!targetMode) {
				pushToolResult(formatResponse.toolError(`Invalid mode: ${mode}`))
				return
			}

			const toolMessage = JSON.stringify({
				tool: "newTask",
				mode: targetMode.name,
				content: message,
				todos: todoItems,
			})

			const didApprove = await askApproval("tool", toolMessage)

			if (!didApprove) {
				return
			}

			// Provider is guaranteed to be defined here due to earlier check

			if (cline.enableCheckpoints) {
				cline.checkpointSave(true)
			}

			// Preserve the current mode so we can resume with it later.
			cline.pausedModeSlug = (await provider.getState()).mode ?? defaultModeSlug

			// kilocode_change start: Switch to the desired mode BEFORE creating the task
			await provider.handleModeSwitch(mode)
			// Small delay to ensure mode switch has propagated
			await delay(100)
			// kilocode_change end

			// Create new task instance first (this preserves parent's current mode in its history)
			const newCline = await provider.createTask(unescapedMessage, undefined, cline, {
				initialTodos: todoItems,
			})
			if (!newCline) {
				await provider.handleModeSwitch(cline.pausedModeSlug) // kilocode_change: if task creation failed, switch back to the parent's mode
				pushToolResult(t("tools:newTask.errors.policy_restriction"))
				return
			}

			// kilocode_change start: Switch to the desired mode BEFORE creating the task above
			// // Now switch the newly created task to the desired mode
			// await provider.handleModeSwitch(mode)

			// // Delay to allow mode change to take effect
			// await delay(500)
			// kilocode_change end

			cline.emit(RooCodeEventName.TaskSpawned, newCline.taskId)

			pushToolResult(
				`Successfully created new task in ${targetMode.name} mode with message: ${unescapedMessage} and ${todoItems.length} todo items`,
			)

			// Set the isPaused flag to true so the parent
			// task can wait for the sub-task to finish.
			cline.isPaused = true
			cline.emit(RooCodeEventName.TaskPaused)

			return
		}
	} catch (error) {
		await handleError("creating new task", error)
		return
	}
}
