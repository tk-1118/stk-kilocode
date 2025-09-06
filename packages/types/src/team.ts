import { z } from "zod"

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
		slug: "frontend-team",
		name: "前端开发团队",
		description: "专注于用户界面和用户体验的开发团队",
		iconName: "codicon-browser",
		color: "#61DAFB", // React蓝色
		baseModes: ["architect", "code", "ask", "debug"],
		specialtyModes: [], // 前端专业模式待定义
		projectDetection: {
			filePatterns: ["*.tsx", "*.jsx", "*.vue", "*.svelte", "*.html", "*.css", "*.scss", "*.less"],
			configFiles: ["package.json", "vite.config.*", "webpack.config.*", "next.config.*", "nuxt.config.*"],
			dependencies: ["react", "vue", "angular", "svelte", "next", "nuxt", "vite", "webpack"],
			directoryPatterns: ["src/components", "src/pages", "public", "assets"],
		},
		collaboration: {
			workflow: ["需求分析", "UI设计", "组件开发", "页面集成", "测试优化"],
			taskAssignment: "auto",
		},
	},
	{
		slug: "backend-team",
		name: "后端开发团队",
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
		projectDetection: {
			filePatterns: ["*.java", "*.kt", "*.scala", "*.go", "*.py", "*.cs", "*.php"],
			configFiles: ["pom.xml", "build.gradle", "application.yml", "application.properties", "Dockerfile"],
			dependencies: ["spring", "springboot", "mybatis", "hibernate", "maven", "gradle"],
			directoryPatterns: ["src/main/java", "src/main/resources", "domain", "infrastructure", "application"],
		},
		collaboration: {
			workflow: ["需求分析", "架构设计", "领域建模", "服务开发", "接口联调", "性能优化"],
			taskAssignment: "auto",
		},
	},
	{
		slug: "fullstack-team",
		name: "全栈开发团队",
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
		projectDetection: {
			filePatterns: ["*.tsx", "*.jsx", "*.java", "*.py", "*.js", "*.ts"],
			configFiles: ["package.json", "pom.xml", "docker-compose.yml"],
			directoryPatterns: ["frontend", "backend", "client", "server", "web", "api"],
		},
		collaboration: {
			workflow: ["项目规划", "架构设计", "前端开发", "后端开发", "联调测试", "部署上线"],
			taskAssignment: "hybrid",
		},
	},
] as const
