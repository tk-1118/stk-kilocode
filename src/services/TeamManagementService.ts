import * as vscode from "vscode"
import {
	TeamConfig,
	ExtendedTeamConfig,
	TeamMemberConfig,
	TeamManagementAction,
	ModeConfig,
	DEFAULT_TEAMS,
} from "@roo-code/types"
import { getAllModes, getModeBySlug } from "../shared/modes"

/**
 * 团队管理服务
 * 负责团队的创建、编辑、删除以及成员管理
 *
 * 核心功能：
 * - 团队生命周期管理（CRUD操作）
 * - 成员动态管理和权限控制
 * - 数据持久化和状态同步
 * - 内置和自定义团队的统一管理
 * - 模式库集成和扩展支持
 * - 导入导出功能支持
 *
 * 数据存储：
 * - 使用 VSCode ExtensionContext.globalState 进行数据持久化
 * - 支持懒加载和缓存机制
 * - 自动数据验证和错误恢复
 */
export class TeamManagementService {
	private context: vscode.ExtensionContext
	private customTeams: ExtendedTeamConfig[] = []

	// 存储键常量
	private static readonly STORAGE_KEY_TEAMS = "customTeams"
	private static readonly STORAGE_KEY_MODES = "customModes"

	constructor(context: vscode.ExtensionContext) {
		this.context = context
		// 不在构造函数中加载数据，而是在需要时懒加载
	}

	/**
	 * 加载自定义团队配置
	 */
	private async loadCustomTeams(): Promise<void> {
		const savedTeams = this.context.globalState.get<ExtendedTeamConfig[]>("customTeams", [])
		console.log(`[TeamManagementService] 从globalState加载团队数据，数量: ${savedTeams.length}`)
		console.log(
			`[TeamManagementService] 加载的团队列表:`,
			savedTeams.map((t) => t.slug),
		)
		this.customTeams = savedTeams
	}

	/**
	 * 保存自定义团队配置
	 */
	private async saveCustomTeams(): Promise<void> {
		await this.context.globalState.update("customTeams", this.customTeams)
	}

	/**
	 * 确保数据已加载
	 */
	private dataLoaded = false
	private async ensureDataLoaded(): Promise<void> {
		if (!this.dataLoaded) {
			await this.loadCustomTeams()
			this.dataLoaded = true
		}
	}

	/**
	 * 获取所有团队（内置 + 自定义）
	 */
	public async getAllTeams(): Promise<ExtendedTeamConfig[]> {
		await this.ensureDataLoaded()
		// 将内置团队转换为扩展格式
		const builtInTeams: ExtendedTeamConfig[] = DEFAULT_TEAMS.map((team) => ({
			...team,
			isBuiltIn: true,
			members: this.convertModesToMembers([...team.baseModes, ...team.specialtyModes]),
			createdAt: "2024-01-01T00:00:00.000Z",
			version: "1.0.0",
		}))

		return [...builtInTeams, ...this.customTeams]
	}

	/**
	 * 根据slug获取团队
	 */
	public async getTeamBySlug(slug: string): Promise<ExtendedTeamConfig | undefined> {
		const allTeams = await this.getAllTeams()
		return allTeams.find((team) => team.slug === slug)
	}

	/**
	 * 创建新团队
	 */
	public async createTeam(teamData: Partial<ExtendedTeamConfig>): Promise<ExtendedTeamConfig> {
		console.log(`[TeamManagementService] 开始创建团队: ${teamData.slug}`)

		await this.ensureDataLoaded()
		console.log(`[TeamManagementService] 创建团队前，当前团队数量: ${this.customTeams.length}`)
		console.log(
			`[TeamManagementService] 创建团队前，当前团队列表:`,
			this.customTeams.map((t) => t.slug),
		)

		// 验证团队slug唯一性
		if (await this.getTeamBySlug(teamData.slug!)) {
			throw new Error(`团队标识 "${teamData.slug}" 已存在`)
		}

		const baseModes = teamData.baseModes || ["architect", "code"]
		const specialtyModes = teamData.specialtyModes || []
		const allModes = [...baseModes, ...specialtyModes]

		const newTeam: ExtendedTeamConfig = {
			slug: teamData.slug!,
			name: teamData.name!,
			description: teamData.description || "",
			iconName: teamData.iconName || "codicon-organization",
			color: teamData.color || "#007ACC",
			baseModes,
			specialtyModes,
			members:
				teamData.members && teamData.members.length > 0
					? teamData.members
					: this.convertModesToMembers(allModes),
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: "1.0.0",
			collaboration: teamData.collaboration || {
				workflow: ["需求分析", "设计开发", "测试部署"],
				taskAssignment: "auto",
			},
		}

		this.customTeams.push(newTeam)
		console.log(`[TeamManagementService] 创建团队后，当前团队数量: ${this.customTeams.length}`)
		console.log(
			`[TeamManagementService] 创建团队后，当前团队列表:`,
			this.customTeams.map((t) => t.slug),
		)

		await this.saveCustomTeams()
		console.log(`[TeamManagementService] 团队创建完成并已保存`)

		// 验证保存是否成功
		const savedTeams = this.context.globalState.get<ExtendedTeamConfig[]>("customTeams", [])
		console.log(`[TeamManagementService] 验证创建保存结果，globalState中的团队数量: ${savedTeams.length}`)
		console.log(
			`[TeamManagementService] 验证创建保存结果，globalState中的团队列表:`,
			savedTeams.map((t) => t.slug),
		)

		return newTeam
	}

