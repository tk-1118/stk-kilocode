import React, { useState, useEffect } from "react"
import { TeamConfig, TeamWorkStatus } from "@roo-code/types"
import { cn } from "@/lib/utils"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { getModeDisplayName, getModeActivityDescription } from "@/utils/teams"

interface TeamCollaborationStatusProps {
	team: TeamConfig
	workStatus?: TeamWorkStatus
	currentMode?: string
	className?: string
}

interface TeamActivity {
	memberName: string
	activity: string
	timestamp: Date
	type: "start" | "progress" | "complete" | "switch"
}

export const TeamCollaborationStatus: React.FC<TeamCollaborationStatusProps> = ({
	team,
	workStatus,
	currentMode,
	className,
}) => {
	const { t: _t } = useAppTranslation()
	const [activities, setActivities] = useState<TeamActivity[]>([])
	const [currentMember, setCurrentMember] = useState<string>("")

	// 模拟团队活动
	useEffect(() => {
		if (!workStatus || !currentMode) return

		// 根据当前模式确定活跃成员
		const memberName = getModeDisplayName(currentMode)
		setCurrentMember(memberName)

		// 添加新活动
		const newActivity: TeamActivity = {
			memberName,
			activity: getModeActivityDescription(currentMode),
			timestamp: new Date(),
			type: "start",
		}

		setActivities((prev) => [newActivity, ...prev.slice(0, 4)]) // 保留最近5条活动
	}, [currentMode, team, workStatus])

	// 注意：移除了模拟进度更新逻辑
	// 真实的进度更新应该基于实际的AI工作状态，而不是定时器模拟

	if (!workStatus) {
		return null
	}

	return (
		<div className={cn("space-y-3", className)}>
			{/* 当前活跃成员 */}
			<div className="flex items-center gap-3 p-3 bg-[var(--vscode-editor-background)] rounded-lg border border-[var(--vscode-widget-border)]">
				<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
				<div className="flex-1">
					<h4 className="font-medium text-[var(--vscode-foreground)]">{currentMember || "团队待命中"}</h4>
					<p className="text-sm text-[var(--vscode-descriptionForeground)]">
						{currentMember ? "正在为您工作" : "等待任务分配"}
					</p>
				</div>
				<div className="text-xs text-[var(--vscode-descriptionForeground)]">
					{new Date().toLocaleTimeString()}
				</div>
			</div>

			{/* 团队活动流 */}
			<div className="space-y-2">
				<h4 className="font-medium text-[var(--vscode-foreground)] text-sm">团队活动</h4>
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{activities.length > 0 ? (
						activities.map((activity, index) => (
							<div
								key={index}
								className="flex items-start gap-3 p-2 bg-[var(--vscode-list-inactiveSelectionBackground)] rounded text-sm">
								<div
									className={cn(
										"w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
										activity.type === "start" && "bg-blue-500",
										activity.type === "progress" && "bg-yellow-500",
										activity.type === "complete" && "bg-green-500",
										activity.type === "switch" && "bg-purple-500",
									)}
								/>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-medium text-[var(--vscode-foreground)]">
											{activity.memberName}
										</span>
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											{activity.timestamp.toLocaleTimeString()}
										</span>
									</div>
									<p className="text-[var(--vscode-descriptionForeground)] truncate">
										{activity.activity}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="text-center text-[var(--vscode-descriptionForeground)] text-sm py-4">
							暂无团队活动
						</div>
					)}
				</div>
			</div>

			{/* 团队统计 */}
			<div className="grid grid-cols-3 gap-2 text-center">
				<div className="p-2 bg-[var(--vscode-editor-background)] rounded border border-[var(--vscode-widget-border)]">
					<div className="text-lg font-bold text-[var(--vscode-foreground)]">
						{team.baseModes.length + team.specialtyModes.length}
					</div>
					<div className="text-xs text-[var(--vscode-descriptionForeground)]">团队成员</div>
				</div>
				<div className="p-2 bg-[var(--vscode-editor-background)] rounded border border-[var(--vscode-widget-border)]">
					<div className="text-lg font-bold text-green-500">{workStatus.activeMembers?.length || 0}</div>
					<div className="text-xs text-[var(--vscode-descriptionForeground)]">活跃成员</div>
				</div>
				<div className="p-2 bg-[var(--vscode-editor-background)] rounded border border-[var(--vscode-widget-border)]">
					<div className="text-lg font-bold text-blue-500">{team.collaboration?.workflow?.length || 0}</div>
					<div className="text-xs text-[var(--vscode-descriptionForeground)]">工作流程</div>
				</div>
			</div>
		</div>
	)
}

export default TeamCollaborationStatus
