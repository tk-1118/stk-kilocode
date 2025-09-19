/**
 * 模式相关常量定义
 *
 * @deprecated 此文件已弃用，请使用 ./unified-modes.ts 中的统一常量
 *
 * 新的统一常量模块基于 packages/types/src/mode.ts 中的 DEFAULT_MODES 作为权威数据源，
 * 确保所有模式信息的一致性和准确性。
 *
 * 迁移指南：
 * - 使用 MODE_DISPLAY_NAMES 替代 MODE_DISPLAY_NAMES
 * - 使用 isBaseMode() 替代硬编码的基础模式判断
 * - 使用 getModeDisplayName() 等工具函数获取模式信息
 */

/**
 * 基础模式常量
 */
export const BASE_MODES = {
	SA01_SYSTEM_ARCHITECT: "sa01-system-architect",
	DEV99_CODER: "dev99-coder",
	QA01_UNIT_TEST: "qa01-unit-test",
	QA01_DEBUG: "qa01-debug",
	QE01_QUALITY_CONTROL: "qe01-quality-control",
	SE01_SECURITY_CONTROL: "se01-security-control",
	PM01_PROJECT_MANAGER: "pm01-project-manager",
} as const

/**
 * 专业模式常量 - 产品项目层
 */
export const PRODUCT_MODES = {
	PRODUCT_PROJECT: "bdev01-product-project-coder-agent",
} as const

/**
 * 专业模式常量 - 北向网关层
 */
export const NORTHBOUND_MODES = {
	APP_EVENT_PUBLISHER: "bdev06-northbound-app-event-publisher-coder-agent",
	CQRS_BUSINESS_SERVICE: "bdev05-northbound-cqrs-business-service-and-application-service-coder-agent",
	API_CONTROLLER: "bdev02-northbound-api-controller-coder-agent",
	APP_EVENT_SUBSCRIBER: "bdev03-northbound-app-event-subscriber-coder-agent",
	CLIENT_PROVIDER: "bdev04-northbound-client-provider-coder-agent",
} as const

/**
 * 专业模式常量 - 领域层
 */
export const DOMAIN_MODES = {
	VALUE_OBJECT_MAPPING: "bdev08-value-object-and-java-primitive-data-types-mapping-coder-agent",
	DOMAIN_MODEL: "bdev07-domain-model-and-value-object-coder-agent",
	DOMAIN_SERVICE: "bdev09-domain-service-coder-agent",
	DOMAIN_EVENT_PUBLISHER: "bdev10-domain-event-publisher-coder-agent",
} as const

/**
 * 专业模式常量 - 南向网关层
 */
export const SOUTHBOUND_MODES = {
	DATA_MODEL: "bdev11-southbound-data-model-coder-agent",
	REPOSITORY: "bdev12-southbound-respository-coder-agent",
	RESOURCE_GATEWAY: "bdev13-southbound-resource-gateway-coder-agent",
	EVENT_PUBLISH_ADAPTER: "bdev14-southbound-event-publish-adapter-coder-agent",
	READ_MODEL: "bdev15-read-model-coder-agent",
} as const

/**
 * 专业模式常量 - 客户端层
 */
export const CLIENT_MODES = {
	CLIENT: "bdev16-client-coder-agent",
} as const

/**
 * 专业模式常量 - 前端层
 */
export const FRONTEND_MODES = {
	COORDINATOR: "fdev00-coordinator-agent",
	PAGE_COMPONENT: "fdev01-page-component-coder-agent",
	LAYOUT_STYLE: "fdev02-layout-style-coder-agent",
	// MOCK: "fdev03-mock-coder-agent",
	// API_INTEGRATION: "fdev04-api-integration-coder-agent",
} as const

/**
 * 所有模式常量的联合类型
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
 * 专业模式列表
 */
