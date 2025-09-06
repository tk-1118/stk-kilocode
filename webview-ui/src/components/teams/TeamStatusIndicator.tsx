import React from "react"
import { CheckCircle, AlertCircle, Clock, Users } from "lucide-react"
import { ExtendedTeamConfig } from "@roo-code/types"
import { calculateTeamStats, generateTeamSuggestions } from "@/utils/teamValidation"
import { StandardTooltip } from "@/components/ui"
import { cn } from "@/lib/utils"

interface TeamStatusIndicatorProps {
	team: ExtendedTeamConfig
	className?: string
	showDetails?: boolean
}

/**
 * 团队状态指示器组件
 * 显示团队的配置完整度、成员状态和建议信息
 *
 * 功能特性：
 * - 配置完整度可视化显示
 * - 团队健康度评估
 * - 智能建议提示
 * - 响应式设计和无障碍支持
 */
export const TeamStatusIndicator: React.FC<TeamStatusIndicatorProps> = ({ team, className, showDetails = false }) => {
	const stats = calculateTeamStats(team)
	const suggestions = generateTeamSuggestions(team)

	// 根据完整度确定状态
	const getStatusInfo = () => {
		if (stats.completionRate >= 90) {
			return {
				status: "excellent" as const,
				icon: CheckCircle,
				color: "text-green-500",
				bgColor: "bg-green-50",
				borderColor: "border-green-200",
				label: "优秀",
				description: "团队配置完整，可以高效协作",
			}
		} else if (stats.completionRate >= 70) {
			return {
				status: "good" as const,
				icon: CheckCircle,
				color: "text-blue-500",
				bgColor: "bg-blue-50",
				borderColor: "border-blue-200",
				label: "良好",
				description: "团队配置基本完整，建议进一步优化",
			}
		} else if (stats.completionRate >= 50) {
			return {
				status: "warning" as const,
				icon: AlertCircle,
				color: "text-yellow-500",
				bgColor: "bg-yellow-50",
				borderColor: "border-yellow-200",
				label: "待完善",
				description: "团队配置不够完整，需要进一步设置",
			}
		} else {
			return {
				status: "incomplete" as const,
				icon: Clock,
				color: "text-red-500",
				bgColor: "bg-red-50",
				borderColor: "border-red-200",
				label: "未完成",
				description: "团队配置严重不足，请尽快完善",
			}
		}
	}

	const statusInfo = getStatusInfo()
	const StatusIcon = statusInfo.icon

	return (
		<div className={cn("space-y-2", className)}>
			{/* 状态概览 */}
			<div
				className={cn(
					"flex items-center gap-2 px-3 py-2 rounded-lg border",
					statusInfo.bgColor,
					statusInfo.borderColor,
				)}>
				<StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<span className={cn("text-sm font-medium", statusInfo.color)}>{statusInfo.label}</span>
						<span className="text-xs text-vscode-descriptionForeground">{stats.completionRate}%</span>
					</div>
					{showDetails && (
						<p className="text-xs text-vscode-descriptionForeground mt-1">{statusInfo.description}</p>
					)}
				</div>
			</div>

			{/* 进度条 */}
			<div className="w-full bg-vscode-input-background rounded-full h-2">
				<div
					className={cn(
						"h-2 rounded-full transition-all duration-300",
						stats.completionRate >= 90
							? "bg-green-500"
							: stats.completionRate >= 70
								? "bg-blue-500"
								: stats.completionRate >= 50
									? "bg-yellow-500"
									: "bg-red-500",
					)}
					style={{ width: `${stats.completionRate}%` }}
				/>
			</div>

			{/* 详细信息 */}
			{showDetails && (
				<div className="space-y-2">
					{/* 成员统计 */}
					<div className="flex items-center gap-4 text-xs text-vscode-descriptionForeground">
						<div className="flex items-center gap-1">
							<Users className="w-3 h-3" />
							<span>
								{stats.activeMembers}/{stats.totalMembers} 活跃成员
							</span>
						</div>
						<div>基础: {stats.basicModes}</div>
						<div>专业: {stats.specialtyModes}</div>
						{stats.hasWorkflow && <div>✓ 工作流程</div>}
					</div>

					{/* 建议信息 */}
					{suggestions.length > 0 && (
						<div className="space-y-1">
							<div className="text-xs font-medium text-vscode-foreground">优化建议:</div>
							<ul className="space-y-1">
								{suggestions.slice(0, 3).map((suggestion, index) => (
									<li
										key={index}
										className="text-xs text-vscode-descriptionForeground flex items-start gap-1">
										<span className="text-vscode-descriptionForeground mt-0.5">•</span>
										<span>{suggestion}</span>
									</li>
								))}
								{suggestions.length > 3 && (
									<StandardTooltip
										content={
											<div className="space-y-1">
												{suggestions.slice(3).map((suggestion, index) => (
													<div key={index} className="text-xs">
														• {suggestion}
													</div>
												))}
											</div>
										}>
										<li className="text-xs text-vscode-focusBorder cursor-help">
											+{suggestions.length - 3} 更多建议...
										</li>
									</StandardTooltip>
								)}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

/**
 * 简化版团队状态徽章
 * 用于在列表或卡片中显示简洁的状态信息
 */
export const TeamStatusBadge: React.FC<{ team: ExtendedTeamConfig; className?: string }> = ({ team, className }) => {
	const stats = calculateTeamStats(team)

	const getBadgeColor = () => {
		if (stats.completionRate >= 90) return "bg-green-100 text-green-800 border-green-200"
		if (stats.completionRate >= 70) return "bg-blue-100 text-blue-800 border-blue-200"
		if (stats.completionRate >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
		return "bg-red-100 text-red-800 border-red-200"
	}

	return (
		<StandardTooltip content={`配置完整度: ${stats.completionRate}%`}>
			<span
				className={cn(
					"inline-flex items-center px-2 py-1 text-xs font-medium rounded border",
					getBadgeColor(),
					className,
				)}>
				{stats.completionRate}%
			</span>
		</StandardTooltip>
	)
}

/**
 * 团队健康度仪表盘组件
 * 提供更详细的团队状态分析
 */
export const TeamHealthDashboard: React.FC<{ teams: ExtendedTeamConfig[] }> = ({ teams }) => {
	const overallStats = teams.reduce(
		(acc, team) => {
			const stats = calculateTeamStats(team)
			acc.totalTeams++
			acc.totalCompletionRate += stats.completionRate
			acc.totalMembers += stats.totalMembers
			acc.activeMembers += stats.activeMembers

			if (stats.completionRate >= 90) acc.excellentTeams++
			else if (stats.completionRate >= 70) acc.goodTeams++
			else if (stats.completionRate >= 50) acc.warningTeams++
			else acc.incompleteTeams++

			return acc
		},
		{
			totalTeams: 0,
			excellentTeams: 0,
			goodTeams: 0,
			warningTeams: 0,
			incompleteTeams: 0,
			totalCompletionRate: 0,
			totalMembers: 0,
			activeMembers: 0,
		},
	)

	const averageCompletionRate =
		overallStats.totalTeams > 0 ? overallStats.totalCompletionRate / overallStats.totalTeams : 0

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-3">
				<div className="text-lg font-semibold text-vscode-foreground">{overallStats.totalTeams}</div>
				<div className="text-sm text-vscode-descriptionForeground">总团队数</div>
			</div>

			<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-3">
				<div className="text-lg font-semibold text-green-500">{overallStats.excellentTeams}</div>
				<div className="text-sm text-vscode-descriptionForeground">优秀团队</div>
			</div>

			<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-3">
				<div className="text-lg font-semibold text-vscode-foreground">{Math.round(averageCompletionRate)}%</div>
				<div className="text-sm text-vscode-descriptionForeground">平均完整度</div>
			</div>

			<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-3">
				<div className="text-lg font-semibold text-vscode-foreground">
					{overallStats.activeMembers}/{overallStats.totalMembers}
				</div>
				<div className="text-sm text-vscode-descriptionForeground">活跃成员</div>
			</div>
		</div>
	)
}
