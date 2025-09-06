import React from "react"
import { TeamConfig } from "@roo-code/types"
import { cn } from "@/lib/utils"
import { getTeamBySlug, getModeDisplayName } from "@/utils/teams"

interface TeamStatusBarProps {
	currentTeam?: string
	currentMode: string
	customTeams?: TeamConfig[]
	isWorking?: boolean
	className?: string
}

export const TeamStatusBar: React.FC<TeamStatusBarProps> = ({
	currentTeam,
	currentMode,
	customTeams,
	isWorking = false,
	className,
}) => {
	const team = currentTeam ? getTeamBySlug(currentTeam, customTeams) : null

	if (!team) return null

	// 使用统一的模式显示名称
	const memberName = getModeDisplayName(currentMode)

	return (
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

				{/* 当前成员 */}
				<div className="flex items-center gap-1.5">
					<div
						className={cn(
							"w-1.5 h-1.5 rounded-full",
							isWorking ? "bg-green-400 animate-pulse" : "bg-gray-400",
						)}
					/>
					<span>{memberName}</span>
				</div>
			</div>

			{/* 右侧：工作状态 */}
			<div className="flex items-center gap-2 text-[var(--vscode-statusBar-foreground)] opacity-75">
				{isWorking ? (
					<>
						<span>正在工作</span>
						<div className="flex gap-0.5">
							<div
								className="w-1 h-1 bg-current rounded-full animate-bounce"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-1 h-1 bg-current rounded-full animate-bounce"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-1 h-1 bg-current rounded-full animate-bounce"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
					</>
				) : (
					<span>待命中</span>
				)}
			</div>
		</div>
	)
}

export default TeamStatusBar
