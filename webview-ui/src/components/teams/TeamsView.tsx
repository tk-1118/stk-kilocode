import React, { useState, useEffect, useMemo } from "react"
import { TeamWorkStatus as TeamWorkStatusType } from "@roo-code/types"
import { TeamSelector } from "./TeamSelector"
import { TeamWorkStatus } from "./TeamWorkStatus"
import { Button } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getAllTeams, getModeDisplayName } from "@/utils/teams"

interface TeamsViewProps {
	onDone: () => void
}

export const TeamsView: React.FC<TeamsViewProps> = ({ onDone }) => {
	const { t: _t } = useAppTranslation()
	const { customTeams } = useExtensionState()

	const [currentTeam, setCurrentTeam] = useState<string>("backend-team")
	const [workStatus, setWorkStatus] = useState<TeamWorkStatusType | null>(null)
	const [isAutoDetecting, setIsAutoDetecting] = useState(false)

	// 获取所有团队
	const allTeams = useMemo(() => {
		// 这里应该调用 getAllTeams，但由于是在webview中，我们需要通过消息传递
		// 暂时使用默认团队
		// 使用团队工具函数获取所有团队
		return getAllTeams(customTeams)
	}, [customTeams])

	// 获取当前选中的团队配置
	const selectedTeam = allTeams.find((team) => team.slug === currentTeam)

	useEffect(() => {
		// TODO: 请求当前团队工作状态
		// vscode.postMessage({ type: "getTeamWorkStatus" })

		// 监听来自扩展的消息
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			switch (message.type) {
				case "teamWorkStatus":
					setWorkStatus(message.status)
					if (message.status?.currentTeam) {
						setCurrentTeam(message.status.currentTeam)
					}
					break
				case "teamSwitched":
					setCurrentTeam(message.team)
					break
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const handleTeamChange = (teamSlug: string) => {
		setCurrentTeam(teamSlug)
		// TODO: 添加 switchTeam 消息类型
		// vscode.postMessage({
		// 	type: "switchTeam",
		// 	team: teamSlug,
		// 	reason: "manual"
		// })
	}

	const handleAutoDetect = async () => {
		setIsAutoDetecting(true)
		// TODO: 添加 autoDetectTeam 消息类型
		// vscode.postMessage({ type: "autoDetectTeam" })

		// 模拟检测延迟
		setTimeout(() => {
			setIsAutoDetecting(false)
		}, 2000)
	}

	const handleMemberClick = (_memberSlug: string, _modeSlug: string) => {
		// 切换到指定模式并关闭团队视图
		// TODO: 添加 switchToMode 消息类型
		// vscode.postMessage({
		// 	type: "switchToMode",
		// 	mode: modeSlug,
		// 	member: memberSlug
		// })
		onDone()
	}

	return (
		<div className="flex flex-col h-full">
			{/* 头部 */}
			<div className="flex items-center justify-between p-4 border-b border-[var(--vscode-widget-border)]">
				<h2 className="text-lg font-semibold text-[var(--vscode-foreground)]">开发团队</h2>
				<Button variant="ghost" onClick={onDone}>
					<i className="codicon codicon-close" />
				</Button>
			</div>

			{/* 团队选择器 */}
			<div className="p-4 border-b border-[var(--vscode-widget-border)]">
				<div className="flex items-center gap-3">
					<div className="flex-1">
						<TeamSelector
							value={currentTeam}
							onChange={handleTeamChange}
							teamShortcutText="选择开发团队"
							customTeams={customTeams}
							title="当前团队"
						/>
					</div>
					<Button
						variant="outline"
						onClick={handleAutoDetect}
						disabled={isAutoDetecting}
						className="whitespace-nowrap">
						{isAutoDetecting ? (
							<>
								<i className="codicon codicon-loading codicon-modifier-spin mr-2" />
								检测中...
							</>
						) : (
							<>
								<i className="codicon codicon-search mr-2" />
								智能识别
							</>
						)}
					</Button>
				</div>
				<p className="text-sm text-[var(--vscode-descriptionForeground)] mt-2">
					根据项目特征自动选择最适合的开发团队，或手动选择团队
				</p>
			</div>

			{/* 团队工作状态 */}
			<div className="flex-1 overflow-auto p-4">
				{selectedTeam && workStatus ? (
					<TeamWorkStatus team={selectedTeam} workStatus={workStatus} onMemberClick={handleMemberClick} />
				) : selectedTeam ? (
					<div className="space-y-4">
						{/* 团队信息 */}
						<div className="flex items-center gap-3 p-4 bg-[var(--vscode-editor-background)] rounded-lg border border-[var(--vscode-widget-border)]">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
								style={{ backgroundColor: selectedTeam.color || "#666" }}>
								{selectedTeam.iconName ? (
									<i className={`codicon ${selectedTeam.iconName}`} />
								) : (
									selectedTeam.name.charAt(0)
								)}
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-[var(--vscode-foreground)]">{selectedTeam.name}</h3>
								<p className="text-sm text-[var(--vscode-descriptionForeground)]">
									{selectedTeam.description}
								</p>
							</div>
						</div>

						{/* 基础能力 */}
						<div className="space-y-3">
							<h4 className="font-medium text-[var(--vscode-foreground)]">基础能力</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
								{selectedTeam.baseModes.map((modeSlug) => (
									<button
										key={modeSlug}
										className="p-3 text-sm rounded border border-[var(--vscode-widget-border)] bg-[var(--vscode-editor-background)] hover:bg-[var(--vscode-list-hoverBackground)] transition-colors"
										onClick={() => handleMemberClick(modeSlug, modeSlug)}>
										{getModeDisplayName(modeSlug)}
									</button>
								))}
							</div>
						</div>

						{/* 专业技能 */}
						{selectedTeam.specialtyModes.length > 0 && (
							<div className="space-y-3">
								<h4 className="font-medium text-[var(--vscode-foreground)]">专业技能</h4>
								<div className="grid grid-cols-1 gap-2">
									{selectedTeam.specialtyModes.map((modeSlug) => (
										<button
											key={modeSlug}
											className="p-3 text-sm text-left rounded border border-[var(--vscode-widget-border)] bg-[var(--vscode-editor-background)] hover:bg-[var(--vscode-list-hoverBackground)] transition-colors"
											onClick={() => handleMemberClick(modeSlug, modeSlug)}>
											{getModeDisplayName(modeSlug)}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="flex items-center justify-center h-full text-[var(--vscode-descriptionForeground)]">
						<div className="text-center">
							<i className="codicon codicon-loading codicon-modifier-spin text-2xl mb-2" />
							<p>加载团队信息中...</p>
						</div>
					</div>
				)}
			</div>

			{/* 底部操作 */}
			<div className="p-4 border-t border-[var(--vscode-widget-border)]">
				<div className="flex justify-between items-center">
					<Button
						variant="ghost"
						onClick={() => {
							// TODO: 添加 openTeamSettings 消息类型
							// vscode.postMessage({ type: "openTeamSettings" })
						}}>
						<i className="codicon codicon-settings-gear mr-2" />
						团队设置
					</Button>
					<Button onClick={onDone}>完成</Button>
				</div>
			</div>
		</div>
	)
}

export default TeamsView
