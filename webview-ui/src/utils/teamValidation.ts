import { ExtendedTeamConfig, TeamMemberConfig } from "@roo-code/types"

/**
 * 团队管理相关的验证工具函数
 * 提供统一的数据验证和错误处理逻辑
 */

/**
 * 验证团队基本信息
 */
export interface TeamValidationResult {
	isValid: boolean
	errors: Record<string, string>
	warnings?: string[]
}

/**
 * 验证团队配置
 * @param teamData 团队数据
 * @param existingTeams 现有团队列表（用于检查重复）
 * @param isEditing 是否为编辑模式
 */
export function validateTeamConfig(
	teamData: Partial<ExtendedTeamConfig>,
	existingTeams: ExtendedTeamConfig[] = [],
	isEditing = false,
): TeamValidationResult {
	const errors: Record<string, string> = {}
	const warnings: string[] = []

	// 验证团队标识
	if (!teamData.slug?.trim()) {
		errors.slug = "团队标识不能为空"
	} else if (!/^[a-zA-Z0-9-]+$/.test(teamData.slug)) {
		errors.slug = "团队标识只能包含字母、数字和短横线"
	} else if (!isEditing && existingTeams.some((team) => team.slug === teamData.slug)) {
		errors.slug = "团队标识已存在"
	}

	// 验证团队名称
	if (!teamData.name?.trim()) {
		errors.name = "团队名称不能为空"
	} else if (teamData.name.length > 50) {
		errors.name = "团队名称不能超过50个字符"
	}

	// 验证描述长度
	if (teamData.description && teamData.description.length > 200) {
		errors.description = "团队描述不能超过200个字符"
	}

	// 验证成员配置
	if (!teamData.baseModes?.length && !teamData.specialtyModes?.length && !teamData.members?.length) {
		errors.members = "团队至少需要一个成员"
	}

	// 验证颜色格式
	if (teamData.color && !/^#[0-9A-Fa-f]{6}$/.test(teamData.color)) {
		errors.color = "颜色格式无效，请使用十六进制格式（如 #007ACC）"
	}

	// 检查工作流程
	if (teamData.collaboration?.workflow) {
		if (teamData.collaboration.workflow.length === 0) {
			warnings.push("建议至少设置一个工作流程步骤")
		} else if (teamData.collaboration.workflow.some((step) => !step.trim())) {
			errors.workflow = "工作流程步骤不能为空"
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
		warnings: warnings.length > 0 ? warnings : undefined,
	}
}

/**
 * 验证团队成员配置
 */
export function validateTeamMember(memberData: Partial<TeamMemberConfig>): TeamValidationResult {
	const errors: Record<string, string> = {}

	if (!memberData.modeSlug?.trim()) {
		errors.modeSlug = "成员模式不能为空"
	}

	if (memberData.displayName && memberData.displayName.length > 30) {
		errors.displayName = "显示名称不能超过30个字符"
	}

	if (memberData.priority !== undefined && (memberData.priority < 0 || memberData.priority > 99)) {
		errors.priority = "优先级必须在0-99之间"
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

/**
 * 生成团队统计信息
 */
export interface TeamStats {
	totalMembers: number
	activeMembers: number
	basicModes: number
	specialtyModes: number
	hasWorkflow: boolean
	completionRate: number // 配置完整度百分比
}

/**
 * 计算团队统计信息
 */
export function calculateTeamStats(team: ExtendedTeamConfig): TeamStats {
	const totalMembers = team.baseModes.length + team.specialtyModes.length
	const activeMembers = team.members?.filter((m) => m.isActive).length || totalMembers
	const basicModes = team.baseModes.length
	const specialtyModes = team.specialtyModes.length
	const hasWorkflow = !!(team.collaboration?.workflow && team.collaboration.workflow.length > 0)

	// 计算配置完整度
	let completionScore = 0
	const maxScore = 10

	// 基本信息 (4分)
	if (team.name) completionScore += 1
	if (team.description) completionScore += 1
	if (team.iconName) completionScore += 1
	if (team.color) completionScore += 1

	// 成员配置 (3分)
	if (totalMembers > 0) completionScore += 1
	if (totalMembers >= 3) completionScore += 1
	if (team.members && team.members.length > 0) completionScore += 1

	// 协作配置 (3分)
	if (hasWorkflow) completionScore += 1
	if (team.collaboration?.taskAssignment) completionScore += 1
	if (team.collaboration?.workflow && team.collaboration.workflow.length >= 3) completionScore += 1

	const completionRate = Math.round((completionScore / maxScore) * 100)

	return {
		totalMembers,
		activeMembers,
		basicModes,
		specialtyModes,
		hasWorkflow,
		completionRate,
	}
}

/**
 * 生成团队建议
 */
export function generateTeamSuggestions(team: ExtendedTeamConfig): string[] {
	const suggestions: string[] = []
	const stats = calculateTeamStats(team)

	if (stats.totalMembers < 2) {
		suggestions.push("建议添加更多成员以提高团队协作效率")
	}

	if (!stats.hasWorkflow) {
		suggestions.push("建议设置工作流程以规范团队协作")
	}

	if (!team.description) {
		suggestions.push("建议添加团队描述以便其他成员了解团队职责")
	}

	if (stats.basicModes === 0) {
		suggestions.push("建议至少添加一个基础模式成员（如架构师或编程助手）")
	}

	if (stats.completionRate < 70) {
		suggestions.push("团队配置不够完整，建议完善基本信息和协作设置")
	}

	return suggestions
}

/**
 * 格式化团队标识
 * 自动转换为符合规范的格式
 */
export function formatTeamSlug(input: string): string {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // 移除非法字符
		.replace(/\s+/g, "-") // 空格转为短横线
		.replace(/-+/g, "-") // 多个短横线合并为一个
		.replace(/^-|-$/g, "") // 移除首尾短横线
}

/**
 * 生成唯一的团队标识
 */
export function generateUniqueSlug(baseName: string, existingTeams: ExtendedTeamConfig[]): string {
	const baseSlug = formatTeamSlug(baseName)
	const existingSlugs = new Set(existingTeams.map((team) => team.slug))

	if (!existingSlugs.has(baseSlug)) {
		return baseSlug
	}

	// 添加数字后缀
	let counter = 1
	let uniqueSlug = `${baseSlug}-${counter}`

	while (existingSlugs.has(uniqueSlug)) {
		counter++
		uniqueSlug = `${baseSlug}-${counter}`
	}

	return uniqueSlug
}
