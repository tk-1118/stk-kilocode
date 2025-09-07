import React, { useState, useCallback, useMemo } from "react"
import { Settings, Users, Download, Upload } from "lucide-react"
import { Button, StandardTooltip } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { TeamConfig, ExtendedTeamConfig } from "@roo-code/types"

import { TeamManagementView } from "../teams/TeamManagementView"

interface TeamManagementSettingsProps {
	className?: string
}

/**
 * 团队管理设置页面
 * 在设置界面中提供团队管理功能的入口
 */
export const TeamManagementSettings: React.FC<TeamManagementSettingsProps> = ({ className }) => {
	const { t } = useAppTranslation()
	const { customTeams, customModes, currentTeam, teamManagementEnabled = true } = useExtensionState()
	const [showManagementView, setShowManagementView] = useState(false)

	// 转换TeamConfig到ExtendedTeamConfig
	const extendedCustomTeams = useMemo((): ExtendedTeamConfig[] => {
		console.log("TeamManagementSettings - customTeams from ExtensionState:", customTeams)
		if (!customTeams) return []
		const result = customTeams.map(
			(team: TeamConfig): ExtendedTeamConfig => ({
				...team,
				isBuiltIn: false,
				version: "1.0.0",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				members: [],
			}),
		)
		console.log("TeamManagementSettings - extendedCustomTeams:", result)
		return result
	}, [customTeams])

	// 打开团队管理界面
	const handleOpenManagement = useCallback(() => {
		setShowManagementView(true)
	}, [])

	// 关闭团队管理界面
	const _handleCloseManagement = useCallback(() => {
		setShowManagementView(false)
	}, [])

	// 处理团队变更
	const handleTeamChange = useCallback((_updatedTeams: ExtendedTeamConfig[]) => {
		// 这里可以处理团队数据的更新
		// 由于数据是通过ExtensionState管理的，实际的更新会通过后端的状态同步来处理
		// 暂时只关闭管理界面
		setShowManagementView(false)
	}, [])

	// 切换团队管理功能
	const handleToggleTeamManagement = useCallback((enabled: boolean) => {
		vscode.postMessage({
			type: "updateVSCodeSetting",
			setting: "teamManagementEnabled",
			value: enabled,
		})
	}, [])

	// 导入团队配置
	const handleImportTeams = useCallback(() => {
		vscode.postMessage({
			type: "importTeam",
		})
	}, [])

	// 导出所有团队配置
	const handleExportAllTeams = useCallback(() => {
		vscode.postMessage({
			type: "exportAllTeams",
		})
	}, [])

	// 重置为默认团队
	const handleResetToDefaults = useCallback(() => {
		// 直接发送重置消息，让后端处理确认逻辑
		vscode.postMessage({
			type: "resetTeamsToDefaults",
			text: t("settings:teams.management.resetConfirm"),
		})
	}, [t])

	if (showManagementView) {
		return (
			<TeamManagementView
				customTeams={extendedCustomTeams}
				customModes={customModes}
				_onTeamChange={handleTeamChange}
			/>
		)
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* 功能开关 */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-medium text-vscode-foreground">{t("settings:teams.title")}</h3>
						<p className="text-sm text-vscode-descriptionForeground mt-1">
							{t("settings:teams.description")}
						</p>
					</div>
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={teamManagementEnabled}
							onChange={(e) => handleToggleTeamManagement(e.target.checked)}
							className="rounded border-vscode-input-border"
						/>
						<span className="text-sm text-vscode-foreground">{t("settings:teams.enable.label")}</span>
					</label>
				</div>

				{!teamManagementEnabled && (
					<div className="p-3 bg-vscode-inputValidation-warningBackground border border-vscode-inputValidation-warningBorder rounded">
						<p className="text-sm text-vscode-inputValidation-warningForeground">
							{t("settings:teams.disabled.warning")}
						</p>
					</div>
				)}
			</div>

			{teamManagementEnabled && (
				<>
					{/* 当前状态 */}
					<div className="space-y-4">
						<h4 className="text-md font-medium text-vscode-foreground">
							{t("settings:teams.status.title")}
						</h4>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<Users className="w-4 h-4 text-vscode-descriptionForeground" />
									<span className="text-sm font-medium text-vscode-foreground">
										{t("settings:teams.status.currentTeam")}
									</span>
								</div>
								<p className="text-lg text-vscode-foreground">
									{currentTeam || t("settings:common.notSelected")}
								</p>
							</div>

							<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<Settings className="w-4 h-4 text-vscode-descriptionForeground" />
									<span className="text-sm font-medium text-vscode-foreground">
										{t("settings:teams.status.customTeams")}
									</span>
								</div>
								<p className="text-lg text-vscode-foreground">
									{customTeams?.length || 0} {t("settings:common.count")}
								</p>
							</div>

							<div className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<Settings className="w-4 h-4 text-vscode-descriptionForeground" />
									<span className="text-sm font-medium text-vscode-foreground">
										{t("settings:teams.status.customModes")}
									</span>
								</div>
								<p className="text-lg text-vscode-foreground">
									{customModes?.length || 0} {t("settings:common.count")}
								</p>
							</div>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="space-y-4">
						<h4 className="text-md font-medium text-vscode-foreground">
							{t("settings:teams.management.title")}
						</h4>

						<div className="flex flex-wrap gap-3">
							<Button
								variant="default"
								onClick={handleOpenManagement}
								className="flex items-center gap-2">
								<Settings className="w-4 h-4" />
								{t("settings:teams.management.teamManagement")}
							</Button>

							<StandardTooltip content={t("settings:teams.management.importTooltip")}>
								<Button variant="ghost" onClick={handleImportTeams} className="flex items-center gap-2">
									<Upload className="w-4 h-4" />
									{t("settings:teams.management.importConfig")}
								</Button>
							</StandardTooltip>

							<StandardTooltip content={t("settings:teams.management.exportTooltip")}>
								<Button
									variant="ghost"
									onClick={handleExportAllTeams}
									className="flex items-center gap-2">
									<Download className="w-4 h-4" />
									{t("settings:teams.management.exportConfig")}
								</Button>
							</StandardTooltip>

							<StandardTooltip content={t("settings:teams.management.resetTooltip")}>
								<Button
									variant="ghost"
									onClick={handleResetToDefaults}
									className="flex items-center gap-2 text-vscode-errorForeground hover:text-vscode-errorForeground">
									<Settings className="w-4 h-4" />
									{t("settings:teams.management.resetDefaults")}
								</Button>
							</StandardTooltip>
						</div>
					</div>

					{/* 帮助信息 */}
					<div className="space-y-4">
						<h4 className="text-md font-medium text-vscode-foreground">
							{t("settings:teams.usage.title")}
						</h4>

						<div className="bg-vscode-textBlockQuote-background border-l-4 border-vscode-textBlockQuote-border p-4">
							<div className="space-y-2 text-sm text-vscode-foreground">
								<p>
									<strong>{t("settings:teams.usage.features")}</strong>
								</p>
								<ul className="list-disc list-inside space-y-1 text-vscode-descriptionForeground">
									<li>{t("settings:teams.usage.feature1")}</li>
									<li>{t("settings:teams.usage.feature2")}</li>
									<li>{t("settings:teams.usage.feature3")}</li>
									<li>{t("settings:teams.usage.feature4")}</li>
									<li>{t("settings:teams.usage.feature5")}</li>
								</ul>

								<p className="mt-3">
									<strong>{t("settings:teams.quickStart.title")}</strong>
								</p>
								<ol className="list-decimal list-inside space-y-1 text-vscode-descriptionForeground">
									<li>{t("settings:teams.quickStart.step1")}</li>
									<li>{t("settings:teams.quickStart.step2")}</li>
									<li>{t("settings:teams.quickStart.step3")}</li>
									<li>{t("settings:teams.quickStart.step4")}</li>
									<li>{t("settings:teams.quickStart.step5")}</li>
								</ol>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
