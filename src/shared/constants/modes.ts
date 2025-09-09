/**
 * 模式相关常量定义
 * 避免硬编码，统一管理所有模式相关的常量
 */

/**
 * 基础模式常量
 */
export const BASE_MODES = {
	ARCHITECT: "architect",
	CODE: "code",
	ASK: "ask",
	DEBUG: "debug",
	ORCHESTRATOR: "orchestrator",
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
	APP_EVENT_PUBLISHER: "northbound-app-event-publisher-coder-agent",
	CQRS_BUSINESS_SERVICE: "northbound-cqrs-business-service-and-application-service-coder-agent",
	API_CONTROLLER: "northbound-api-controller-coder-agent",
	APP_EVENT_SUBSCRIBER: "northbound-app-event-subscriber-coder-agent",
	CLIENT_PROVIDER: "northbound-client-provider-coder-agent",
} as const

/**
 * 专业模式常量 - 领域层
 */
export const DOMAIN_MODES = {
	VALUE_OBJECT_MAPPING: "value-object-and-java-primitive-data-types-mapping-coder-agent",
	DOMAIN_MODEL: "domain-model-and-value-object-coder-agent",
	DOMAIN_SERVICE: "domain-service-coder-agent",
	DOMAIN_EVENT_PUBLISHER: "domain-event-publisher-coder-agent",
} as const

/**
 * 专业模式常量 - 南向网关层
 */
export const SOUTHBOUND_MODES = {
	DATA_MODEL: "southbound-data-model-coder-agent",
	REPOSITORY: "southbound-repository-coder-agent",
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
 */
export const MODE_DISPLAY_NAMES: Record<string, string> = {
	// 基础模式
	[BASE_MODES.ARCHITECT]: "架构师",
	[BASE_MODES.CODE]: "开发工程师",
	[BASE_MODES.ASK]: "技术顾问",
	[BASE_MODES.DEBUG]: "调试专家",
	[BASE_MODES.ORCHESTRATOR]: "协调员",

	// 产品项目层
	[PRODUCT_MODES.PRODUCT_PROJECT]: "产品项目结构开发同学",

	// 北向网关层
	[NORTHBOUND_MODES.APP_EVENT_PUBLISHER]: "应用事件发布开发同学",
	[NORTHBOUND_MODES.CQRS_BUSINESS_SERVICE]: "CQRS业务服务应用服务开发同学",
	[NORTHBOUND_MODES.API_CONTROLLER]: "API控制器开发同学",
	[NORTHBOUND_MODES.APP_EVENT_SUBSCRIBER]: "应用事件订阅开发同学",
	[NORTHBOUND_MODES.CLIENT_PROVIDER]: "客户端提供开发同学",

	// 领域层
	[DOMAIN_MODES.VALUE_OBJECT_MAPPING]: "值对象映射开发同学",
	[DOMAIN_MODES.DOMAIN_MODEL]: "领域模型开发同学",
	[DOMAIN_MODES.DOMAIN_SERVICE]: "领域服务开发同学",
	[DOMAIN_MODES.DOMAIN_EVENT_PUBLISHER]: "领域事件发布开发同学",

	// 南向网关层
	[SOUTHBOUND_MODES.DATA_MODEL]: "数据模型开发同学",
	[SOUTHBOUND_MODES.REPOSITORY]: "仓储开发同学",
	[SOUTHBOUND_MODES.RESOURCE_GATEWAY]: "资源网关开发同学",
	[SOUTHBOUND_MODES.EVENT_PUBLISH_ADAPTER]: "事件发布适配开发同学",
	[SOUTHBOUND_MODES.READ_MODEL]: "读模型开发同学",

	// 客户端层
	[CLIENT_MODES.CLIENT]: "客户端开发同学",

	// 前端层
	[FRONTEND_MODES.PROJECT_STRUCTURE]: "前端项目结构开发同学",
	[FRONTEND_MODES.VUE_COMPONENT]: "Vue组件开发同学",
	[FRONTEND_MODES.VUE_COMPOSABLE]: "Vue组合式函数开发同学",
	[FRONTEND_MODES.MOCKJS_SERVICE]: "MockJS数据模拟开发同学",
	[FRONTEND_MODES.API_SERVICE]: "API服务开发同学",
	[FRONTEND_MODES.PINIA_STORE]: "Pinia状态管理开发同学",
	[FRONTEND_MODES.VUE_ROUTER]: "Vue路由开发同学",
	[FRONTEND_MODES.FRONTEND_TESTING]: "前端测试开发同学",
	[FRONTEND_MODES.VITE_BUILD]: "Vite构建开发同学",
	[FRONTEND_MODES.UI_DESIGN_SYSTEM]: "UI设计系统开发同学",
	[FRONTEND_MODES.VUE_I18N]: "Vue国际化开发同学",
} as const

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
		mode: BASE_MODES.ARCHITECT,
		reason: "任务涉及架构设计",
	},
	{
		keywords: ["开发", "实现", "编码"],
		mode: BASE_MODES.CODE,
		reason: "任务涉及代码开发",
	},
	{
		keywords: ["调试", "修复", "错误"],
		mode: BASE_MODES.DEBUG,
		reason: "任务涉及问题调试",
	},
	// 前端相关任务映射
	{
		keywords: ["vue", "组件", "component"],
		mode: FRONTEND_MODES.VUE_COMPONENT,
		reason: "任务涉及Vue组件开发",
	},
	{
		keywords: ["路由", "router", "导航"],
		mode: FRONTEND_MODES.VUE_ROUTER,
		reason: "任务涉及路由配置",
	},
	{
		keywords: ["状态管理", "pinia", "store"],
		mode: FRONTEND_MODES.PINIA_STORE,
		reason: "任务涉及状态管理",
	},
	{
		keywords: ["api", "接口", "请求", "axios"],
		mode: FRONTEND_MODES.API_SERVICE,
		reason: "任务涉及API服务",
	},
	{
		keywords: ["mock", "模拟", "数据"],
		mode: FRONTEND_MODES.MOCKJS_SERVICE,
		reason: "任务涉及数据模拟",
	},
	{
		keywords: ["测试", "test", "单元测试"],
		mode: FRONTEND_MODES.FRONTEND_TESTING,
		reason: "任务涉及前端测试",
	},
	{
		keywords: ["构建", "打包", "vite", "build"],
		mode: FRONTEND_MODES.VITE_BUILD,
		reason: "任务涉及构建配置",
	},
	{
		keywords: ["国际化", "i18n", "多语言"],
		mode: FRONTEND_MODES.VUE_I18N,
		reason: "任务涉及国际化",
	},
	{
		keywords: ["ui", "设计", "主题", "样式"],
		mode: FRONTEND_MODES.UI_DESIGN_SYSTEM,
		reason: "任务涉及UI设计系统",
	},
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
