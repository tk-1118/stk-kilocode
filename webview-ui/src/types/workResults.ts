/**
 * 工作成果清单相关类型定义
 */

/**
 * 团队成员工作统计
 */
export interface MemberWorkStats {
	/** 成员模式标识 */
	modeSlug: string
	/** 成员显示名称 */
	memberName: string
	/** 成员角色名称 */
	roleName: string
	/** 消耗的输入token数量 */
	tokensIn: number
	/** 消耗的输出token数量 */
	tokensOut: number
	/** 总消耗token数量 */
	totalTokens: number
	/** 产出代码行数 */
	codeLines: number
	/** 工作时长（毫秒） */
	workDuration: number
	/** 工作开始时间 */
	startTime?: string
	/** 工作结束时间 */
	endTime?: string
	/** 是否当前活跃 */
	isActive: boolean
}

/**
 * 团队工作统计
 */
export interface TeamWorkStats {
	/** 团队标识 */
	teamSlug: string
	/** 团队名称 */
	teamName: string
	/** 团队图标 */
	teamIcon?: string
	/** 团队颜色 */
	teamColor?: string
	/** 成员工作统计列表 */
	members: MemberWorkStats[]
	/** 团队总消耗token */
	totalTokens: number
	/** 团队总代码行数 */
	totalCodeLines: number
	/** 团队总工作时长 */
	totalWorkDuration: number
}

/**
 * 任务工作成果清单
 */
export interface TaskWorkResults {
	/** 任务ID */
	taskId: string
	/** 任务描述 */
	taskDescription?: string
	/** 任务开始时间 */
	taskStartTime: string
	/** 任务结束时间 */
	taskEndTime?: string
	/** 任务总时长 */
	taskDuration: number
	/** 任务总输入Token */
	totalTokensIn: number
	/** 任务总输出Token */
	totalTokensOut: number
	/** 任务总Token */
	totalTokens: number
	/** 任务总代码行数 */
	totalCodeLines: number
	/** 任务总成本 */
	totalCost: number
	/** 参与的团队统计 */
	teams: TeamWorkStats[]
	/** 汇总信息 */
	summary: {
		/** 总成员数 */
		totalMembers: number
		/** 活跃成员数 */
		activeMembersCount: number
		/** 团队数量 */
		teamsCount: number
		/** 总成本 */
		totalCost: number
		/** 总Token */
		totalTokens: number
		/** 总代码行数 */
		totalCodeLines: number
		/** 总工作时长 */
		totalWorkDuration: number
	}
}

/**
 * 工作成果清单显示配置
 */
export interface WorkResultsDisplayConfig {
	/** 是否显示token统计 */
	showTokenStats: boolean
	/** 是否显示代码行数 */
	showCodeLines: boolean
	/** 是否显示工作时长 */
	showWorkDuration: boolean
	/** 是否显示成本信息 */
	showCostInfo: boolean
	/** 是否显示团队详情 */
	showTeamDetails: boolean
	/** 是否显示成员详情 */
	showMemberDetails: boolean
}

/**
 * 工作成果清单操作
 */
export interface WorkResultsActions {
	/** 导出工作成果报告 */
	exportReport?: (format: "json" | "csv" | "pdf") => void
	/** 清空工作成果数据 */
	clearResults?: () => void
	/** 刷新工作成果数据 */
	refreshResults?: () => void
}
