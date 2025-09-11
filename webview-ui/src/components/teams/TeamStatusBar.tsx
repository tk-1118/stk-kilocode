import React, { useState } from "react"
import { TeamConfig, ClineMessage } from "@roo-code/types"
import { cn } from "@/lib/utils"
import { getTeamBySlug, getModeDisplayName, getModeRoleName } from "@/utils/teams"
import { BarChart3 } from "lucide-react"
import WorkResultsModal from "./WorkResultsModal"
import { extractWorkResultsFromMessages } from "@/utils/workResults"

interface TeamStatusBarProps {
	currentTeam?: string
	currentMode: string
	customTeams?: TeamConfig[]
	isWorking?: boolean
	className?: string
	messages?: ClineMessage[] // 添加消息历史用于生成工作成果
	apiMetrics?: {
		tokensIn: number
		tokensOut: number
		totalCost: number
	} // 添加真实的API统计数据
}

export const TeamStatusBar: React.FC<TeamStatusBarProps> = ({
	currentTeam,
	currentMode,
	customTeams,
	isWorking = false,
	className,
	messages,
	apiMetrics,
}) => {
	const [showWorkResults, setShowWorkResults] = useState(false)

	const team = currentTeam ? getTeamBySlug(currentTeam, customTeams) : null

	if (!team) return null

	// 使用统一的模式显示名称
	const memberName = getModeDisplayName(currentMode)

	// 使用统一的模式角色名称
	const modeRoleName = getModeRoleName(currentMode)

	// 生成工作成果数据
	const workResults = messages
		? extractWorkResultsFromMessages(messages, currentTeam, customTeams, apiMetrics, currentMode)
		: null

	// 处理工作成果按钮点击
	const handleWorkResultsClick = () => {
		setShowWorkResults(true)
	}

	return (
		<>
			<div
				className={cn(
					"flex items-center justify-between px-3 py-1.5 text-xs",
					"bg-[var(--vscode-statusBar-background)] text-[var(--vscode-statusBar-foreground)]",
					"border-b border-[var(--vscode-statusBar-border)]",
					className,
				)}>
				{/* 左侧：团队信息 */}
				<div className="flex items-center gap-2">
					{/* 团队图标和名称 */}
					<div className="flex items-center gap-1.5">
						{team.iconName && (
							<i className={`codicon ${team.iconName} text-sm`} style={{ color: team.color }} />
						)}
						<span className="font-medium">{team.name}</span>
					</div>
					{/* 分隔符 */}
					<div className="w-px h-3 bg-[var(--vscode-statusBar-border)]" />
					{/* 当前成员所属岗位 */}
					<div className="flex items-center gap-1.5">
						<span>{modeRoleName}</span>
					</div>
					{/* 分隔符 */}
					<div className="w-px h-3 bg-[var(--vscode-statusBar-border)]" />

					{/* 当前成员和状态 */}
					<div className="flex items-center gap-1.5">
						<div
							className={cn(
								"w-1.5 h-1.5 rounded-full",
								isWorking ? "bg-green-400 animate-pulse" : "bg-gray-400",
							)}
						/>
						<span>{memberName}</span>
						{/* 状态文字紧贴成员名 */}
						<span className="text-[var(--vscode-statusBar-foreground)] opacity-75">
							{isWorking ? "正在工作中" : "待命中"}
						</span>
					</div>
				</div>

				{/* 右侧：工作成果按钮和工作状态动画 */}
				<div className="flex items-center gap-2">
					{/* 工作成果清单按钮 */}
					<button
						onClick={handleWorkResultsClick}
						className="flex items-center gap-1 px-2 py-1 text-xs rounded
						bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)]
						hover:bg-[var(--vscode-button-secondaryHoverBackground)] transition-colors
						border border-[var(--vscode-button-border)]"
						title="查看工作成果清单">
						<BarChart3 className="w-3 h-3" />
						<span>工作成果清单</span>
					</button>

					{/* 工作状态动画（仅在工作时显示） */}
					{/* {isWorking && (
					<div className="flex items-center gap-2">
						<div className="flex gap-0.5">
							<div
								className="w-1 h-1 bg-[var(--vscode-statusBar-foreground)] rounded-full animate-bounce opacity-75"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-1 h-1 bg-[var(--vscode-statusBar-foreground)] rounded-full animate-bounce opacity-75"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-1 h-1 bg-[var(--vscode-statusBar-foreground)] rounded-full animate-bounce opacity-75"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
					</div>
				)} */}
				</div>
			</div>

			{/* 工作成果弹窗 */}
			<WorkResultsModal
				isOpen={showWorkResults}
				onClose={() => setShowWorkResults(false)}
				workResults={workResults || undefined}
			/>
		</>
	)
}

export default TeamStatusBar
