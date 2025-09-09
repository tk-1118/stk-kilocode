/**
 * 统一的模式常量管理模块
 * 基于 packages/types/src/mode.ts 中的 DEFAULT_MODES 作为权威数据源
 *
 * 这个模块提供：
 * 1. 从 DEFAULT_MODES 提取的所有模式常量
 * 2. 模式分类和映射关系
 * 3. 显示名称和描述信息
 * 4. 类型安全的常量定义
 */

import {
	DEFAULT_MODES,
	ModeConfig,
	MODE_ACTIVITY_DESCRIPTIONS as AUTHORITY_MODE_ACTIVITY_DESCRIPTIONS,
	getModeActivityDescription as getAuthorityModeActivityDescription,
} from "@roo-code/types"

/**
 * 从 DEFAULT_MODES 提取所有模式的 slug
 */
export const ALL_MODE_SLUGS = DEFAULT_MODES.map((mode) => mode.slug)

/**
 * 基础模式常量（从 DEFAULT_MODES 中提取）
 */
export const BASE_MODES = {
	PM01_PROJECT_MANAGER: "pm01-project-manager",
	SA01_SYSTEM_ARCHITECT: "sa01-system-architect",
	DEV99_CODER: "dev99-coder",
	QA01_UNIT_TEST: "qa01-unit-test",
	QA01_DEBUG: "qa01-debug",
	QE01_QUALITY_CONTROL: "qe01-quality-control",
	SE01_SECURITY_CONTROL: "se01-security-control",
} as const

/**
 * 专业模式常量 - 产品项目层
 */
export const PRODUCT_MODES = {
	PRODUCT_PROJECT: "product-project-coder-agent",
} as const

/**
 * 专业模式常量 - 北向网关层
 */
export const NORTHBOUND_MODES = {
	API_CONTROLLER: "northbound-api-controller-coder-agent",
	APP_EVENT_SUBSCRIBER: "northbound-app-event-subscriber-coder-agent",
	CLIENT_PROVIDER: "northbound-client-provider-coder-agent",
	CQRS_APPLICATION_SERVICE: "northbound-cqrs-business-service-and-application-service-coder-agent",
	APP_EVENT_PUBLISHER: "northbound-app-event-publisher-coder-agent",
} as const

/**
 * 专业模式常量 - 领域层
 */
export const DOMAIN_MODES = {
	DOMAIN_MODEL: "domain-model-and-value-object-coder-agent",
	VALUE_OBJECT_MAPPING: "value-object-and-java-primitive-data-types-mapping-coder-agent",
	DOMAIN_SERVICE: "domain-service-coder-agent",
	DOMAIN_EVENT_PUBLISHER: "domain-event-publisher-coder-agent",
} as const

/**
 * 专业模式常量 - 南向网关层
 */
export const SOUTHBOUND_MODES = {
	DATA_MODEL: "southbound-data-model-coder-agent",
	REPOSITORY: "southbound-respository-coder-agent",
	RESOURCE_GATEWAY: "southbound-resource-gateway-coder-agent",
	EVENT_PUBLISH_ADAPTER: "southbound-event-publish-adapter-coder-agent",
	READ_MODEL: "read-model-coder-agent",
} as const

/**
 * 专业模式常量 - 客户端层
 */
export const CLIENT_MODES = {
	CLIENT: "client-coder-agent",
} as const

/**
 * 专业模式常量 - 前端层
 */
export const FRONTEND_MODES = {
	PROJECT_STRUCTURE: "frontend-project-structure-coder-agent",
	VUE_COMPONENT: "vue-component-coder-agent",
	VUE_COMPOSABLE: "vue-composable-coder-agent",
	MOCKJS_SERVICE: "mockjs-service-coder-agent",
	API_SERVICE: "api-service-coder-agent",
	PINIA_STORE: "pinia-store-coder-agent",
	VUE_ROUTER: "vue-router-coder-agent",
	FRONTEND_TESTING: "frontend-testing-coder-agent",
	VITE_BUILD: "vite-build-coder-agent",
	UI_DESIGN_SYSTEM: "ui-design-system-coder-agent",
	VUE_I18N: "vue-i18n-coder-agent",
} as const

