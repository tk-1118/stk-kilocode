import { z } from "zod"

/**
 * 团队相关常量定义
 */
const TEAM_SLUGS = {
	FRONTEND: "frontend-team",
	BACKEND: "backend-team",
	FULLSTACK: "fullstack-team",
} as const

const TEAM_COLORS = {
	REACT_BLUE: "#61DAFB",
	SPRING_PURPLE: "#68217A",
	CORAL_RED: "#FF6B6B",
} as const

const TEAM_ICONS = {
	BROWSER: "codicon-browser",
	SERVER: "codicon-server",
	LAYERS: "codicon-layers",
} as const

const WORKFLOW_STAGES = {
	REQUIREMENT_ANALYSIS: "需求分析",
	ARCHITECTURE_DESIGN: "架构设计",
	UI_DESIGN: "UI设计",
	COMPONENT_DEVELOPMENT: "组件开发",
	PAGE_INTEGRATION: "页面集成",
	DOMAIN_MODELING: "领域建模",
	SERVICE_DEVELOPMENT: "服务开发",
	API_INTEGRATION: "接口联调",
	PERFORMANCE_OPTIMIZATION: "性能优化",
	TESTING_OPTIMIZATION: "测试优化",
	PROJECT_ANALYSIS: "项目分析",
	FRONTEND_DEVELOPMENT: "前端开发",
	BACKEND_DEVELOPMENT: "后端开发",
	INTEGRATION_TESTING: "联调测试",
	DEPLOYMENT: "部署上线",
} as const

const TASK_ASSIGNMENT_STRATEGIES = {
	AUTO: "auto",
	HYBRID: "hybrid",
} as const

const PROJECT_DETECTION = {
	FRONTEND_FILE_PATTERNS: ["*.tsx", "*.jsx", "*.vue", "*.svelte", "*.html", "*.css", "*.scss", "*.less"],
	FRONTEND_CONFIG_FILES: ["package.json", "vite.config.*", "webpack.config.*", "next.config.*", "nuxt.config.*"],
	FRONTEND_DEPENDENCIES: ["react", "vue", "angular", "svelte", "next", "nuxt", "vite", "webpack"],
	FRONTEND_DIRECTORIES: ["src/components", "src/pages", "public", "assets"],
	BACKEND_FILE_PATTERNS: ["*.java", "*.kt", "*.scala", "*.go", "*.py", "*.cs", "*.php"],
	BACKEND_CONFIG_FILES: ["pom.xml", "build.gradle", "application.yml", "application.properties", "Dockerfile"],
	BACKEND_DEPENDENCIES: ["spring", "springboot", "mybatis", "hibernate", "maven", "gradle"],
	BACKEND_DIRECTORIES: ["src/main/java", "src/main/resources", "domain", "infrastructure", "application"],
	FULLSTACK_FILE_PATTERNS: ["*.tsx", "*.jsx", "*.java", "*.py", "*.js", "*.ts"],
	FULLSTACK_CONFIG_FILES: ["package.json", "pom.xml", "docker-compose.yml"],
	FULLSTACK_DIRECTORIES: ["frontend", "backend", "client", "server", "web", "api"],
} as const

/**
 * 模式列表 - 从 DEFAULT_MODES 中提取，确保与权威数据源一致
 * 注意：这里暂时保持内联定义以避免循环依赖，实际使用时应该从统一常量模块导入
 */
const BASE_MODE_LIST = [
	"pm01-project-manager",
	"sa01-system-architect",
	"dev99-coder",
	"qa01-unit-test",
	"qa01-debug",
	"qe01-quality-control",
	"se01-security-control",
] as const

const BACKEND_SPECIALTY_MODE_LIST = [
	"bdev01-product-project-coder-agent",
	"bdev02-northbound-api-controller-coder-agent",
	"bdev03-northbound-app-event-subscriber-coder-agent",
	"bdev04-northbound-client-provider-coder-agent",
	"bdev05-northbound-cqrs-business-service-and-application-service-coder-agent",
	"bdev06-northbound-app-event-publisher-coder-agent",
	"bdev07-domain-model-and-value-object-coder-agent",
	"bdev08-value-object-and-java-primitive-data-types-mapping-coder-agent",
	"bdev09-domain-service-coder-agent",
	"bdev10-domain-event-publisher-coder-agent",
	"bdev11-southbound-data-model-coder-agent",
	"bdev12-southbound-respository-coder-agent",
	"bdev13-southbound-resource-gateway-coder-agent",
	"bdev14-southbound-event-publish-adapter-coder-agent",
	"bdev15-read-model-coder-agent",
	"bdev16-client-coder-agent",
] as const

