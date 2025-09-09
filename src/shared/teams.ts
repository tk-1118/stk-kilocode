import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"

import {
	type TeamConfig,
	type ProjectContext,
	type TeamWorkStatus,
	type TeamSwitchEvent,
	DEFAULT_TEAMS,
} from "@roo-code/types"

import { getAllModes, getModeBySlug } from "./modes"
import { TASK_MODE_MAPPING, BASE_MODE_LIST } from "./constants/modes"
import { DEFAULT_TEAM_SLUG, TEAM_STATE, CONFIDENCE_THRESHOLDS } from "./constants/teams"
import { getModeDisplayName } from "./constants/unified-modes"

export type Team = string

/**
 * 获取模式的显示名称（团队成员名称）
 * @deprecated 使用统一常量模块中的 getModeDisplayName 函数
 */
function getModeDisplayNameLocal(modeSlug: string): string {
	return getModeDisplayName(modeSlug)
}

/**
 * 获取所有可用团队（内置 + 自定义）
 */
export function getAllTeams(customTeams?: TeamConfig[]): TeamConfig[] {
	if (!customTeams?.length) {
		return [...DEFAULT_TEAMS]
	}

	// 合并内置团队和自定义团队
	const allTeams = [...DEFAULT_TEAMS]

	customTeams.forEach((customTeam) => {
		const index = allTeams.findIndex((team) => team.slug === customTeam.slug)
		if (index !== -1) {
			// 覆盖现有团队
			allTeams[index] = customTeam
		} else {
			// 添加新团队
			allTeams.push(customTeam)
		}
	})

	return allTeams
}

/**
 * 根据slug获取团队配置
 */
export function getTeamBySlug(slug: string, customTeams?: TeamConfig[]): TeamConfig | undefined {
	const customTeam = customTeams?.find((team) => team.slug === slug)
	if (customTeam) {
		return customTeam
	}
	return DEFAULT_TEAMS.find((team) => team.slug === slug)
}

/**
 * 获取团队的所有模式（基础模式 + 专业模式）
 */
export function getTeamModes(teamSlug: string, customTeams?: TeamConfig[], customModes?: any[]): any[] {
	const team = getTeamBySlug(teamSlug, customTeams)
	if (!team) {
		return []
	}

	const allModes = getAllModes(customModes)
	const teamModesSlugs = [...team.baseModes, ...team.specialtyModes]

	return allModes.filter((mode) => teamModesSlugs.includes(mode.slug))
}

/**
 * 检测项目类型并返回推荐的团队
 */
export async function detectProjectTeam(
	workspaceRoot: string,
	customTeams?: TeamConfig[],
): Promise<{
	recommendedTeam: string | null
	confidence: number
	context: ProjectContext
	reasons: string[]
}> {
	const allTeams = getAllTeams(customTeams)
	const results: Array<{
		team: string
		score: number
		reasons: string[]
		context: Partial<ProjectContext>
	}> = []

	for (const team of allTeams) {
		if (!team.projectDetection) {
			continue
		}

		let score = 0
		const reasons: string[] = []
		const context: Partial<ProjectContext> = {}

		// 检查配置文件
		if (team.projectDetection.configFiles) {
			for (const configFile of team.projectDetection.configFiles) {
				const configPath = path.join(workspaceRoot, configFile.replace("*", ""))
				try {
					// 支持通配符匹配
					if (configFile.includes("*")) {
						const dir = path.dirname(configPath)
						const pattern = path.basename(configFile)
						const files = await fs.promises.readdir(dir).catch(() => [])
						const matches = files.filter((file) => new RegExp(pattern.replace("*", ".*")).test(file))
						if (matches.length > 0) {
							score += 20
							reasons.push(`发现配置文件: ${matches.join(", ")}`)

							// 分析配置文件内容
							await analyzeConfigFile(path.join(dir, matches[0]), context)
						}
					} else {
						await fs.promises.access(configPath)
						score += 20
						reasons.push(`发现配置文件: ${configFile}`)

						// 分析配置文件内容
						await analyzeConfigFile(configPath, context)
					}
				} catch {
					// 文件不存在，跳过
				}
			}
		}

		// 检查文件模式
		if (team.projectDetection.filePatterns) {
			const fileCount = await countFilesByPatterns(workspaceRoot, team.projectDetection.filePatterns)
			if (fileCount > 0) {
				score += Math.min(fileCount * 2, 30) // 最多30分
				reasons.push(`发现${fileCount}个相关文件`)
			}
		}

		// 检查目录结构
		if (team.projectDetection.directoryPatterns) {
			for (const dirPattern of team.projectDetection.directoryPatterns) {
				const dirPath = path.join(workspaceRoot, dirPattern)
				try {
					const stat = await fs.promises.stat(dirPath)
					if (stat.isDirectory()) {
						score += 15
						reasons.push(`发现目录结构: ${dirPattern}`)
					}
				} catch {
					// 目录不存在，跳过
				}
			}
		}

		// 检查依赖包（从package.json或其他配置文件）
		if (team.projectDetection.dependencies && context.packageManager) {
			const deps = await getDependencies(workspaceRoot)
			for (const dep of team.projectDetection.dependencies) {
				if (deps.includes(dep)) {
					score += 10
					reasons.push(`发现依赖: ${dep}`)
				}
			}
		}

		if (score > 0) {
			results.push({
				team: team.slug,
				score,
				reasons,
				context,
			})
		}
	}

	// 按分数排序
	results.sort((a, b) => b.score - a.score)

	if (results.length === 0) {
		return {
			recommendedTeam: null,
			confidence: 0,
			context: { type: "unknown" },
			reasons: ["未能识别项目类型"],
		}
	}

	const best = results[0]
	const confidence = Math.min(best.score / 100, 1) // 标准化为0-1

	// 合并上下文信息
	const finalContext: ProjectContext = {
		type: best.team.replace("-team", ""),
		...best.context,
	}

	return {
		recommendedTeam: best.team,
		confidence,
		context: finalContext,
		reasons: best.reasons,
	}
}

