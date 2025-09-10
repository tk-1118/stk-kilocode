/**
 * 工作成果数据处理工具函数
 */

import type { ClineMessage } from "@roo-code/types"
import type { TaskWorkResults, TeamWorkStats, MemberWorkStats } from "@/types/workResults"
import { getModeDisplayName, getModeRoleName, getTeamBySlug } from "@/utils/teams"
import { TeamConfig } from "@roo-code/types"

/**
 * 从消息历史中提取工作成果数据
 */
export function extractWorkResultsFromMessages(
	messages: ClineMessage[],
	currentTeam?: string,
	customTeams?: TeamConfig[],
	apiMetrics?: { tokensIn: number; tokensOut: number; totalCost: number },
): TaskWorkResults | null {
	console.log("🔍 提取工作成果数据:", {
		messagesCount: messages?.length || 0,
		currentTeam,
		apiMetrics,
		apiMetricsDetail: {
			tokensIn: apiMetrics?.tokensIn,
			tokensOut: apiMetrics?.tokensOut,
			totalCost: apiMetrics?.totalCost,
			计算总Token: (apiMetrics?.tokensIn || 0) + (apiMetrics?.tokensOut || 0),
		},
	})

	if (!messages || messages.length === 0) {
		console.log("❌ 没有消息数据")
		return null
	}

	// 找到当前任务的开始和结束
	const taskStartMessage = messages.find((msg) => msg.type === "ask") || messages[0]
	const lastMessage = messages[messages.length - 1]

	console.log("📝 任务消息:", {
		taskStartMessage: taskStartMessage?.text?.substring(0, 50) + "...",
		lastMessage: lastMessage?.text?.substring(0, 50) + "...",
	})

	const taskId = taskStartMessage.ts?.toString() || Date.now().toString()
	const taskStartTime = new Date(taskStartMessage.ts || Date.now()).toISOString()
	const taskEndTime = lastMessage?.ts ? new Date(lastMessage.ts).toISOString() : undefined
	const taskDuration = taskEndTime
		? new Date(taskEndTime).getTime() - new Date(taskStartTime).getTime()
		: Date.now() - new Date(taskStartTime).getTime()

	// 统计各成员的工作数据
	const memberStatsMap = new Map<string, MemberWorkStats>()
	const totalCost = apiMetrics?.totalCost || 0

	// 使用真实的API数据，如果没有则基于消息数量进行估算
	const totalTokensIn = apiMetrics?.tokensIn ?? 0 // 使用真实数据，没有则为0
	const totalTokensOut = apiMetrics?.tokensOut ?? 0 // 使用真实数据，没有则为0

	console.log("📊 Token数据源:", {
		有apiMetrics: !!apiMetrics,
		原始tokensIn: apiMetrics?.tokensIn,
		原始tokensOut: apiMetrics?.tokensOut,
		使用tokensIn: totalTokensIn,
		使用tokensOut: totalTokensOut,
		消息数量: messages.length,
	})

	// 跟踪当前活跃的模式
	let currentActiveMode = currentTeam || "dev99-coder"
	const modeSegments: Array<{
		mode: string
		startIndex: number
		endIndex: number
		messages: ClineMessage[]
	}> = []

	// 第一步：识别模式切换，将消息分段
	let segmentStart = 0
	messages.forEach((message, index) => {
		const detectedMode = extractModeFromMessage(message)
		if (detectedMode && detectedMode !== currentActiveMode) {
			// 结束当前段
			if (segmentStart < index) {
				modeSegments.push({
					mode: currentActiveMode,
					startIndex: segmentStart,
					endIndex: index - 1,
					messages: messages.slice(segmentStart, index),
				})
			}
			// 开始新段
			currentActiveMode = detectedMode
			segmentStart = index
		}
	})

	// 添加最后一段
	if (segmentStart < messages.length) {
		modeSegments.push({
			mode: currentActiveMode,
			startIndex: segmentStart,
			endIndex: messages.length - 1,
			messages: messages.slice(segmentStart),
		})
	}

	console.log(
		"🔄 模式分段结果:",
		modeSegments.map((s) => ({
			mode: s.mode,
			messageCount: s.messages.length,
			startIndex: s.startIndex,
			endIndex: s.endIndex,
		})),
	)

	// 第二步：为每个模式段分配Token和统计数据
	// 先计算所有段的权重，确保总和为1
	const segmentWeights: number[] = []
	const totalTextLength = messages.reduce((sum, m) => sum + (m.text?.length || 0), 1)

	modeSegments.forEach((segment) => {
		const segmentMessages = segment.messages.filter((m) => m.text && m.text.trim().length > 0)
		const segmentTextLength = segmentMessages.reduce((sum, m) => sum + (m.text?.length || 0), 1)
		segmentWeights.push(segmentTextLength / totalTextLength)
	})

	// 归一化权重，确保总和为1
	const totalWeight = segmentWeights.reduce((sum, w) => sum + w, 0)
	const normalizedWeights = segmentWeights.map((w) => w / totalWeight)

	console.log(
		"📊 段权重分配:",
		normalizedWeights.map((w, i) => ({
			mode: modeSegments[i].mode,
			weight: (w * 100).toFixed(1) + "%",
		})),
	)

	modeSegments.forEach((segment, segmentIndex) => {
		const segmentMessages = segment.messages.filter((m) => m.text && m.text.trim().length > 0)
		if (segmentMessages.length === 0) return

		// 使用归一化权重分配Token
		const segmentWeight = normalizedWeights[segmentIndex]
		const segmentTokensIn = Math.round(totalTokensIn * segmentWeight)
		const segmentTokensOut = Math.round(totalTokensOut * segmentWeight)

		// 计算该段的工作时长
		const segmentStartTime = segmentMessages[0]?.ts || Date.now()
		const segmentEndTime = segmentMessages[segmentMessages.length - 1]?.ts || Date.now()
		const segmentDuration = Math.abs(segmentEndTime - segmentStartTime)

		// 统计该段的代码行数
		const segmentCodeLines = segmentMessages.reduce((sum, m) => sum + estimateCodeLines(m.text || ""), 0)

		console.log("📊 处理模式段:", {
			mode: segment.mode,
			messageCount: segmentMessages.length,
			tokensIn: segmentTokensIn,
			tokensOut: segmentTokensOut,
			codeLines: segmentCodeLines,
			duration: segmentDuration,
		})

		// 更新或创建成员统计
		const existingStats = memberStatsMap.get(segment.mode)
		if (existingStats) {
			existingStats.tokensIn += segmentTokensIn
			existingStats.tokensOut += segmentTokensOut
			existingStats.totalTokens += segmentTokensIn + segmentTokensOut
			existingStats.codeLines += segmentCodeLines
			existingStats.workDuration += segmentDuration
			existingStats.endTime = new Date(segmentEndTime).toISOString()
			existingStats.isActive = segmentIndex === modeSegments.length - 1
		} else {
			memberStatsMap.set(segment.mode, {
				modeSlug: segment.mode,
				memberName: getModeDisplayName(segment.mode),
				roleName: getModeRoleName(segment.mode),
				tokensIn: segmentTokensIn,
				tokensOut: segmentTokensOut,
				totalTokens: segmentTokensIn + segmentTokensOut,
				codeLines: segmentCodeLines,
				workDuration: segmentDuration,
				startTime: new Date(segmentStartTime).toISOString(),
				endTime: new Date(segmentEndTime).toISOString(),
				isActive: segmentIndex === modeSegments.length - 1,
			})
		}
	})

	console.log("📈 成员统计结果:", Array.from(memberStatsMap.entries()))

	// 验证Token分配总和
	const allocatedTokensIn = Array.from(memberStatsMap.values()).reduce((sum, m) => sum + m.tokensIn, 0)
	const allocatedTokensOut = Array.from(memberStatsMap.values()).reduce((sum, m) => sum + m.tokensOut, 0)
	const allocatedTotal = allocatedTokensIn + allocatedTokensOut
	const realTotal = totalTokensIn + totalTokensOut

	console.log("🔍 Token分配验证:", {
		真实TokenIn: totalTokensIn,
		分配TokenIn: allocatedTokensIn,
		真实TokenOut: totalTokensOut,
		分配TokenOut: allocatedTokensOut,
		真实总Token: realTotal,
		分配总Token: allocatedTotal,
		差异: Math.abs(realTotal - allocatedTotal),
	})

	// 构建团队统计
	const teams: TeamWorkStats[] = []
	const team = currentTeam ? getTeamBySlug(currentTeam, customTeams) : null

	if (memberStatsMap.size > 0) {
		const members = Array.from(memberStatsMap.values())
		const teamStats: TeamWorkStats = {
			teamSlug: team?.slug || currentTeam || "default-team",
			teamName: team?.name || "当前团队",
			teamIcon: team?.iconName || "codicon-organization",
			teamColor: team?.color || "#007ACC",
			members,
			// 使用真实的API Token数据，而不是分配Token的总和
			totalTokens: totalTokensIn + totalTokensOut,
			totalCodeLines: members.reduce((sum, member) => sum + member.codeLines, 0),
			totalWorkDuration: members.reduce((sum, member) => sum + member.workDuration, 0),
		}
		teams.push(teamStats)
		console.log("✅ 团队统计创建成功:", teamStats)
	} else {
		console.log("⚠️ 没有成员统计数据")
	}

	// 计算总计数据
	const totalCodeLines = teams.reduce((sum, team) => sum + team.totalCodeLines, 0)
	const activeMembersCount = teams.reduce((sum, team) => sum + team.members.filter((m) => m.isActive).length, 0)

	const result: TaskWorkResults = {
		taskId,
		taskDescription: taskStartMessage.text || "当前任务",
		taskStartTime,
		taskEndTime,
		taskDuration,
		totalTokensIn: apiMetrics?.tokensIn || 0,
		totalTokensOut: apiMetrics?.tokensOut || 0,
		totalTokens: (apiMetrics?.tokensIn || 0) + (apiMetrics?.tokensOut || 0),
		totalCodeLines,
		totalCost,
		teams,
		summary: {
			totalMembers: Array.from(memberStatsMap.values()).length,
			activeMembersCount,
			teamsCount: teams.length,
			totalCost,
			totalTokens: (apiMetrics?.tokensIn || 0) + (apiMetrics?.tokensOut || 0),
			totalCodeLines,
			totalWorkDuration: teams.reduce((sum, team) => sum + team.totalWorkDuration, 0),
		},
	}

	console.log("🎯 最终工作成果:", result)

	// 如果没有生成任何团队数据，返回null
	if (result.teams.length === 0) {
		console.log("⚠️ 没有团队数据")
		return null
	}

	// 如果没有真实的Token数据，返回null
	if (result.totalTokens === 0) {
		console.log("⚠️ 没有Token数据，可能任务还未开始或API数据未更新")
		return null
	}

	return result
}

