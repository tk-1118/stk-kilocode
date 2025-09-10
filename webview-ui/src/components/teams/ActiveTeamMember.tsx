import React from "react"
import { TeamConfig } from "@roo-code/types"
import { cn } from "@/lib/utils"
import { getModeDisplayName } from "@/utils/teams"

interface ActiveTeamMemberProps {
	team: TeamConfig
	currentMode: string
	isWorking?: boolean
	className?: string
}

export const ActiveTeamMember: React.FC<ActiveTeamMemberProps> = ({
	team,
	currentMode,
	isWorking = false,
	className,
}) => {
	// 直接使用统一的模式显示名称
	const memberName = getModeDisplayName(currentMode)

	return (
		<div className={cn("flex items-center gap-2 px-2 py-1 rounded", className)}>
			{/* 工作状态指示器 */}
			<div className={cn("w-2 h-2 rounded-full", isWorking ? "bg-green-500 animate-pulse" : "bg-gray-400")} />

			{/* 成员头像 */}
			<div className="w-6 h-6 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-xs text-[var(--vscode-button-foreground)] font-semibold">
				{memberName.charAt(0).toUpperCase()}
			</div>

			{/* 成员信息 */}
			<div className="flex-1 min-w-0">
				<div className="text-xs font-medium text-[var(--vscode-foreground)] truncate">{memberName}</div>
				<div className="text-xs text-[var(--vscode-descriptionForeground)] truncate">
					{isWorking ? "正在工作中" : "待命中"}
				</div>
			</div>

			{/* 团队标识 */}
			<div
				className="w-3 h-3 rounded-sm flex items-center justify-center text-white text-xs font-bold"
				style={{ backgroundColor: team.color || "#666" }}
				title={team.name}>
				{team.iconName ? <i className={`codicon ${team.iconName} text-xs`} /> : team.name.charAt(0)}
			</div>
		</div>
	)
}

export default ActiveTeamMember