/**
 * 分析配置文件内容
 */
async function analyzeConfigFile(filePath: string, context: Partial<ProjectContext>): Promise<void> {
	try {
		const content = await fs.promises.readFile(filePath, "utf-8")
		const fileName = path.basename(filePath)

		if (fileName === "package.json") {
			const pkg = JSON.parse(content)

			// 检测框架
			if (pkg.dependencies || pkg.devDependencies) {
				const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

				if (allDeps.react) context.framework = "React"
				else if (allDeps.vue) context.framework = "Vue"
				else if (allDeps["@angular/core"]) context.framework = "Angular"
				else if (allDeps.svelte) context.framework = "Svelte"
				else if (allDeps.next) context.framework = "Next.js"
				else if (allDeps.nuxt) context.framework = "Nuxt.js"

				// 检测构建工具
				if (allDeps.vite) context.buildTool = "Vite"
				else if (allDeps.webpack) context.buildTool = "Webpack"
				else if (allDeps.rollup) context.buildTool = "Rollup"

				// 检测包管理器
				context.packageManager = "npm" // 默认
			}

			// 检测测试
			if (pkg.scripts?.test || pkg.devDependencies?.jest || pkg.devDependencies?.vitest) {
				context.hasTests = true
			}
		} else if (fileName === "pom.xml") {
			context.language = "Java"
			context.buildTool = "Maven"

			// 检测Spring框架
			if (content.includes("spring-boot")) {
				context.framework = "Spring Boot"
			}
		} else if (fileName.includes("gradle")) {
			context.language = "Java"
			context.buildTool = "Gradle"
		}

		// 检测Docker
		if (fileName === "Dockerfile" || fileName === "docker-compose.yml") {
			context.hasDocker = true
		}

		// 检测CI/CD
		if (filePath.includes(".github/workflows") || filePath.includes(".gitlab-ci")) {
			context.hasCI = true
		}
	} catch (error) {
		// 解析失败，跳过
	}
}

/**
 * 统计匹配文件模式的文件数量
 */
async function countFilesByPatterns(dir: string, patterns: string[]): Promise<number> {
	let count = 0

	try {
		const files = await fs.promises.readdir(dir, { withFileTypes: true })

		for (const file of files) {
			const filePath = path.join(dir, file.name)

			if (file.isDirectory() && !file.name.startsWith(".") && file.name !== "node_modules") {
				// 递归搜索子目录
				count += await countFilesByPatterns(filePath, patterns)
			} else if (file.isFile()) {
				// 检查文件是否匹配模式
				for (const pattern of patterns) {
					const regex = new RegExp(pattern.replace("*", ".*").replace(".", "\\."))
					if (regex.test(file.name)) {
						count++
						break
					}
				}
			}
		}
	} catch {
		// 目录访问失败，返回0
	}

	return count
}

/**
 * 获取项目依赖列表
 */
async function getDependencies(workspaceRoot: string): Promise<string[]> {
	const deps: string[] = []

	// 检查package.json
	try {
		const packagePath = path.join(workspaceRoot, "package.json")
		const content = await fs.promises.readFile(packagePath, "utf-8")
		const pkg = JSON.parse(content)

		if (pkg.dependencies) {
			deps.push(...Object.keys(pkg.dependencies))
		}
		if (pkg.devDependencies) {
			deps.push(...Object.keys(pkg.devDependencies))
		}
	} catch {
		// package.json不存在或解析失败
	}

	// 检查pom.xml
	try {
		const pomPath = path.join(workspaceRoot, "pom.xml")
		const content = await fs.promises.readFile(pomPath, "utf-8")

		// 简单的XML解析，提取artifactId
		const matches = content.match(/<artifactId>([^<]+)<\/artifactId>/g)
		if (matches) {
			for (const match of matches) {
				const artifactId = match.replace(/<\/?artifactId>/g, "")
				deps.push(artifactId)
			}
		}
	} catch {
		// pom.xml不存在或解析失败
	}

	return deps
}

