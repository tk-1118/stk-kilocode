/**
 * 工作成果数据处理工具函数
 *
 * 主要功能：
 * 1. 从AI助手消息历史中提取工作成果数据
 * 2. 全面统计代码行数，包括：
 *    - 传统代码块 (```...```)
 *    - 文件操作（新建、编辑、应用差异）
 *    - 命令执行操作
 *    - 特殊架构模板操作
 * 3. 按团队和成员分配工作量和Token消耗
 * 4. 生成详细的工作成果报告和分析
 *
 * 改进说明：
 * - 解决了之前仅依赖```代码块识别的局限性
 * - 新增了对工具操作JSON和文本描述的识别
 * - 添加了详细的调试日志和统计明细
 * - 支持导出详细分析结果用于调试
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
 * 工具操作类型定义
 */
interface ToolOperation {
	tool: string
	path?: string
	content?: string
	diff?: string
	batchDiffs?: Array<{ path: string; diff: string }>
	batchFiles?: Array<{ path: string }>
	command?: string
	output?: string
	// Java DDD代码生成工具特有字段
	packageName?: string
	outputDir?: string
	totalFiles?: number
	successFiles?: number
	errorFiles?: number
	skippedFiles?: number
	generatedFiles?: Array<{ path: string; status: string; type: string }>
	estimatedCodeLines?: number
	summary?: string
}

/**
 * 代码行数统计结果
 */
interface CodeLinesResult {
	totalLines: number
	breakdown: {
		codeBlocks: number
		fileOperations: number
		commandOperations: number
		archetype: number
	}
	details: Array<{
		type: string
		lines: number
		description: string
	}>
}

/**
 * 全面的代码行数估算函数
 * 统计所有类型的工作成果：代码块、文件操作、命令执行等
 */
function estimateCodeLines(text: string): number {
	if (!text) return 0

	const result = estimateCodeLinesDetailed(text)

	console.log("📊 代码行数统计详情:", {
		文本长度: text.length,
		总代码行数: result.totalLines,
		统计明细: result.breakdown,
		操作详情: result.details,
		文本预览: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
	})

	return result.totalLines
}

/**
 * 详细的代码行数估算函数
 * 返回完整的统计结果和明细
 */
function estimateCodeLinesDetailed(text: string): CodeLinesResult {
	if (!text) {
		return {
			totalLines: 0,
			breakdown: { codeBlocks: 0, fileOperations: 0, commandOperations: 0, archetype: 0 },
			details: [],
		}
	}

	const result: CodeLinesResult = {
		totalLines: 0,
		breakdown: { codeBlocks: 0, fileOperations: 0, commandOperations: 0, archetype: 0 },
		details: [],
	}

	// 1. 统计传统代码块 (```...```)
	const codeBlockLines = countCodeBlocks(text, result)

	// 2. 统计工具操作产生的代码行数
	const toolOperationLines = countToolOperations(text, result)

	// 3. 统计特殊架构模板
	const archetypeLines = countArchetypeOperations(text, result)

	result.totalLines = codeBlockLines + toolOperationLines + archetypeLines

	return result
}

/**
 * 统计代码块行数
 */
function countCodeBlocks(text: string, result: CodeLinesResult): number {
	const codeBlockRegex = /```[\s\S]*?```/g
	const codeBlocks = text.match(codeBlockRegex) || []
	let totalLines = 0

	codeBlocks.forEach((block, index) => {
		// 移除开头和结尾的```
		const code = block.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "")
		// 计算非空行数
		const lines = code.split("\n").filter((line) => line.trim().length > 0)
		const lineCount = lines.length
		totalLines += lineCount

		result.details.push({
			type: "代码块",
			lines: lineCount,
			description: `代码块 #${index + 1} (${lineCount} 行)`,
		})

		console.log("📝 发现代码块:", {
			索引: index + 1,
			原始长度: block.length,
			代码内容长度: code.length,
			代码行数: lineCount,
			代码预览: code.substring(0, 100) + (code.length > 100 ? "..." : ""),
		})
	})

	result.breakdown.codeBlocks = totalLines
	return totalLines
}

/**
 * 统计工具操作产生的代码行数
 */
function countToolOperations(text: string, result: CodeLinesResult): number {
	let totalLines = 0

	try {
		// 尝试解析为工具操作JSON
		const toolOperation = JSON.parse(text) as ToolOperation
		const operationLines = estimateToolOperationLines(toolOperation, result)
		totalLines += operationLines
	} catch (_e) {
		// 不是JSON格式，可能包含多个工具操作描述
		// 查找工具操作的文本描述模式
		totalLines += countToolOperationDescriptions(text, result)
	}

	result.breakdown.fileOperations += totalLines
	return totalLines
}

/**
 * 估算单个工具操作的代码行数
 */