	/**
	 * 更新团队
	 */
	public async updateTeam(slug: string, updates: Partial<ExtendedTeamConfig>): Promise<ExtendedTeamConfig> {
		await this.ensureDataLoaded()
		const teamIndex = this.customTeams.findIndex((team) => team.slug === slug)
		if (teamIndex === -1) {
			throw new Error(`团队 "${slug}" 不存在或为内置团队，无法修改`)
		}

		const updatedTeam: ExtendedTeamConfig = {
			...this.customTeams[teamIndex],
			...updates,
			updatedAt: new Date().toISOString(),
		}

		this.customTeams[teamIndex] = updatedTeam
		await this.saveCustomTeams()

		return updatedTeam
	}

	/**
	 * 删除团队
	 */
	public async deleteTeam(slug: string): Promise<boolean> {
		console.log(`[TeamManagementService] 开始删除团队: ${slug}`)

		await this.ensureDataLoaded()
		console.log(`[TeamManagementService] 数据加载完成，当前团队数量: ${this.customTeams.length}`)
		console.log(
			`[TeamManagementService] 当前团队列表:`,
			this.customTeams.map((t) => t.slug),
		)

		const teamIndex = this.customTeams.findIndex((team) => team.slug === slug)
		if (teamIndex === -1) {
			console.log(`[TeamManagementService] 团队 "${slug}" 不存在`)
			throw new Error(`团队 "${slug}" 不存在或为内置团队，无法删除`)
		}

		console.log(`[TeamManagementService] 找到团队，索引: ${teamIndex}`)
		this.customTeams.splice(teamIndex, 1)
		console.log(`[TeamManagementService] 删除后团队数量: ${this.customTeams.length}`)
		console.log(
			`[TeamManagementService] 删除后团队列表:`,
			this.customTeams.map((t) => t.slug),
		)

		await this.saveCustomTeams()
		console.log(`[TeamManagementService] 团队删除完成并已保存`)

		// 验证保存是否成功
		const savedTeams = this.context.globalState.get<ExtendedTeamConfig[]>("customTeams", [])
		console.log(`[TeamManagementService] 验证保存结果，globalState中的团队数量: ${savedTeams.length}`)
		console.log(
			`[TeamManagementService] 验证保存结果，globalState中的团队列表:`,
			savedTeams.map((t) => t.slug),
		)

		return true
	}