/**
 * 从消息中提取模式信息
 */
function extractModeFromMessage(message: ClineMessage): string | null {
	// 检查是否是模式切换消息
	if (message.ask === "tool" && message.text) {
		try {
			const tool = JSON.parse(message.text)
			if (tool.tool === "switchMode" && tool.mode) {
				return tool.mode
			}
		} catch (_e) {
			// 忽略JSON解析错误
		}
	}

	// 检查消息文本中是否包含模式切换信息
	if (message.text) {
		// 查找模式切换的文本模式，如 "切换到 dev07-domain-model-and-value-object-coder-agent"
		const modePattern = /(dev\d+-[\w-]+)/g
		const matches = message.text.match(modePattern)
		if (matches && matches.length > 0) {
			return matches[0]
		}
	}

	return null
}

/**
 * 估算代码行数
 */
function estimateCodeLines(text: string): number {
	if (!text) return 0

	// 只统计明确的代码块，不进行关键字估算
	const codeBlockRegex = /```[\s\S]*?```/g
	const codeBlocks = text.match(codeBlockRegex) || []

	let totalLines = 0
	codeBlocks.forEach((block) => {
		// 移除开头和结尾的```
		const code = block.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "")
		// 计算非空行数
		const lines = code.split("\n").filter((line) => line.trim().length > 0)
		totalLines += lines.length

		lines.forEach((line) => {
			if (line?.indexOf("zz-rhombus-project-archetype") !== -1) {
				totalLines += 150
			} else if (line?.indexOf("zz-rhombus-group-archetype") !== -1) {
				totalLines += 60
			} else if (line?.indexOf("zz-rhombus-module-archetype") !== -1) {
				totalLines += 300
			}
		})
		console.log("📝 发现代码块:", {
			原始长度: block.length,
			代码内容长度: code.length,
			代码行数: lines.length,
			代码预览: code.substring(0, 100) + (code.length > 100 ? "..." : ""),
		})
	})

	console.log("📊 代码行数统计:", {
		文本长度: text.length,
		代码块数量: codeBlocks.length,
		总代码行数: totalLines,
		文本预览: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
	})

	return totalLines
}