const FRONTEND_SPECIALTY_MODE_LIST = [
	"fdev01-vue3ts-frontend-project-structure-coder-agent",
	"fdev02-vue3ts-component-coder-agent",
	"fdev03-vue3ts-composable-coder-agent",
	"fdev04-vue3ts-mockjs-service-coder-agent",
	"fdev05-vue3ts-api-service-coder-agent",
	"fdev06-vue3ts-pinia-store-coder-agent",
	"fdev07-vue3ts-router-coder-agent",
	"fdev08-vue3ts-frontend-testing-coder-agent",
	"fdev09-vue3ts-vite-build-coder-agent",
	"fdev10-vue3ts-ui-design-system-coder-agent",
	"fdev11-vue3ts-i18n-coder-agent",
	"fdev12-vue3ts-observability-performance-coder-agent",
	"fdev13-vue3ts-frontend-security-coder-agent",
	"fdev14-vue3ts-page-coder-agent",
] as const

/**
 * 开发团队配置
 */
export const teamConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "团队标识必须只包含字母、数字和短横线"),
	name: z.string().min(1, "团队名称不能为空"),
	description: z.string().optional(),
	iconName: z.string().optional(), // 团队图标
	color: z.string().optional(), // 团队主题色

	// 团队包含的模式（基础模式 + 专业模式）
	baseModes: z.array(z.string()), // 基础模式slug列表 (architect, code, ask, debug)
	specialtyModes: z.array(z.string()), // 专业模式slug列表

	// 项目类型检测规则
	projectDetection: z
		.object({
			// 文件模式匹配
			filePatterns: z.array(z.string()).optional(),
			// 目录结构匹配
			directoryPatterns: z.array(z.string()).optional(),
			// 配置文件匹配
			configFiles: z.array(z.string()).optional(),
			// 依赖包匹配
			dependencies: z.array(z.string()).optional(),
			// 自定义检测脚本
			customDetection: z.string().optional(),
		})
		.optional(),

	// 团队协作配置
	collaboration: z
		.object({
			// 工作流程定义
			workflow: z.array(z.string()).optional(),
			// 任务分配策略
			taskAssignment: z.enum(["auto", "manual", "hybrid"]).optional(),
		})
		.optional(),
})

export type TeamConfig = z.infer<typeof teamConfigSchema>

/**
 * 团队管理操作类型
 */
export const teamManagementActionSchema = z.enum([
	"create",
	"update",
	"delete",
	"addMember",
	"removeMember",
	"duplicate",
])

export type TeamManagementAction = z.infer<typeof teamManagementActionSchema>

/**
 * 团队成员配置
 */
export const teamMemberConfigSchema = z.object({
	modeSlug: z.string(),
	displayName: z.string().optional(),
	isActive: z.boolean().default(true),
	permissions: z.array(z.string()).optional(), // 成员权限
	priority: z.number().default(0), // 成员优先级
})

export type TeamMemberConfig = z.infer<typeof teamMemberConfigSchema>

/**
 * 扩展的团队配置（包含成员详细信息）
 */
export const extendedTeamConfigSchema = teamConfigSchema.extend({
	members: z.array(teamMemberConfigSchema).optional(),
	isBuiltIn: z.boolean().default(false), // 是否为内置团队
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	version: z.string().default("1.0.0"),
})

export type ExtendedTeamConfig = z.infer<typeof extendedTeamConfigSchema>

/**
 * 项目上下文信息
 */
export const projectContextSchema = z.object({
	type: z.string(), // 项目类型：frontend, backend, fullstack, mobile, etc.
	framework: z.string().optional(), // 使用的框架
	language: z.string().optional(), // 主要编程语言
	buildTool: z.string().optional(), // 构建工具
	packageManager: z.string().optional(), // 包管理器
	hasTests: z.boolean().optional(), // 是否有测试
	hasDocker: z.boolean().optional(), // 是否使用Docker
	hasCI: z.boolean().optional(), // 是否有CI/CD
})

export type ProjectContext = z.infer<typeof projectContextSchema>

/**
 * 团队工作状态
 */
export const teamWorkStatusSchema = z.object({
	currentTeam: z.string(), // 当前激活的团队
	activeMembers: z.array(z.string()), // 当前活跃的成员
	currentTask: z.string().optional(), // 当前任务描述
	workflowStage: z.string().optional(), // 工作流程阶段
	lastActivity: z.string().optional(), // 最后活动时间
})