/**
 * 所有模式常量的联合对象
 */
export const ALL_MODES = {
	...BASE_MODES,
	...PRODUCT_MODES,
	...NORTHBOUND_MODES,
	...DOMAIN_MODES,
	...SOUTHBOUND_MODES,
	...CLIENT_MODES,
	...FRONTEND_MODES,
} as const

/**
 * 基础模式列表
 */
export const BASE_MODE_LIST = Object.values(BASE_MODES)

/**
 * 后端专业模式列表
 */
export const BACKEND_SPECIALTY_MODE_LIST = [
	...Object.values(PRODUCT_MODES),
	...Object.values(NORTHBOUND_MODES),
	...Object.values(DOMAIN_MODES),
	...Object.values(SOUTHBOUND_MODES),
	...Object.values(CLIENT_MODES),
]

/**
 * 前端专业模式列表
 */
export const FRONTEND_SPECIALTY_MODE_LIST = Object.values(FRONTEND_MODES)

/**
 * 所有专业模式列表
 */
export const ALL_SPECIALTY_MODE_LIST = [...BACKEND_SPECIALTY_MODE_LIST, ...FRONTEND_SPECIALTY_MODE_LIST]

/**
 * 所有模式列表
 */
export const ALL_MODE_LIST = Object.values(ALL_MODES)

/**
 * 从 DEFAULT_MODES 构建的模式信息映射
 */
export const MODE_INFO_MAP = new Map<string, ModeConfig>(DEFAULT_MODES.map((mode) => [mode.slug, mode]))

/**
 * 模式显示名称映射（从 DEFAULT_MODES 中提取）
 * 这是权威的显示名称映射，所有其他地方都应该使用这个
 *
 * 注意：这个映射完全基于 packages/types/src/mode.ts 中 DEFAULT_MODES 的 name 字段
 * 任何其他文件中的模式名称映射都应该被移除，统一使用这个映射
 */
export const MODE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
	DEFAULT_MODES.map((mode) => [mode.slug, mode.name]),
)

/**
 * 验证映射完整性的辅助函数
 * 用于开发时检查是否有遗漏的模式映射
 */
export function validateModeMapping(): { missing: string[]; total: number } {
	const allSlugs = DEFAULT_MODES.map((mode) => mode.slug)
	const mappedSlugs = Object.keys(MODE_DISPLAY_NAMES)
	const missing = allSlugs.filter((slug) => !mappedSlugs.includes(slug))

	return {
		missing,
		total: allSlugs.length,
	}
}

/**
 * 模式角色名称映射（从 DEFAULT_MODES 中提取）
 */
export const MODE_ROLE_NAMES: Record<string, string> = Object.fromEntries(
	DEFAULT_MODES.map((mode) => [mode.slug, mode.roleName || mode.name]),
)

/**
 * 模式描述映射（从 DEFAULT_MODES 中提取）
 */
export const MODE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
	DEFAULT_MODES.map((mode) => [mode.slug, mode.description || ""]),
)

/**
 * 模式图标映射（从 DEFAULT_MODES 中提取）
 */
export const MODE_ICONS: Record<string, string> = Object.fromEntries(
	DEFAULT_MODES.map((mode) => [mode.slug, mode.iconName || "codicon-person"]),
)

/**
 * 模式使用场景映射（从 DEFAULT_MODES 中提取）
 */
export const MODE_WHEN_TO_USE: Record<string, string> = Object.fromEntries(
	DEFAULT_MODES.map((mode) => [mode.slug, mode.whenToUse || ""]),
)

/**
 * 🎯 统一数据源：活动描述映射
 *
 * 权威数据源：packages/types/src/mode.ts 中的 MODE_ACTIVITY_DESCRIPTIONS
 * 这里直接引用权威映射，确保完全一致性
 */
export const MODE_ACTIVITY_DESCRIPTIONS: Record<string, string> = AUTHORITY_MODE_ACTIVITY_DESCRIPTIONS

/**
 * 判断是否为基础模式
 */
export function isBaseMode(modeSlug: string): boolean {
	return BASE_MODE_LIST.includes(modeSlug as any)
}