/**
 * 生成工作成果摘要
 */
export function generateWorkResultsSummary(workResults: TaskWorkResults): string {
	const { teams, totalTokens, totalCodeLines, taskDuration, totalCost } = workResults

	const summary = [
		`任务完成情况摘要：`,
		`• 参与团队：${teams.length}个`,
		`• 活跃成员：${workResults.summary.activeMembersCount}名`,
		`• 消耗Token：${formatNumber(totalTokens)}`,
		`• 产出代码：${formatNumber(totalCodeLines)}行`,
		`• 工作时长：${formatDuration(taskDuration)}`,
		`• 总成本：$${totalCost.toFixed(2)}`,
	]

	return summary.join("\n")
}

/**
 * 格式化数字显示
 */
function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M"
	} else if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K"
	}
	return num.toString()
}

/**
 * 格式化时长显示
 */
function formatDuration(milliseconds: number): string {
	const seconds = Math.floor(milliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)

	if (hours > 0) {
		return `${hours}小时${minutes % 60}分钟`
	} else if (minutes > 0) {
		return `${minutes}分钟${seconds % 60}秒`
	} else {
		return `${seconds}秒`
	}
}

/**
 * 计算团队效率指标
 */
export function calculateTeamEfficiency(workResults: TaskWorkResults): {
	tokensPerHour: number
	linesPerHour: number
	costPerLine: number
	avgMemberProductivity: number
} {
	const { totalTokens, totalCodeLines, taskDuration, totalCost, summary } = workResults
	const { activeMembersCount } = summary
	const hours = taskDuration / (1000 * 60 * 60)

	return {
		tokensPerHour: hours > 0 ? totalTokens / hours : 0,
		linesPerHour: hours > 0 ? totalCodeLines / hours : 0,
		costPerLine: totalCodeLines > 0 ? totalCost / totalCodeLines : 0,
		avgMemberProductivity: activeMembersCount > 0 ? totalCodeLines / activeMembersCount : 0,
	}
}

/**
 * 导出工作成果为CSV格式
 */
export function exportWorkResultsToCSV(workResults: TaskWorkResults): string {
	const headers = [
		"团队",
		"成员",
		"角色",
		"输入Token",
		"输出Token",
		"总Token",
		"代码行数",
		"工作时长(分钟)",
		"开始时间",
		"结束时间",
	]

	const rows = [headers.join(",")]

	workResults.teams.forEach((team) => {
		team.members.forEach((member) => {
			const row = [
				team.teamName,
				member.memberName,
				member.roleName,
				member.tokensIn.toString(),
				member.tokensOut.toString(),
				member.totalTokens.toString(),
				member.codeLines.toString(),
				Math.round(member.workDuration / (1000 * 60)).toString(),
				member.startTime || "",
				member.endTime || "",
			]
			rows.push(row.join(","))
		})
	})

	return rows.join("\n")
}