export const SPECIALTY_MODE_LIST = [
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
 * 所有模式列表
 */
export const ALL_MODE_LIST = Object.values(ALL_MODES)

/**
 * 模式显示名称映射
 *
 * @deprecated 此映射已完全移除，请使用 ./unified-modes.ts 中的 MODE_DISPLAY_NAMES
 *
 * 新的统一映射基于 packages/types/src/mode.ts 中的 DEFAULT_MODES，确保数据一致性
 *
 * 迁移指南：
 * import { getModeDisplayName } from "./unified-modes"
 * const displayName = getModeDisplayName(modeSlug)
 */
// export const MODE_DISPLAY_NAMES: Record<string, string> = {} // 已移除，使用 unified-modes.ts

/**
 * 任务关键词与模式的映射配置
 */
export const TASK_MODE_MAPPING = [
	{
		keywords: ["产品", "项目", "项目结构"],
		mode: PRODUCT_MODES.PRODUCT_PROJECT,
		reason: "任务涉及产品项目结构",
	},
	{
		keywords: ["领域", "模型"],
		mode: DOMAIN_MODES.DOMAIN_MODEL,
		reason: "任务涉及领域建模",
	},
	{
		keywords: ["api", "接口", "控制器", "controller"],
		mode: NORTHBOUND_MODES.API_CONTROLLER,
		reason: "任务涉及API开发",
	},
	{
		keywords: ["数据库", "仓储", "repository", "持久化"],
		mode: SOUTHBOUND_MODES.REPOSITORY,
		reason: "任务涉及数据持久化",
	},
	{
		keywords: ["领域服务", "业务逻辑", "domain service"],
		mode: DOMAIN_MODES.DOMAIN_SERVICE,
		reason: "任务涉及领域服务",
	},
	{
		keywords: ["事件", "event", "消息", "发布"],
		mode: NORTHBOUND_MODES.APP_EVENT_PUBLISHER,
		reason: "任务涉及事件处理",
	},
	{
		keywords: ["cqrs", "应用服务", "命令", "查询"],
		mode: NORTHBOUND_MODES.CQRS_BUSINESS_SERVICE,
		reason: "任务涉及CQRS应用服务",
	},
	{
		keywords: ["客户端", "client", "rpc", "sdk"],
		mode: CLIENT_MODES.CLIENT,
		reason: "任务涉及客户端开发",
	},
	{
		keywords: ["架构", "设计", "规划"],
		mode: BASE_MODES.SA01_SYSTEM_ARCHITECT,
		reason: "任务涉及架构设计",
	},
	{
		keywords: ["开发", "实现", "编码"],
		mode: BASE_MODES.DEV99_CODER,
		reason: "任务涉及代码开发",
	},
	// 前端相关任务映射
	{
		keywords: ["页面", "page", "页面开发", "视图"],
		mode: FRONTEND_MODES.PAGE_COMPONENT,
		reason: "任务涉及页面开发",
	},
	{
		keywords: ["布局", "style", "样式", "样式开发"],
		mode: FRONTEND_MODES.LAYOUT_STYLE,
		reason: "任务涉及布局与样式开发",
	},
	// {
	// 	keywords: ["mock", "模拟", "数据", "mockjs"],
	// 	mode: FRONTEND_MODES.MOCK,
	// 	reason: "任务涉及Mock数据开发",
	// },
	// {
	// 	keywords: ["api", "接口", "请求", "axios"],
	// 	mode: FRONTEND_MODES.API_INTEGRATION,
	// 	reason: "任务涉及API接口开发",
	// },
] as const

export type ModeConstant = (typeof ALL_MODES)[keyof typeof ALL_MODES]
export type BaseModeConstant = (typeof BASE_MODES)[keyof typeof BASE_MODES]
export type SpecialtyModeConstant =
	| (typeof PRODUCT_MODES)[keyof typeof PRODUCT_MODES]
	| (typeof NORTHBOUND_MODES)[keyof typeof NORTHBOUND_MODES]
	| (typeof DOMAIN_MODES)[keyof typeof DOMAIN_MODES]
	| (typeof SOUTHBOUND_MODES)[keyof typeof SOUTHBOUND_MODES]
	| (typeof CLIENT_MODES)[keyof typeof CLIENT_MODES]
	| (typeof FRONTEND_MODES)[keyof typeof FRONTEND_MODES]