function estimateToolOperationLines(tool: ToolOperation, result: CodeLinesResult): number {
	let lines = 0
	let description = ""

	switch (tool.tool) {
		case "newFileCreated":
		case "editedExistingFile":
		case "appliedDiff":
			if (tool.content) {
				lines = countNonEmptyLines(tool.content)
				description = `${tool.tool} - ${tool.path} (${lines} 行)`
			} else if (tool.diff) {
				// 对于diff，只统计新增的行（+开头的行）
				const addedLines = tool.diff
					.split("\n")
					.filter((line) => line.startsWith("+") && !line.startsWith("+++")).length
				lines = addedLines
				description = `${tool.tool} - ${tool.path} (新增 ${lines} 行)`
			}
			break

		case "insertContent":
			if (tool.content) {
				lines = countNonEmptyLines(tool.content)
				description = `插入内容 - ${tool.path} (${lines} 行)`
			}
			break

		case "batchDiffs":
			if (tool.batchDiffs && Array.isArray(tool.batchDiffs)) {
				tool.batchDiffs.forEach((batchItem, index) => {
					const batchLines = batchItem.diff
						.split("\n")
						.filter((line) => line.startsWith("+") && !line.startsWith("+++")).length
					lines += batchLines
					result.details.push({
						type: "批量编辑",
						lines: batchLines,
						description: `批量编辑 #${index + 1} - ${batchItem.path} (新增 ${batchLines} 行)`,
					})
				})
				description = `批量文件编辑 (${tool.batchDiffs.length} 个文件，共 ${lines} 行)`
			}
			break

		case "command":
			// 命令执行通常不直接产生代码，但可以根据命令类型估算影响
			lines = estimateCommandImpact(tool.command || "", tool.output || "")
			if (lines > 0) {
				description = `命令执行 - ${tool.command} (估算影响 ${lines} 行)`
			}
			break

		case "java_ddd_codegen":
			// Java DDD代码生成工具的特殊处理
			if (tool.successFiles && typeof tool.successFiles === "number") {
				// 使用实际成功生成的文件数量，每个文件估算60行代码
				lines = tool.successFiles * 70
				description = `Java DDD代码生成 - 生成${tool.successFiles}个文件 (${lines} 行)`
			} else if (tool.estimatedCodeLines && typeof tool.estimatedCodeLines === "number") {
				// 使用工具提供的估算行数
				lines = tool.estimatedCodeLines
				description = `Java DDD代码生成 - 估算 ${lines} 行`
			} else if (tool.generatedFiles && Array.isArray(tool.generatedFiles)) {
				// 根据生成的文件列表估算
				lines = tool.generatedFiles.length * 70
				description = `Java DDD代码生成 - ${tool.generatedFiles.length}个文件 (${lines} 行)`
			} else {
				// 默认估算
				lines = 300
				description = `Java DDD代码生成 - 默认估算 ${lines} 行`
			}
			break

		case "readFile":
		case "list_files":
		case "search_files":
			// 读取操作不产生代码行数
			lines = 0
			break

		default:
			// 其他工具操作的默认估算
			if (tool.content) {
				lines = Math.min(countNonEmptyLines(tool.content), 50) // 限制最大50行
				description = `${tool.tool} (估算 ${lines} 行)`
			}
			break
	}

	if (lines > 0 && description) {
		result.details.push({
			type: "工具操作",
			lines,
			description,
		})
	}

	return lines
}

/**
 * 统计工具操作描述文本中的代码行数
 */
function countToolOperationDescriptions(text: string, result: CodeLinesResult): number {
	let totalLines = 0

	// 查找文件操作描述模式
	const fileOperationPatterns = [
		/创建(?:了|新)?文件[：:]?\s*([^\n]+)/gi,
		/编辑(?:了)?文件[：:]?\s*([^\n]+)/gi,
		/修改(?:了)?文件[：:]?\s*([^\n]+)/gi,
		/新建(?:了)?文件[：:]?\s*([^\n]+)/gi,
		/写入(?:了)?文件[：:]?\s*([^\n]+)/gi,
	]

	fileOperationPatterns.forEach((pattern) => {
		let match
		while ((match = pattern.exec(text)) !== null) {
			// 为每个文件操作估算基础行数
			const estimatedLines = 20 // 每个文件操作的基础估算行数
			totalLines += estimatedLines

			result.details.push({
				type: "文件操作描述",
				lines: estimatedLines,
				description: `文件操作: ${match[1] || "未知文件"} (估算 ${estimatedLines} 行)`,
			})
		}
	})

	// 查找命令执行描述模式
	const commandPatterns = [
		/执行(?:了)?命令[：:]?\s*([^\n]+)/gi,
		/运行(?:了)?[：:]?\s*([^\n]+)/gi,
		/安装(?:了)?[：:]?\s*([^\n]+)/gi,
	]

	commandPatterns.forEach((pattern) => {
		let match
		while ((match = pattern.exec(text)) !== null) {
			const commandImpact = estimateCommandImpact(match[1] || "", "")
			if (commandImpact > 0) {
				totalLines += commandImpact
				result.details.push({
					type: "命令执行描述",
					lines: commandImpact,
					description: `命令执行: ${match[1]} (估算影响 ${commandImpact} 行)`,
				})
			}
		}
	})

	return totalLines
}