export type TeamWorkStatus = z.infer<typeof teamWorkStatusSchema>

/**
 * 团队切换事件
 */
export const teamSwitchEventSchema = z.object({
	fromTeam: z.string().optional(),
	toTeam: z.string(),
	reason: z.enum(["manual", "auto-detection", "task-requirement"]),
	projectContext: projectContextSchema.optional(),
	timestamp: z.string(),
})

export type TeamSwitchEvent = z.infer<typeof teamSwitchEventSchema>

/**
 * 默认团队配置
 */
export const DEFAULT_TEAMS: readonly TeamConfig[] = [
	{
		slug: TEAM_SLUGS.FRONTEND,
		name: "Vue3+TS前端开发团队",
		description: "专注于用户界面和用户体验的开发团队",
		iconName: TEAM_ICONS.BROWSER,
		color: TEAM_COLORS.REACT_BLUE,
		baseModes: [...BASE_MODE_LIST],
		specialtyModes: [...FRONTEND_SPECIALTY_MODE_LIST],
		projectDetection: {
			filePatterns: [...PROJECT_DETECTION.FRONTEND_FILE_PATTERNS],
			configFiles: [...PROJECT_DETECTION.FRONTEND_CONFIG_FILES],
			dependencies: [...PROJECT_DETECTION.FRONTEND_DEPENDENCIES],
			directoryPatterns: [...PROJECT_DETECTION.FRONTEND_DIRECTORIES],
		},
		collaboration: {
			workflow: [
				WORKFLOW_STAGES.REQUIREMENT_ANALYSIS,
				WORKFLOW_STAGES.UI_DESIGN,
				WORKFLOW_STAGES.COMPONENT_DEVELOPMENT,
				WORKFLOW_STAGES.PAGE_INTEGRATION,
				WORKFLOW_STAGES.TESTING_OPTIMIZATION,
			],
			taskAssignment: TASK_ASSIGNMENT_STRATEGIES.AUTO,
		},
	},
	{
		slug: TEAM_SLUGS.BACKEND,
		name: "DDD后端开发团队",
		description: "专注于服务端架构和业务逻辑的开发团队",
		iconName: TEAM_ICONS.SERVER,
		color: TEAM_COLORS.SPRING_PURPLE,
		baseModes: [...BASE_MODE_LIST],
		specialtyModes: [...BACKEND_SPECIALTY_MODE_LIST],
		projectDetection: {
			filePatterns: [...PROJECT_DETECTION.BACKEND_FILE_PATTERNS],
			configFiles: [...PROJECT_DETECTION.BACKEND_CONFIG_FILES],
			dependencies: [...PROJECT_DETECTION.BACKEND_DEPENDENCIES],
			directoryPatterns: [...PROJECT_DETECTION.BACKEND_DIRECTORIES],
		},
		collaboration: {
			workflow: [
				WORKFLOW_STAGES.REQUIREMENT_ANALYSIS,
				WORKFLOW_STAGES.ARCHITECTURE_DESIGN,
				WORKFLOW_STAGES.DOMAIN_MODELING,
				WORKFLOW_STAGES.SERVICE_DEVELOPMENT,
				WORKFLOW_STAGES.API_INTEGRATION,
				WORKFLOW_STAGES.PERFORMANCE_OPTIMIZATION,
			],
			taskAssignment: TASK_ASSIGNMENT_STRATEGIES.AUTO,
		},
	},
	{
		slug: TEAM_SLUGS.FULLSTACK,
		name: "全栈开发团队",
		description: "具备前后端全栈开发能力的综合团队",
		iconName: TEAM_ICONS.LAYERS,
		color: TEAM_COLORS.CORAL_RED,
		baseModes: [...BASE_MODE_LIST],
		specialtyModes: [...FRONTEND_SPECIALTY_MODE_LIST, ...BACKEND_SPECIALTY_MODE_LIST],
		projectDetection: {
			filePatterns: [...PROJECT_DETECTION.FULLSTACK_FILE_PATTERNS],
			configFiles: [...PROJECT_DETECTION.FULLSTACK_CONFIG_FILES],
			directoryPatterns: [...PROJECT_DETECTION.FULLSTACK_DIRECTORIES],
		},
		collaboration: {
			workflow: Object.values(WORKFLOW_STAGES) as string[],
			taskAssignment: TASK_ASSIGNMENT_STRATEGIES.HYBRID,
		},
	},
] as const
