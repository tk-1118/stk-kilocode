import { ToolUse, ToolParamName } from "../../shared/tools"
import delay from "delay"

import { formatResponse } from "../prompts/responses"
import { Task } from "../task/Task"

export type AskApproval = (type: "tool", message: string) => Promise<boolean>
export type HandleError = (operation: string, error: Error) => Promise<void>
export type PushToolResult = (result: string) => void
export type RemoveClosingTag = (tag: ToolParamName, content?: string) => string

/**
 * 团队切换工具
 * 允许智能体切换到不同的开发团队
 */
export async function switchTeamTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	try {
		const { team_slug, reason } = block.params as { team_slug?: string; reason?: string }

		// 验证必需参数
		if (!team_slug) {
			cline.consecutiveMistakeCount++
			cline.recordToolError("switch_team")
			pushToolResult(await cline.sayAndCreateMissingParamError("switch_team", "team_slug"))
			return
		}

		cline.consecutiveMistakeCount = 0

		// 验证团队是否存在
		const provider = cline.providerRef.deref()
		if (!provider) {
			cline.recordToolError("switch_team")
			pushToolResult(formatResponse.toolError("Provider reference lost"))
			return
		}

		const state = await provider.getState()

		// 导入团队相关函数
		const { getTeamBySlug, DEFAULT_TEAMS } = require("../../shared/teams")

		// 检查内置团队和自定义团队
		const allTeams = [...DEFAULT_TEAMS, ...(state?.customTeams || [])]
		const targetTeam = getTeamBySlug(team_slug, state?.customTeams)

		if (!targetTeam) {
			cline.recordToolError("switch_team")
			const availableTeams = allTeams.map((team) => `${team.name} (${team.slug})`).join(", ")
			pushToolResult(formatResponse.toolError(`团队 "${team_slug}" 不存在。可用团队：${availableTeams}`))
			return
		}

		const currentTeam = cline.currentTeam || "unknown"

		// 检查是否已经在目标团队中
		if (currentTeam === team_slug) {
			pushToolResult(`已经在 ${targetTeam.name} 团队中。`)
			return
		}

		// 请求用户批准
		const completeMessage = JSON.stringify({
			tool: "switchTeam",
			team: team_slug,
			teamName: targetTeam.name,
			reason: reason || "未指定原因",
		})

		const didApprove = await askApproval("tool", completeMessage)

		if (!didApprove) {
			return
		}

		// 执行团队切换
		try {
			await cline.switchToTeam(team_slug)

			// 获取当前团队名称用于显示
			const currentTeamName = allTeams.find((team) => team.slug === currentTeam)?.name || currentTeam

			pushToolResult(
				`成功从 ${currentTeamName} 团队切换到 ${targetTeam.name} 团队${
					reason ? `，原因：${reason}` : ""
				}。现在可以使用该团队的专业成员进行协作开发。`,
			)

			// 延迟以允许团队切换生效
			await delay(500)
		} catch (error) {
			cline.recordToolError("switch_team")
			const errorMessage = error instanceof Error ? error.message : String(error)
			pushToolResult(formatResponse.toolError(`团队切换失败：${errorMessage}`))
		}

		return
	} catch (error) {
		await handleError("切换团队", error)
		return
	}
}
