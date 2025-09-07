// 团队相关的工具函数，用于前端组件
// 由于webview环境限制，这里提供简化版本的团队功能

import { TeamConfig } from "@roo-code/types"

export type Team = string

// 默认团队配置（前端版本）
export const DEFAULT_TEAMS: readonly TeamConfig[] = [
	{
		slug: "frontend-team",
		name: "Vue3+TS虚拟前端开发团队",
		description: "专注于用户界面和用户体验的开发团队",
		iconName: "codicon-browser",
		color: "#61DAFB", // React蓝色
		baseModes: ["architect", "code", "ask", "debug"],
		specialtyModes: [], // 前端专业模式待定义
		collaboration: {
			workflow: ["需求分析", "UI设计", "组件开发", "页面集成", "测试优化"],

			taskAssignment: "auto",
		},
	},
	{
		slug: "backend-team",
		name: "DDD虚拟后端开发团队",
		description: "专注于服务端架构和业务逻辑的开发团队",
		iconName: "codicon-server",
		color: "#68217A", // Spring紫色
		baseModes: ["architect", "code", "ask", "debug"],
		specialtyModes: [
			"product-project-coder-agent",
			"northbound-app-event-publisher-coder-agent",
			"northbound-cqrs-application-service-coder-agent",
			"northbound-api-controller-coder-agent",
			"northbound-app-event-subscriber-coder-agent",
			"orthbound-client-provider-coder-agent",
			"value-object-and-java-primitive-data-types-mapping-coder-agent",
			"domain-model-and-value-object-coder-agent",
			"domain-service-coder-agent",
			"domain-event-publisher-coder-agent",
			"outhbound-data-model-coder-agent",
			"outhbound-respository-coder-agent",
			"outhbound-resource-gateway-coder-agent",
			"outhbound-event-publish-adapter-coder-agent",
			"read-model-coder-agent",
			"client-coder-agent",
		],
		collaboration: {
			workflow: ["需求分析", "架构设计", "领域建模", "服务开发", "接口联调", "性能优化"],
			taskAssignment: "auto",
		},
	},
	{
		slug: "fullstack-team",
		name: "全栈虚拟开发团队",
		description: "具备前后端全栈开发能力的综合团队",
		iconName: "codicon-layers",
		color: "#FF6B6B", // 珊瑚红
		baseModes: ["architect", "code", "ask", "debug", "orchestrator"],
		specialtyModes: [
			// 产品项目层
			"product-project-coder-agent",
			// 北向网关层（Northbound）
			"northbound-app-event-publisher-coder-agent",
			"northbound-cqrs-business-service-and-application-service-coder-agent",
			"northbound-api-controller-coder-agent",
			"northbound-app-event-subscriber-coder-agent",
			"orthbound-client-provider-coder-agent",
			// 领域层（Domain）
			"value-object-and-java-primitive-data-types-mapping-coder-agent",
			"domain-model-and-value-object-coder-agent",
			"domain-service-coder-agent",
			"domain-event-publisher-coder-agent",
			// 南向网关层（Southbound）
			"outhbound-data-model-coder-agent",
			"outhbound-respository-coder-agent",
			"outhbound-resource-gateway-coder-agent",
			"outhbound-event-publish-adapter-coder-agent",
			"read-model-coder-agent",
			// 客户端层
			"client-coder-agent",
		],
		collaboration: {
			workflow: ["项目规划", "架构设计", "前端开发", "后端开发", "联调测试", "部署上线"],
			taskAssignment: "hybrid",
		},
	},
] as const

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
 */
export function getModeDisplayName(modeSlug: string): string {
	const displayNames: Record<string, string> = {
		architect: "架构师",
		code: "开发工程师",
		ask: "技术顾问",
		debug: "调试专家",
		orchestrator: "协调员",
		"product-project-coder-agent": "产品项目结构开发同学",
		"northbound-app-event-publisher-coder-agent": "应用事件发布开发同学",
		"northbound-cqrs-application-service-coder-agent": "CQRS应用服务开发同学",
		"northbound-api-controller-coder-agent": "API控制器开发同学",
		"northbound-app-event-subscriber-coder-agent": "应用事件订阅开发同学",
		"orthbound-client-provider-coder-agent": "客户端提供开发同学",
		"value-object-and-java-primitive-data-types-mapping-coder-agent": "值对象映射开发同学",
		"domain-model-and-value-object-coder-agent": "领域模型开发同学",
		"domain-service-coder-agent": "领域服务开发同学",
		"domain-event-publisher-coder-agent": "领域事件发布开发同学",
		"outhbound-data-model-coder-agent": "数据模型开发同学",
		"outhbound-respository-coder-agent": "仓储开发同学",
		"outhbound-resource-gateway-coder-agent": "资源网关开发同学",
		"outhbound-event-publish-adapter-coder-agent": "事件发布适配开发同学",
		"read-model-coder-agent": "读模型开发同学",
		"client-coder-agent": "客户端开发同学",
	}

	return displayNames[modeSlug] || modeSlug
}

/**
 * 获取模式对应的活动描述
 */
export function getModeActivityDescription(modeSlug: string): string {
	const activities: Record<string, string> = {
		// 基础模式活动
		architect: "开始进行架构设计和规划",
		code: "开始编写和实现代码",
		debug: "开始调试和问题诊断",
		ask: "开始提供技术咨询",
		orchestrator: "开始协调团队工作",

		// 后端专业模式活动
		"product-project-coder-agent": "开始创建产品项目结构",
		"northbound-app-event-publisher-coder-agent": "开始实现应用事件发布机制",
		"northbound-cqrs-application-service-coder-agent": "开始实现CQRS应用服务",
		"northbound-api-controller-coder-agent": "开始开发API控制器",
		"northbound-app-event-subscriber-coder-agent": "开始实现应用事件订阅处理",
		"orthbound-client-provider-coder-agent": "开始开发客户端提供服务",
		"value-object-and-java-primitive-data-types-mapping-coder-agent": "开始设计值对象和数据类型映射",
		"domain-model-and-value-object-coder-agent": "开始设计领域模型和值对象",
		"domain-service-coder-agent": "开始实现领域服务逻辑",
		"domain-event-publisher-coder-agent": "开始实现领域事件发布机制",
		"outhbound-data-model-coder-agent": "开始设计外部数据模型",
		"outhbound-respository-coder-agent": "开始实现数据仓储层",
		"outhbound-resource-gateway-coder-agent": "开始开发资源网关",
		"outhbound-event-publish-adapter-coder-agent": "开始实现事件发布适配器",
		"read-model-coder-agent": "开始构建读模型",
		"client-coder-agent": "开始开发客户端功能",
	}

	return activities[modeSlug] || "开始处理任务"
}
