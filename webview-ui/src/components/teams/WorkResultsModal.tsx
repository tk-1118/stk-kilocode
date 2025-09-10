import React, { useState } from "react"
import { X, Download, Clock, Code, Zap, DollarSign, Users, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatLargeNumber } from "@/utils/format"
import type { TaskWorkResults } from "@/types/workResults"

interface WorkResultsModalProps {
	isOpen: boolean
	onClose: () => void
	workResults?: TaskWorkResults
	className?: string
}

export const WorkResultsModal: React.FC<WorkResultsModalProps> = ({ isOpen, onClose, workResults, className }) => {
	// 展开状态管理

	const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())

	// 格式化时长显示
	const formatDuration = (milliseconds: number): string => {
		const seconds = Math.floor(milliseconds / 1000)
		const minutes = Math.floor(seconds / 60)
		const hours = Math.floor(minutes / 60)

		if (hours > 0) {
			return `${hours}小时${minutes % 60}分钟`
		} else if (minutes > 0) {
			return `${minutes}分钟${seconds % 60}秒`
		} else {
			return `${seconds}秒`
		}
	}

	// 格式化时间显示
	// const formatTime = (timeString: string): string => {
	// 	return new Date(timeString).toLocaleString("zh-CN", {
	// 		year: "numeric",
	// 		month: "2-digit",
	// 		day: "2-digit",
	// 		hour: "2-digit",
	// 		minute: "2-digit",
	// 		second: "2-digit",
	// 	})
	// }

	// 切换团队展开状态
	const toggleTeamExpanded = (teamSlug: string) => {
		const newExpanded = new Set(expandedTeams)
		if (newExpanded.has(teamSlug)) {
			newExpanded.delete(teamSlug)
		} else {
			newExpanded.add(teamSlug)
		}
		setExpandedTeams(newExpanded)
	}

	// 导出报告
	const handleExport = (format: "json" | "csv") => {
		if (!workResults) return

		if (format === "json") {
			const dataStr = JSON.stringify(workResults, null, 2)
			const dataBlob = new Blob([dataStr], { type: "application/json" })
			const url = URL.createObjectURL(dataBlob)
			const link = document.createElement("a")
			link.href = url
			link.download = `work-results-${workResults.taskId}.json`
			link.click()
			URL.revokeObjectURL(url)
		} else if (format === "csv") {
			// 生成CSV格式数据
			const csvRows = [["团队", "成员", "角色", "输入Token", "输出Token", "总Token", "代码行数", "工作时长"]]

			workResults.teams.forEach((team) => {
				team.members.forEach((member) => {
					csvRows.push([
						team.teamName,
						member.memberName,
						member.roleName,
						member.tokensIn.toString(),
						member.tokensOut.toString(),
						member.totalTokens.toString(),
						member.codeLines.toString(),
						formatDuration(member.workDuration),
					])
				})
			})

			const csvContent = csvRows.map((row) => row.join(",")).join("\n")
			const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
			const url = URL.createObjectURL(dataBlob)
			const link = document.createElement("a")
			link.href = url
			link.download = `work-results-${workResults.taskId}.csv`
			link.click()
			URL.revokeObjectURL(url)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* 背景遮罩 */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			{/* 弹窗内容 */}
			<div
				className={cn(
					"relative w-full max-w-4xl max-h-[90vh] mx-4",
					"bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)]",
					"rounded-lg shadow-2xl overflow-hidden",
					className,
				)}>
				{/* 头部 */}
				<div className="flex items-center justify-between p-4 border-b border-[var(--vscode-panel-border)]">
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<Layers className="w-5 h-5 text-[var(--vscode-foreground)]" />
							<h2 className="text-lg font-semibold text-[var(--vscode-foreground)]">工作成果清单</h2>
						</div>
						{workResults && (
							<div className="text-sm text-[var(--vscode-descriptionForeground)]">
								任务ID: {workResults.taskId}
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{/* 导出按钮 */}
						<button
							onClick={() => handleExport("json")}
							className="flex items-center gap-1 px-2 py-1 text-xs rounded
								bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)]
								hover:bg-[var(--vscode-button-secondaryHoverBackground)] transition-colors"
							title="导出JSON">
							<Download className="w-3 h-3" />
							JSON
						</button>
						<button
							onClick={() => handleExport("csv")}
							className="flex items-center gap-1 px-2 py-1 text-xs rounded
								bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)]
								hover:bg-[var(--vscode-button-secondaryHoverBackground)] transition-colors"
							title="导出CSV">
							<Download className="w-3 h-3" />
							CSV
						</button>

						{/* 关闭按钮 */}
						<button
							onClick={onClose}
							className="p-1 rounded hover:bg-[var(--vscode-toolbar-hoverBackground)] transition-colors"
							title="关闭">
							<X className="w-4 h-4 text-[var(--vscode-foreground)]" />
						</button>
					</div>
				</div>

				{/* 内容区域 */}
				<div className="overflow-y-auto max-h-[calc(90vh-120px)]">
					{workResults ? (
						<div className="p-4 space-y-6">
							{/* 任务概览 */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
									<div className="flex items-center gap-2 mb-1">
										<Zap className="w-4 h-4 text-blue-400" />
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											API Token
										</span>
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										{formatLargeNumber(workResults.totalTokens)}
									</div>
									<div className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
										↑{formatLargeNumber(workResults.totalTokensIn)} ↓
										{formatLargeNumber(workResults.totalTokensOut)}
									</div>
								</div>

								<div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
									<div className="flex items-center gap-2 mb-1">
										<Code className="w-4 h-4 text-green-400" />
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											代码行数
										</span>
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										{formatLargeNumber(workResults.totalCodeLines)}
									</div>
								</div>

								<div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
									<div className="flex items-center gap-2 mb-1">
										<Clock className="w-4 h-4 text-orange-400" />
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											工作时长
										</span>
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										{formatDuration(workResults.taskDuration)}
									</div>
								</div>

								<div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
									<div className="flex items-center gap-2 mb-1">
										<DollarSign className="w-4 h-4 text-purple-400" />
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											总成本
										</span>
									</div>
									<div className="text-lg font-semibold text-[var(--vscode-foreground)]">
										${workResults.totalCost.toFixed(2)}
									</div>
								</div>
							</div>

							{/* 任务信息 */}
							{/* {workResults.taskDescription && (
								<div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
									<h3 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">任务描述</h3>
									<p className="text-sm text-[var(--vscode-descriptionForeground)]">
										{workResults.taskDescription}
									</p>
								</div>
							)} */}

							{/* 时间信息 */}
							{/* <div className="bg-[var(--vscode-editorWidget-background)] p-3 rounded border border-[var(--vscode-panel-border)]">
								<h3 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">时间信息</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
									<div>
										<span className="text-[var(--vscode-descriptionForeground)]">开始时间：</span>
										<span className="text-[var(--vscode-foreground)]">
											{formatTime(workResults.taskStartTime)}
										</span>
									</div>
									{workResults.taskEndTime && (
										<div>
											<span className="text-[var(--vscode-descriptionForeground)]">结束时间：</span>
											<span className="text-[var(--vscode-foreground)]">
												{formatTime(workResults.taskEndTime)}
											</span>
										</div>
									)}
								</div>
							</div> */}

							{/* 团队详情 */}
							<div className="space-y-4">
								<h3 className="text-sm font-medium text-[var(--vscode-foreground)] flex items-center gap-2">
									<Users className="w-4 h-4" />
									团队工作详情 ({workResults.teams.length}个团队)
								</h3>

								{workResults.teams.map((team) => (
									<div
										key={team.teamSlug}
										className="bg-[var(--vscode-editorWidget-background)] rounded border border-[var(--vscode-panel-border)]">
										{/* 团队头部 */}
										<div
											className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)]"
											onClick={() => toggleTeamExpanded(team.teamSlug)}>
											<div className="flex items-center gap-3">
												{team.teamIcon && (
													<i
														className={`codicon ${team.teamIcon} text-lg`}
														style={{ color: team.teamColor }}
													/>
												)}
												<div>
													<div className="font-medium text-[var(--vscode-foreground)]">
														{team.teamName}
													</div>
													<div className="text-xs text-[var(--vscode-descriptionForeground)]">
														{team.members.length}名成员 •{" "}
														{formatLargeNumber(team.totalCodeLines)} 行代码 •{" "}
														{formatDuration(team.totalWorkDuration)}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="text-sm text-[var(--vscode-descriptionForeground)]">
													API Token: {formatLargeNumber(team.totalTokens)}
												</div>
												<div
													className={cn(
														"transform transition-transform",
														expandedTeams.has(team.teamSlug) ? "rotate-180" : "rotate-0",
													)}>
													<i className="codicon codicon-chevron-down" />
												</div>
											</div>
										</div>

										{/* 团队成员详情 */}
										{expandedTeams.has(team.teamSlug) && (
											<div className="border-t border-[var(--vscode-panel-border)]">
												<div className="p-3 space-y-2">
													{team.members.map((member) => (
														<div
															key={member.modeSlug}
															className="flex items-center justify-between p-2 rounded
																bg-[var(--vscode-editor-background)] border border-[var(--vscode-panel-border)]">
															<div className="flex items-center gap-3">
																<div
																	className={cn(
																		"w-2 h-2 rounded-full",
																		member.isActive
																			? "bg-green-400"
																			: "bg-gray-400",
																	)}
																/>
																<div>
																	<div className="font-medium text-[var(--vscode-foreground)] text-sm">
																		{member.memberName}
																	</div>
																	<div className="text-xs text-[var(--vscode-descriptionForeground)]">
																		{member.roleName}
																	</div>
																</div>
															</div>
															<div className="flex items-center gap-4 text-xs">
																<div className="text-center">
																	<div className="text-[var(--vscode-descriptionForeground)]">
																		分配Token
																	</div>
																	<div className="text-[var(--vscode-foreground)] font-medium">
																		{formatLargeNumber(member.totalTokens)}
																	</div>
																	<div className="text-xs text-[var(--vscode-descriptionForeground)]">
																		↑{formatLargeNumber(member.tokensIn)} ↓
																		{formatLargeNumber(member.tokensOut)}
																	</div>
																</div>
																<div className="text-center">
																	<div className="text-[var(--vscode-descriptionForeground)]">
																		代码行
																	</div>
																	<div className="text-[var(--vscode-foreground)] font-medium">
																		{formatLargeNumber(member.codeLines)}
																	</div>
																</div>
																<div className="text-center">
																	<div className="text-[var(--vscode-descriptionForeground)]">
																		时长
																	</div>
																	<div className="text-[var(--vscode-foreground)] font-medium">
																		{formatDuration(member.workDuration)}
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center h-64">
							<div className="text-center text-[var(--vscode-descriptionForeground)]">
								<Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
								<p>暂无工作成果数据</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default WorkResultsModal