	/**
	 * 复制团队
	 */
	public async duplicateTeam(sourceSlug: string, newSlug: string, newName: string): Promise<ExtendedTeamConfig> {
		await this.ensureDataLoaded()
		const sourceTeam = await this.getTeamBySlug(sourceSlug)
		if (!sourceTeam) {
			throw new Error(`源团队 "${sourceSlug}" 不存在`)
		}

		if (await this.getTeamBySlug(newSlug)) {
			throw new Error(`团队标识 "${newSlug}" 已存在`)
		}

		const duplicatedTeam: ExtendedTeamConfig = {
			...sourceTeam,
			slug: newSlug,
			name: newName,
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		this.customTeams.push(duplicatedTeam)
		await this.saveCustomTeams()

		return duplicatedTeam
	}

	/**
	 * 向团队添加成员
	 */
	public async addMemberToTeam(
		teamSlug: string,
		modeSlug: string,
		memberConfig?: Partial<TeamMemberConfig>,
	): Promise<ExtendedTeamConfig> {
		await this.ensureDataLoaded()
		const team = await this.getTeamBySlug(teamSlug)
		if (!team || team.isBuiltIn) {
			throw new Error(`团队 "${teamSlug}" 不存在或为内置团队，无法修改`)
		}

		// 检查模式是否存在
		const mode = getModeBySlug(modeSlug, await this.getCustomModes())
		if (!mode) {
			throw new Error(`模式 "${modeSlug}" 不存在`)
		}

		// 检查成员是否已存在
		const existingMember = team.members?.find((member) => member.modeSlug === modeSlug)
		if (existingMember) {
			throw new Error(`成员 "${modeSlug}" 已在团队中`)
		}

		const newMember: TeamMemberConfig = {
			modeSlug,
			displayName: memberConfig?.displayName || mode.name,
			isActive: memberConfig?.isActive ?? true,
			permissions: memberConfig?.permissions || [],
			priority: memberConfig?.priority || 0,
		}

		const updatedTeam = await this.updateTeam(teamSlug, {
			members: [...(team.members || []), newMember],
			// 同时更新baseModes或specialtyModes
			baseModes: this.isBasicMode(modeSlug) ? [...new Set([...team.baseModes, modeSlug])] : team.baseModes,
			specialtyModes: !this.isBasicMode(modeSlug)
				? [...new Set([...team.specialtyModes, modeSlug])]
				: team.specialtyModes,
		})

		return updatedTeam
	}

	/**
	 * 从团队移除成员
	 */
	public async removeMemberFromTeam(teamSlug: string, modeSlug: string): Promise<ExtendedTeamConfig> {
		await this.ensureDataLoaded()
		const team = await this.getTeamBySlug(teamSlug)
		if (!team || team.isBuiltIn) {
			throw new Error(`团队 "${teamSlug}" 不存在或为内置团队，无法修改`)
		}

		const updatedTeam = await this.updateTeam(teamSlug, {
			members: team.members?.filter((member) => member.modeSlug !== modeSlug) || [],
			// 同时更新baseModes或specialtyModes
			baseModes: team.baseModes.filter((mode) => mode !== modeSlug),
			specialtyModes: team.specialtyModes.filter((mode) => mode !== modeSlug),
		})

		return updatedTeam
	}

	/**
	 * 获取可用的模式列表
	 */
	public async getAvailableModes(): Promise<ModeConfig[]> {
		const customModes = await this.getCustomModes()
		return getAllModes(customModes)
	}

	/**
	 * 获取团队可添加的模式（排除已有成员）
	 */
	public async getAvailableModesForTeam(teamSlug: string): Promise<ModeConfig[]> {
		await this.ensureDataLoaded()
		const team = await this.getTeamBySlug(teamSlug)
		if (!team) {
			return []
		}

		const allModes = await this.getAvailableModes()
		const existingModes = new Set([...team.baseModes, ...team.specialtyModes])

		return allModes.filter((mode) => !existingModes.has(mode.slug))
	}

	/**
	 * 更新团队成员配置
	 */
	public async updateTeamMember(
		teamSlug: string,
		modeSlug: string,
		memberConfig: Partial<TeamMemberConfig>,
	): Promise<ExtendedTeamConfig> {
		await this.ensureDataLoaded()
		const team = await this.getTeamBySlug(teamSlug)
		if (!team || team.isBuiltIn) {
			throw new Error(`团队 "${teamSlug}" 不存在或为内置团队，无法修改`)
		}

		const memberIndex = team.members?.findIndex((member) => member.modeSlug === modeSlug)
		if (memberIndex === -1 || memberIndex === undefined) {
			throw new Error(`团队成员 "${modeSlug}" 不存在`)
		}

		const updatedMembers = [...(team.members || [])]
		updatedMembers[memberIndex] = {
			...updatedMembers[memberIndex],
			...memberConfig,
		}

		const updatedTeam = await this.updateTeam(teamSlug, {
			members: updatedMembers,
		})

		return updatedTeam
	}

	/**
	 * 创建自定义模式
	 */
	public async createCustomMode(modeConfig: Partial<ModeConfig>): Promise<ModeConfig> {
		if (!modeConfig.slug || !modeConfig.name) {
			throw new Error("模式标识和名称是必需的")
		}

		// 检查slug是否已存在
		const existingModes = await this.getCustomModes()
		if (existingModes.find((mode) => mode.slug === modeConfig.slug)) {
			throw new Error(`模式标识 "${modeConfig.slug}" 已存在`)
		}

		const newMode: ModeConfig = {
			slug: modeConfig.slug,
			name: modeConfig.name,
			roleDefinition: modeConfig.roleDefinition || "",
			groups: modeConfig.groups || ["read", "edit"],
			source: "project" as const,
			iconName: modeConfig.iconName || "codicon-person",
		}

		const updatedModes = [...existingModes, newMode]
		await this.context.globalState.update("customModes", updatedModes)

		return newMode
	}

	/**
	 * 更新自定义模式
	 */
	public async updateCustomMode(slug: string, updates: Partial<ModeConfig>): Promise<ModeConfig> {
		const customModes = await this.getCustomModes()
		const modeIndex = customModes.findIndex((mode) => mode.slug === slug)

		if (modeIndex === -1) {
			throw new Error(`模式 "${slug}" 不存在或不是自定义模式`)
		}

		const updatedMode: ModeConfig = {
			...customModes[modeIndex],
			...updates,
		}

		const updatedModes = [...customModes]
		updatedModes[modeIndex] = updatedMode

		await this.context.globalState.update("customModes", updatedModes)

		return updatedMode
	}

	/**
	 * 删除自定义模式
	 */
	public async deleteCustomMode(slug: string): Promise<boolean> {
		const customModes = await this.getCustomModes()
		const modeIndex = customModes.findIndex((mode) => mode.slug === slug)

		if (modeIndex === -1) {
			throw new Error(`模式 "${slug}" 不存在或不是自定义模式`)
		}

		// 检查是否有团队在使用这个模式
		const allTeams = await this.getAllTeams()
		const teamsUsingMode = allTeams.filter(
			(team) =>
				team.baseModes.includes(slug) ||
				team.specialtyModes.includes(slug) ||
				team.members?.some((member) => member.modeSlug === slug),
		)

		if (teamsUsingMode.length > 0) {
			const teamNames = teamsUsingMode.map((team) => team.name).join(", ")
			// 创建一个包含详细信息的错误对象，便于上层调用者处理
			const error = new Error(`无法删除模式 "${slug}"，以下团队正在使用: ${teamNames}`)
			// 添加错误类型标识，便于上层识别和处理
			;(error as any).code = "MODE_IN_USE_BY_TEAMS"
			;(error as any).teamsUsingMode = teamsUsingMode
			;(error as any).modeSlug = slug
			throw error
		}

		const updatedModes = customModes.filter((mode) => mode.slug !== slug)
		await this.context.globalState.update("customModes", updatedModes)

		return true
	}

	/**
	 * 根据slug获取模式（包括内置和自定义）
	 */
	public async getModeBySlug(slug: string): Promise<ModeConfig | undefined> {
		const allModes = await this.getAvailableModes()
		return allModes.find((mode) => mode.slug === slug)
	}

	/**
	 * 获取自定义模式
	 */
	private async getCustomModes(): Promise<ModeConfig[]> {
		return this.context.globalState.get<ModeConfig[]>("customModes", [])
	}

	/**
	 * 判断是否为基础模式
	 */
	private isBasicMode(modeSlug: string): boolean {
		const basicModes = ["architect", "code", "ask", "debug", "orchestrator"]
		return basicModes.includes(modeSlug)
	}

	/**
	 * 将模式slug列表转换为成员配置
	 */
	private convertModesToMembers(modeSlugs: string[]): TeamMemberConfig[] {
		// 内置模式名称映射
		const modeNames: Record<string, string> = {
			architect: "架构师",
			code: "编程助手",
			ask: "问答助手",
			debug: "调试专家",
			orchestrator: "协调者",
		}

		return modeSlugs.map((slug, index) => ({
			modeSlug: slug,
			displayName: modeNames[slug] || slug,
			isActive: true,
			priority: index,
			permissions: [],
		}))
	}

	/**
	 * 导出团队配置
	 */
	public async exportTeam(teamSlug: string): Promise<string> {
		await this.ensureDataLoaded()
		const team = await this.getTeamBySlug(teamSlug)
		if (!team) {
			throw new Error(`团队 "${teamSlug}" 不存在`)
		}

		return JSON.stringify(team, null, 2)
	}

	/**
	 * 导入团队配置
	 */
	public async importTeam(teamConfigJson: string): Promise<ExtendedTeamConfig> {
		try {
			const teamConfig = JSON.parse(teamConfigJson) as ExtendedTeamConfig

			// 验证配置格式
			if (!teamConfig.slug || !teamConfig.name) {
				throw new Error("团队配置格式无效")
			}

			// 检查slug冲突
			if (await this.getTeamBySlug(teamConfig.slug)) {
				throw new Error(`团队标识 "${teamConfig.slug}" 已存在`)
			}

			return await this.createTeam(teamConfig)
		} catch (error) {
			throw new Error(`导入团队失败: ${error instanceof Error ? error.message : "未知错误"}`)
		}
	}
}