/**
 * 统计特殊架构模板操作
 */
function countArchetypeOperations(text: string, result: CodeLinesResult): number {
	let totalLines = 0

	// 优先检查是否是java_ddd_codegen工具的JSON输出
	try {
		const toolData = JSON.parse(text)
		if (toolData.tool === "java_ddd_codegen") {
			// 这种情况已经在countToolOperations中处理了，这里不重复计算
			return 0
		}
	} catch {
		// 不是JSON格式，继续检查文本模式
	}

	// 检查文本中的java_ddd_codegen描述
	if (text.includes("java_ddd_codegen") || text.includes("Java DDD代码生成")) {
		// 尝试从文本中提取文件数量
		const fileCountMatch =
			text.match(/(?:生成|创建)了?(\d+)个?(?:文件|领域模型文件)/) || text.match(/(\d+)个?(?:文件|领域模型文件)/)
		if (fileCountMatch) {
			const fileCount = parseInt(fileCountMatch[1], 10)
			const lines = fileCount * 60 // 每个文件估算60行
			totalLines += lines
			result.details.push({
				type: "架构模板",
				lines,
				description: `Java DDD代码生成 - ${fileCount}个文件 (${lines} 行)`,
			})
		} else {
			// 没有找到具体文件数量，使用默认估算
			const lines = 300
			totalLines += lines
			result.details.push({
				type: "架构模板",
				lines,
				description: `Java DDD代码生成 - 默认估算 (${lines} 行)`,
			})
		}
	}

	const archetypePatterns = [
		{ pattern: "zz-rhombus-project-archetype", lines: 150, name: "项目架构模板" },
		{ pattern: "zz-rhombus-group-archetype", lines: 60, name: "组架构模板" },
		{ pattern: "zz-rhombus-module-archetype", lines: 300, name: "模块架构模板" },
	]

	archetypePatterns.forEach((archetype) => {
		const count = (text.match(new RegExp(archetype.pattern, "g")) || []).length
		if (count > 0) {
			const lines = count * archetype.lines
			totalLines += lines

			result.details.push({
				type: "架构模板",
				lines,
				description: `${archetype.name} x${count} (${lines} 行)`,
			})
		}
	})

	result.breakdown.archetype = totalLines
	return totalLines
}

/**
 * 估算命令执行的代码影响
 */
function estimateCommandImpact(command: string, output: string): number {
	if (!command) return 0

	const cmd = command.toLowerCase().trim()

	// 代码生成类命令
	if (cmd.includes("create") || cmd.includes("generate") || cmd.includes("init")) {
		if (cmd.includes("project") || cmd.includes("app")) return 100
		if (cmd.includes("component") || cmd.includes("service")) return 50
		if (cmd.includes("test")) return 30
		return 20
	}

	// 安装类命令
	if (cmd.includes("install") || cmd.includes("add") || cmd.includes("npm") || cmd.includes("yarn")) {
		return 5 // 安装依赖通常会修改package.json等配置文件
	}

	// 构建类命令
	if (cmd.includes("build") || cmd.includes("compile") || cmd.includes("bundle")) {
		return 0 // 构建不直接产生源代码
	}

	// 测试类命令
	if (cmd.includes("test") || cmd.includes("jest") || cmd.includes("mocha")) {
		return 0 // 测试执行不产生代码
	}

	// Maven/Gradle 特殊命令
	if (cmd.includes("mvn") || cmd.includes("gradle")) {
		if (cmd.includes("archetype:generate") || cmd.includes("create")) return 200
		if (cmd.includes("test")) return 0
		return 10
	}

	// 根据输出长度估算影响（如果有输出的话）
	if (output && output.length > 100) {
		return Math.min(Math.floor(output.length / 100), 50)
	}

	return 0
}

/**
 * 计算文本中的非空行数
 */
function countNonEmptyLines(text: string): number {
	if (!text) return 0
	return text.split("\n").filter((line) => line.trim().length > 0).length
}

/**
 * 导出详细的代码行数统计结果（用于调试和分析）
 */
export function exportCodeLinesAnalysis(messages: ClineMessage[]): {
	totalMessages: number
	totalCodeLines: number
	messageAnalysis: Array<{
		messageIndex: number
		messageType: string
		messageAsk?: string
		textLength: number
		codeLines: number
		breakdown: CodeLinesResult["breakdown"]
		details: CodeLinesResult["details"]
		textPreview: string
	}>
} {
	const messageAnalysis = messages.map((message, index) => {
		const text = message.text || ""
		const result = estimateCodeLinesDetailed(text)

		return {
			messageIndex: index,
			messageType: message.type,
			messageAsk: message.ask,
			textLength: text.length,
			codeLines: result.totalLines,
			breakdown: result.breakdown,
			details: result.details,
			textPreview: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
		}
	})

	const totalCodeLines = messageAnalysis.reduce((sum, analysis) => sum + analysis.codeLines, 0)

	return {
		totalMessages: messages.length,
		totalCodeLines,
		messageAnalysis,
	}
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
