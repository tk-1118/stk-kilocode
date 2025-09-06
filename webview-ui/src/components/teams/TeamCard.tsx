import React, { useState } from "react"
import { Edit, Trash2, Users, Settings, Eye } from "lucide-react"
import { ExtendedTeamConfig, ModeConfig } from "@roo-code/types"
import { Button, StandardTooltip } from "@/components/ui"
// import { cn } from "@/lib/utils"
import { getModeDisplayName } from "@/utils/teams"
import { TeamStatusBadge } from "./TeamStatusIndicator"

interface TeamCardProps {
	team: ExtendedTeamConfig
	_availableModes: ModeConfig[] // 暂时未使用，但保留接口兼容性
	onEdit: () => void
	_onDuplicate: () => void // 暂时未使用，但保留接口兼容性
	onDelete: () => void
	_onExport: () => void // 暂时未使用，但保留接口兼容性
}

/**
 * 团队卡片组件
 * 显示团队基本信息和操作按钮
 */
export const TeamCard: React.FC<TeamCardProps> = ({
	team,
	_availableModes,
	onEdit,
	_onDuplicate,
	onDelete,
	_onExport,
}) => {
	const [showDetails, setShowDetails] = useState(false)

	// 获取团队成员总数
	const totalMembers = team.baseModes.length + team.specialtyModes.length

	// 获取活跃成员数
	const activeMembers = team.members?.filter((m) => m.isActive).length || totalMembers

	return (
		<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg overflow-hidden hover:border-vscode-focusBorder transition-colors">
			{/* 卡片头部 */}
			<div className="p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div
							className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
							style={{ backgroundColor: team.color || "#007ACC" }}>
							<span className={`codicon ${team.iconName || "codicon-organization"}`} />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-medium text-vscode-foreground truncate">{team.name}</h3>
							<div className="flex items-center gap-2 mt-1">
								<span className="text-xs text-vscode-descriptionForeground">{team.slug}</span>
								{team.isBuiltIn && (
									<span className="px-2 py-0.5 text-xs bg-vscode-badge-background text-vscode-badge-foreground rounded">
										内置
									</span>
								)}
								<TeamStatusBadge team={team} />
							</div>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex items-center gap-1">
						<StandardTooltip content="查看详情">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowDetails(!showDetails)}
								className="p-1">
								<Eye className="w-4 h-4" />
							</Button>
						</StandardTooltip>

						{!team.isBuiltIn && (
							<StandardTooltip content="编辑团队">
								<Button variant="ghost" size="sm" onClick={onEdit} className="p-1">
									<Edit className="w-4 h-4" />
								</Button>
							</StandardTooltip>
						)}

						{/* 暂时隐藏复制和导出功能 */}
						{/* <StandardTooltip content="复制团队">
							<Button
								variant="ghost"
								size="sm"
								onClick={onDuplicate}
								className="p-1">
								<Copy className="w-4 h-4" />
							</Button>
						</StandardTooltip>

						<StandardTooltip content="导出团队">
							<Button
								variant="ghost"
								size="sm"
								onClick={onExport}
								className="p-1">
								<Download className="w-4 h-4" />
							</Button>
						</StandardTooltip> */}

						{!team.isBuiltIn && (
							<StandardTooltip content="删除团队">
								<Button
									variant="ghost"
									size="sm"
									onClick={onDelete}
									className="p-1 text-vscode-errorForeground hover:text-vscode-errorForeground">
									<Trash2 className="w-4 h-4" />
								</Button>
							</StandardTooltip>
						)}
					</div>
				</div>

				{/* 团队描述 */}
				{team.description && (
					<p className="text-sm text-vscode-descriptionForeground mb-3 line-clamp-2">{team.description}</p>
				)}

				{/* 团队统计 */}
				<div className="flex items-center gap-4 text-sm text-vscode-descriptionForeground">
					<div className="flex items-center gap-1">
						<Users className="w-4 h-4" />
						<span>
							{activeMembers}/{totalMembers} 成员
						</span>
					</div>
					{team.collaboration?.taskAssignment && (
						<div className="flex items-center gap-1">
							<Settings className="w-4 h-4" />
							<span>
								{team.collaboration.taskAssignment === "auto"
									? "自动分配"
									: team.collaboration.taskAssignment === "manual"
										? "手动分配"
										: "混合模式"}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* 展开的详细信息 */}
			{showDetails && (
				<div className="border-t border-vscode-widget-border p-4 bg-vscode-editor-background">
					{/* 基础成员 */}
					{team.baseModes.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-medium text-vscode-foreground mb-2">基础成员</h4>
							<div className="flex flex-wrap gap-1">
								{team.baseModes.map((modeSlug) => (
									<span
										key={modeSlug}
										className="px-2 py-1 text-xs bg-vscode-button-background text-vscode-button-foreground rounded">
										{getModeDisplayName(modeSlug)}
									</span>
								))}
							</div>
						</div>
					)}

					{/* 专业成员 */}
					{team.specialtyModes.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-medium text-vscode-foreground mb-2">专业成员</h4>
							<div className="flex flex-wrap gap-1">
								{team.specialtyModes.slice(0, 6).map((modeSlug) => (
									<span
										key={modeSlug}
										className="px-2 py-1 text-xs bg-vscode-badge-background text-vscode-badge-foreground rounded">
										{getModeDisplayName(modeSlug)}
									</span>
								))}
								{team.specialtyModes.length > 6 && (
									<span className="px-2 py-1 text-xs text-vscode-descriptionForeground">
										+{team.specialtyModes.length - 6} 更多
									</span>
								)}
							</div>
						</div>
					)}

					{/* 工作流程 */}
					{team.collaboration?.workflow && team.collaboration.workflow.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-vscode-foreground mb-2">工作流程</h4>
							<div className="flex items-center gap-2 text-xs text-vscode-descriptionForeground overflow-x-auto">
								{team.collaboration.workflow.map((step, index) => (
									<React.Fragment key={index}>
										<span className="whitespace-nowrap">{step}</span>
										{index < team.collaboration!.workflow!.length - 1 && (
											<span className="text-vscode-descriptionForeground">→</span>
										)}
									</React.Fragment>
								))}
							</div>
						</div>
					)}

					{/* 创建时间 */}
					{team.createdAt && (
						<div className="mt-3 pt-3 border-t border-vscode-widget-border">
							<div className="text-xs text-vscode-descriptionForeground">
								创建于: {new Date(team.createdAt).toLocaleDateString()}
								{team.updatedAt && team.updatedAt !== team.createdAt && (
									<span className="ml-2">
										更新于: {new Date(team.updatedAt).toLocaleDateString()}
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
