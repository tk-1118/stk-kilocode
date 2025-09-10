import React from "react"
import { TeamConfig, TeamWorkStatus as TeamWorkStatusType } from "@roo-code/types"
import { cn } from "@/lib/utils"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { getModeDisplayName } from "@/utils/teams"

interface TeamWorkStatusProps {
	team: TeamConfig
	workStatus: TeamWorkStatusType
	onMemberClick?: (memberSlug: string, modeSlug: string) => void
	className?: string
}

export const TeamWorkStatus: React.FC<TeamWorkStatusProps> = ({ team, workStatus, onMemberClick, className }) => {
	const { t: _t } = useAppTranslation()

	const activeMemberSlugs = workStatus.activeMembers || []

	// 工作流程阶段
	const workflowStages = team.collaboration?.workflow || []
	const currentStageIndex = workStatus.workflowStage ? workflowStages.indexOf(workStatus.workflowStage) : -1

	// 获取团队所有成员（模式）
	const allTeamMembers = [...team.baseModes, ...team.specialtyModes]

	return (
		<div className={cn("space-y-4", className)}>
			{/* 团队信息头部 */}
			<div className="flex items-center gap-3 p-3 bg-[var(--vscode-editor-background)] rounded-lg border border-[var(--vscode-widget-border)]">
				<div
					className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
					style={{ backgroundColor: team.color || "#666" }}>
					{team.iconName ? <i className={`codicon ${team.iconName}`} /> : team.name.charAt(0)}
				</div>
				<div className="flex-1">
					<h3 className="font-semibold text-[var(--vscode-foreground)]">{team.name}</h3>
					<p className="text-sm text-[var(--vscode-descriptionForeground)]">{team.description}</p>
				</div>
				{workStatus.lastActivity && (
					<div className="text-xs text-[var(--vscode-descriptionForeground)]">
						最后活动: {new Date(workStatus.lastActivity).toLocaleTimeString()}
					</div>
				)}
			</div>

			{/* 工作流程进度 */}
			{workflowStages.length > 0 && (
				<div className="p-3 bg-[var(--vscode-editor-background)] rounded-lg border border-[var(--vscode-widget-border)]">
					<h4 className="font-medium text-[var(--vscode-foreground)] mb-3">工作流程</h4>
					<div className="flex items-center gap-2 overflow-x-auto">
						{workflowStages.map((stage, index) => (
							<React.Fragment key={stage}>
								<div
									className={cn(
										"px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors",
										index === currentStageIndex
											? "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]"
											: index < currentStageIndex
												? "bg-green-500/20 text-green-400"
												: "bg-[var(--vscode-input-background)] text-[var(--vscode-descriptionForeground)]",
									)}>
									{stage}
								</div>
								{index < workflowStages.length - 1 && (
									<div className="w-2 h-0.5 bg-[var(--vscode-widget-border)]" />
								)}
							</React.Fragment>
						))}
					</div>
				</div>
			)}

			{/* 当前任务 */}
			{workStatus.currentTask && (
				<div className="p-3 bg-[var(--vscode-textBlockQuote-background)] rounded-lg border-l-4 border-[var(--vscode-focusBorder)]">
					<h4 className="font-medium text-[var(--vscode-foreground)] mb-1">当前任务</h4>
					<p className="text-sm text-[var(--vscode-descriptionForeground)]">{workStatus.currentTask}</p>
				</div>
			)}

			{/* 团队成员（基于模式） */}
			<div className="space-y-3">
				<h4 className="font-medium text-[var(--vscode-foreground)]">团队成员</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{allTeamMembers.map((modeSlug) => {
						const isActive = activeMemberSlugs.includes(modeSlug)
						const isWorking = isActive && !!workStatus.currentTask
						const memberName = getModeDisplayName(modeSlug)

						return (
							<div
								key={modeSlug}
								className={cn(
									"p-3 rounded-lg border cursor-pointer transition-all",
									isActive
										? "border-[var(--vscode-focusBorder)] bg-[var(--vscode-list-activeSelectionBackground)]"
										: "border-[var(--vscode-widget-border)] bg-[var(--vscode-editor-background)] hover:bg-[var(--vscode-list-hoverBackground)]",
								)}
								onClick={() => onMemberClick?.(modeSlug, modeSlug)}>
								<div className="flex items-center gap-3">
									{/* 状态指示器 */}
									<div
										className={cn(
											"w-3 h-3 rounded-full",
											isWorking
												? "bg-green-500 animate-pulse"
												: isActive
													? "bg-blue-500"
													: "bg-gray-400",
										)}
									/>
									{/* 成员信息 */}
									<div className="flex-1">
										<div className="font-medium text-[var(--vscode-foreground)]">{memberName}</div>
										<div className="text-xs text-[var(--vscode-descriptionForeground)]">
											{isWorking ? "正在工作中" : isActive ? "待命中" : "空闲"}
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default TeamWorkStatus
