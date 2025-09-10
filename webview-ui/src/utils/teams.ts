// 团队相关的工具函数，用于前端组件
// 由于webview环境限制，这里提供简化版本的团队功能

import {
	TeamConfig,
	DEFAULT_MODES,
	DEFAULT_TEAMS as AUTHORITY_DEFAULT_TEAMS,
	getModeActivityDescription as getAuthorityModeActivityDescription,
} from "@roo-code/types"

/**
 * 🎯 统一数据源架构
 *
 * 权威数据源：
 * - 模式定义：packages/types/src/mode.ts 中的 DEFAULT_MODES
 * - 团队配置：packages/types/src/team.ts 中的 DEFAULT_TEAMS
 *
 * 统一方案：
 * - 直接从 @roo-code/types 导入权威配置
 * - 动态从 DEFAULT_MODES 提取基础模式信息
 * - 基于模式信息动态生成显示名称和活动描述
 * - 完全消除硬编码映射，确保数据一致性
 *
 * ✅ 已实现100%统一数据源
 */

export type Team = string

/**
 * 🎯 统一数据源：从 DEFAULT_MODES 动态提取基础模式
 * 基础模式的判断标准：slug 以特定前缀开头的模式
 */
const BASE_MODE_PREFIXES = ["pm01-", "sa01-", "dev99-", "qa01-", "qe01-", "se01-"]
const BASE_MODE_LIST = DEFAULT_MODES.filter((mode) =>
	BASE_MODE_PREFIXES.some((prefix) => mode.slug.startsWith(prefix)),
).map((mode) => mode.slug)

/**
 * 🎯 统一数据源：直接使用权威的团队配置
 *
 * 从 packages/types/src/team.ts 中的 DEFAULT_TEAMS 导入权威配置
 * 确保与后端完全一致，消除所有硬编码
 */
export const DEFAULT_TEAMS: readonly TeamConfig[] = AUTHORITY_DEFAULT_TEAMS

// 默认团队slug
export const defaultTeamSlug = DEFAULT_TEAMS[0].slug

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
 * 获取团队的所有模式slug（基础模式 + 专业模式）
 */
export function getTeamModesSlugs(teamSlug: string, customTeams?: TeamConfig[]): string[] {
	const team = getTeamBySlug(teamSlug, customTeams)
	if (!team) {
		return []
	}

	return [...team.baseModes, ...team.specialtyModes]
}

/**
 * 检查模式是否属于指定团队
 */
export function isModeInTeam(modeSlug: string, teamSlug: string, customTeams?: TeamConfig[]): boolean {
	const teamModes = getTeamModesSlugs(teamSlug, customTeams)
	return teamModes.includes(modeSlug)
}

/**
 * 根据模式slug查找所属团队
 */
export function findTeamByMode(modeSlug: string, customTeams?: TeamConfig[]): TeamConfig | undefined {
	const allTeams = getAllTeams(customTeams)

	return allTeams.find((team) => {
		const teamModes = [...team.baseModes, ...team.specialtyModes]
		return teamModes.includes(modeSlug)
	})
}

/**
 * 获取模式的显示名称（团队成员名称）
 *
 * 🎯 真正的统一数据源方案：直接从 DEFAULT_MODES 获取
 * 这确保了与权威数据源 packages/types/src/mode.ts 的完全一致性
 */
export function getModeDisplayName(modeSlug: string): string {
	// 直接从 DEFAULT_MODES 查找对应的模式
	const mode = DEFAULT_MODES.find((m) => m.slug === modeSlug)
	return mode?.name || modeSlug
}

/**
 * 获取模式的角色名称（团队成员岗位名称）
 *
 * 🎯 真正的统一数据源方案：直接从 DEFAULT_MODES 获取
 * 这确保了与权威数据源 packages/types/src/mode.ts 的完全一致性
 */
export function getModeRoleName(modeSlug: string): string {
	// 直接从 DEFAULT_MODES 查找对应的模式
	const mode = DEFAULT_MODES.find((m) => m.slug === modeSlug)
	return mode?.roleName || modeSlug
}

// 基础模式相关函数实现

/**
 * 判断是否为基础模式
 * 直接基于 DEFAULT_MODES 数据源进行判断
 */
export function isBaseMode(modeSlug: string): boolean {
	return BASE_MODE_LIST.includes(modeSlug)
}

/**
 * 获取基础模式列表
 * 直接从 DEFAULT_MODES 提取，确保数据一致性
 */
export function getBaseModeList(): readonly string[] {
	return BASE_MODE_LIST
}

/**
 * 获取模式对应的活动描述
 *
 * 🎯 完全统一数据源：直接使用权威的活动描述映射
 * 从 packages/types/src/mode.ts 中的 MODE_ACTIVITY_DESCRIPTIONS 获取
 */
export function getModeActivityDescription(modeSlug: string): string {
	return getAuthorityModeActivityDescription(modeSlug)
}