/**
 * 判断是否为专业模式
 */
export function isSpecialtyMode(modeSlug: string): boolean {
	return ALL_SPECIALTY_MODE_LIST.includes(modeSlug as any)
}

/**
 * 判断是否为前端模式
 */
export function isFrontendMode(modeSlug: string): boolean {
	return FRONTEND_SPECIALTY_MODE_LIST.includes(modeSlug as any)
}

/**
 * 判断是否为后端模式
 */
export function isBackendMode(modeSlug: string): boolean {
	return BACKEND_SPECIALTY_MODE_LIST.includes(modeSlug as any)
}

/**
 * 获取模式信息
 */
export function getModeInfo(modeSlug: string): ModeConfig | undefined {
	return MODE_INFO_MAP.get(modeSlug)
}

/**
 * 获取模式显示名称
 */
export function getModeDisplayName(modeSlug: string): string {
	return MODE_DISPLAY_NAMES[modeSlug] || modeSlug
}

/**
 * 获取模式角色名称
 */
export function getModeRoleName(modeSlug: string): string {
	return MODE_ROLE_NAMES[modeSlug] || modeSlug
}

/**
 * 获取模式描述
 */
export function getModeDescription(modeSlug: string): string {
	return MODE_DESCRIPTIONS[modeSlug] || ""
}

/**
 * 获取模式图标
 */
export function getModeIcon(modeSlug: string): string {
	return MODE_ICONS[modeSlug] || "codicon-person"
}

/**
 * 获取模式使用场景
 */
export function getModeWhenToUse(modeSlug: string): string {
	return MODE_WHEN_TO_USE[modeSlug] || ""
}

/**
 * 获取模式活动描述
 *
 * 🎯 统一数据源：直接使用权威函数
 */
export function getModeActivityDescription(modeSlug: string): string {
	return getAuthorityModeActivityDescription(modeSlug)
}

/**
 * 获取所有基础模式的slug列表
 * 用于需要基础模式列表的场景
 */
export function getBaseModeList(): readonly string[] {
	return BASE_MODE_LIST
}

/**
 * 根据模式分类获取模式列表
 */
export function getModesByCategory(category: "base" | "backend" | "frontend" | "all"): string[] {
	switch (category) {
		case "base":
			return BASE_MODE_LIST
		case "backend":
			return BACKEND_SPECIALTY_MODE_LIST
		case "frontend":
			return FRONTEND_SPECIALTY_MODE_LIST
		case "all":
		default:
			return ALL_MODE_LIST
	}
}

/**
 * 验证模式slug是否有效
 */
export function isValidModeSlug(modeSlug: string): boolean {
	return MODE_INFO_MAP.has(modeSlug)
}

/**
 * 类型定义
 */
export type ModeConstant = (typeof ALL_MODES)[keyof typeof ALL_MODES]
export type BaseModeConstant = (typeof BASE_MODES)[keyof typeof BASE_MODES]
export type SpecialtyModeConstant =
	| (typeof PRODUCT_MODES)[keyof typeof PRODUCT_MODES]
	| (typeof NORTHBOUND_MODES)[keyof typeof NORTHBOUND_MODES]
	| (typeof DOMAIN_MODES)[keyof typeof DOMAIN_MODES]
	| (typeof SOUTHBOUND_MODES)[keyof typeof SOUTHBOUND_MODES]
	| (typeof CLIENT_MODES)[keyof typeof CLIENT_MODES]
	| (typeof FRONTEND_MODES)[keyof typeof FRONTEND_MODES]

export type FrontendModeConstant = (typeof FRONTEND_MODES)[keyof typeof FRONTEND_MODES]
export type BackendModeConstant =
	| (typeof PRODUCT_MODES)[keyof typeof PRODUCT_MODES]
	| (typeof NORTHBOUND_MODES)[keyof typeof NORTHBOUND_MODES]
	| (typeof DOMAIN_MODES)[keyof typeof DOMAIN_MODES]
	| (typeof SOUTHBOUND_MODES)[keyof typeof SOUTHBOUND_MODES]
	| (typeof CLIENT_MODES)[keyof typeof CLIENT_MODES]
