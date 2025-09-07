/**
 * 团队相关常量定义
 * 避免硬编码，统一管理所有团队相关的常量
 */

/**
 * 团队标识常量
 */
export const TEAM_SLUGS = {
	FRONTEND: "frontend-team",
	BACKEND: "backend-team",
	FULLSTACK: "fullstack-team",
	MOBILE: "mobile-team",
	DEVOPS: "devops-team",
	DATA: "data-team",
	AI: "ai-team",
} as const

/**
 * 默认团队
 */
export const DEFAULT_TEAM_SLUG = TEAM_SLUGS.BACKEND

/**
 * 团队工作流程阶段常量
 */
export const WORKFLOW_STAGES = {
	PROJECT_ANALYSIS: "项目分析",
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
	FRONTEND_DEVELOPMENT: "前端开发",
	BACKEND_DEVELOPMENT: "后端开发",
	INTEGRATION_TESTING: "联调测试",
	DEPLOYMENT: "部署上线",
} as const

/**
 * 团队切换原因常量
 */
export const TEAM_SWITCH_REASONS = {
	MANUAL: "manual",
	AUTO_DETECTION: "auto-detection",
	TASK_REQUIREMENT: "task-requirement",
} as const

/**
 * 任务分配策略常量
 */
export const TASK_ASSIGNMENT_STRATEGIES = {
	AUTO: "auto",
	MANUAL: "manual",
	HYBRID: "hybrid",
} as const

/**
 * 项目检测相关常量
 */
export const PROJECT_DETECTION = {
	// 前端相关
	FRONTEND_FILE_PATTERNS: ["*.tsx", "*.jsx", "*.vue", "*.svelte", "*.html", "*.css", "*.scss", "*.less"],
	FRONTEND_CONFIG_FILES: ["package.json", "vite.config.*", "webpack.config.*", "next.config.*", "nuxt.config.*"],
	FRONTEND_DEPENDENCIES: ["react", "vue", "angular", "svelte", "next", "nuxt", "vite", "webpack"],
	FRONTEND_DIRECTORIES: ["src/components", "src/pages", "public", "assets"],

	// 后端相关
	BACKEND_FILE_PATTERNS: ["*.java", "*.kt", "*.scala", "*.go", "*.py", "*.cs", "*.php"],
	BACKEND_CONFIG_FILES: ["pom.xml", "build.gradle", "application.yml", "application.properties", "Dockerfile"],
	BACKEND_DEPENDENCIES: ["spring", "springboot", "mybatis", "hibernate", "maven", "gradle"],
	BACKEND_DIRECTORIES: ["src/main/java", "src/main/resources", "domain", "infrastructure", "application"],

	// 全栈相关
	FULLSTACK_FILE_PATTERNS: ["*.tsx", "*.jsx", "*.java", "*.py", "*.js", "*.ts"],
	FULLSTACK_CONFIG_FILES: ["package.json", "pom.xml", "docker-compose.yml"],
	FULLSTACK_DIRECTORIES: ["frontend", "backend", "client", "server", "web", "api"],
} as const

/**
 * 团队颜色常量
 */
export const TEAM_COLORS = {
	REACT_BLUE: "#61DAFB",
	SPRING_PURPLE: "#68217A",
	CORAL_RED: "#FF6B6B",
	NODE_GREEN: "#68A063",
	PYTHON_BLUE: "#3776AB",
	FLUTTER_BLUE: "#02569B",
} as const

/**
 * 团队图标常量
 */
export const TEAM_ICONS = {
	BROWSER: "codicon-browser",
	SERVER: "codicon-server",
	LAYERS: "codicon-layers",
	DEVICE_MOBILE: "codicon-device-mobile",
	CLOUD: "codicon-cloud",
	DATABASE: "codicon-database",
	ROBOT: "codicon-robot",
} as const

/**
 * 置信度阈值常量
 */
export const CONFIDENCE_THRESHOLDS = {
	AUTO_SWITCH_THRESHOLD: 0.7,
	HIGH_CONFIDENCE: 0.8,
	MEDIUM_CONFIDENCE: 0.5,
	LOW_CONFIDENCE: 0.3,
} as const

/**
 * 团队状态管理常量
 */
export const TEAM_STATE = {
	MAX_SWITCH_HISTORY: 50,
	STORAGE_KEYS: {
		TEAM_WORK_STATUS: "teamWorkStatus",
		TEAM_SWITCH_HISTORY: "teamSwitchHistory",
	},
} as const

export type TeamSlug = (typeof TEAM_SLUGS)[keyof typeof TEAM_SLUGS]
export type WorkflowStage = (typeof WORKFLOW_STAGES)[keyof typeof WORKFLOW_STAGES]
export type TeamSwitchReason = (typeof TEAM_SWITCH_REASONS)[keyof typeof TEAM_SWITCH_REASONS]
export type TaskAssignmentStrategy = (typeof TASK_ASSIGNMENT_STRATEGIES)[keyof typeof TASK_ASSIGNMENT_STRATEGIES]