/**
 * 智能推荐团队成员（模式）
 */
export function recommendTeamMember(
	task: string,
	teamSlug: string,
	customTeams?: TeamConfig[],
	customModes?: any[],
): { mode: string; member: string; reason: string } | null {
	const team = getTeamBySlug(teamSlug, customTeams)
	if (!team) {
		return null
	}

	const taskLower = task.toLowerCase()
	const allTeamModes = [...team.baseModes, ...team.specialtyModes]

	// 使用配置化的任务模式映射进行推荐
	for (const mapping of TASK_MODE_MAPPING) {
		const hasKeyword = mapping.keywords.some((keyword) => taskLower.includes(keyword))
		if (hasKeyword && allTeamModes.includes(mapping.mode)) {
			return {
				mode: mapping.mode,
				member: getModeDisplayName(mapping.mode),
				reason: `${mapping.reason}，推荐${getModeDisplayName(mapping.mode)}`,
			}
		}
	}

	// 默认推荐团队中的第一个基础模式
	const defaultMode = allTeamModes.find((mode) => BASE_MODE_LIST.includes(mode as any)) || allTeamModes[0]
	if (defaultMode) {
		return {
			mode: defaultMode,
			member: getModeDisplayName(defaultMode),
			reason: `推荐${getModeDisplayName(defaultMode)}为您提供帮助`,
		}
	}

	return null
}

/**
 * 获取团队工作状态
 */
export async function getTeamWorkStatus(context: vscode.ExtensionContext): Promise<TeamWorkStatus | null> {
	return context.globalState.get<TeamWorkStatus>(TEAM_STATE.STORAGE_KEYS.TEAM_WORK_STATUS) || null
}

/**
 * 更新团队工作状态
 */
export async function updateTeamWorkStatus(
	context: vscode.ExtensionContext,
	status: Partial<TeamWorkStatus>,
): Promise<void> {
	const currentStatus = await getTeamWorkStatus(context)
	const newStatus: TeamWorkStatus = {
		currentTeam: currentStatus?.currentTeam || DEFAULT_TEAM_SLUG,
		activeMembers: currentStatus?.activeMembers || [],
		...currentStatus,
		...status,
		lastActivity: new Date().toISOString(),
	}
	await context.globalState.update(TEAM_STATE.STORAGE_KEYS.TEAM_WORK_STATUS, newStatus)
}

/**
 * 记录团队切换事件
 */
export async function recordTeamSwitch(
	context: vscode.ExtensionContext,
	event: Omit<TeamSwitchEvent, "timestamp">,
): Promise<void> {
	const fullEvent: TeamSwitchEvent = {
		...event,
		timestamp: new Date().toISOString(),
	}

	// 获取历史记录
	const history = context.globalState.get<TeamSwitchEvent[]>(TEAM_STATE.STORAGE_KEYS.TEAM_SWITCH_HISTORY) || []

	// 添加新事件，保留最近配置的条数记录
	history.unshift(fullEvent)
	if (history.length > TEAM_STATE.MAX_SWITCH_HISTORY) {
		history.splice(TEAM_STATE.MAX_SWITCH_HISTORY)
	}

	await context.globalState.update(TEAM_STATE.STORAGE_KEYS.TEAM_SWITCH_HISTORY, history)
}

/**
 * 自动切换团队
 */
export async function autoSwitchTeam(
	context: vscode.ExtensionContext,
	workspaceRoot: string,
	customTeams?: TeamConfig[],
): Promise<{ switched: boolean; team?: string; reason?: string }> {
	const detection = await detectProjectTeam(workspaceRoot, customTeams)

	if (!detection.recommendedTeam || detection.confidence < CONFIDENCE_THRESHOLDS.AUTO_SWITCH_THRESHOLD) {
		return { switched: false }
	}

	const currentStatus = await getTeamWorkStatus(context)

	// 如果当前团队已经是推荐团队，不需要切换
	if (currentStatus?.currentTeam === detection.recommendedTeam) {
		return { switched: false }
	}

	// 执行团队切换
	await updateTeamWorkStatus(context, {
		currentTeam: detection.recommendedTeam,
		activeMembers: [],
		currentTask: undefined,
		workflowStage: "项目分析",
	})

	// 记录切换事件
	await recordTeamSwitch(context, {
		fromTeam: currentStatus?.currentTeam,
		toTeam: detection.recommendedTeam,
		reason: "auto-detection",
		projectContext: detection.context,
	})

	return {
		switched: true,
		team: detection.recommendedTeam,
		reason: `基于项目特征自动切换到${getTeamBySlug(detection.recommendedTeam, customTeams)?.name}`,
	}
}

// 默认团队slug
export const defaultTeamSlug = DEFAULT_TEAM_SLUG
