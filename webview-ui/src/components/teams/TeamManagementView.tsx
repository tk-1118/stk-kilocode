import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Settings, Upload, Search } from "lucide-react"
import { TeamConfig, ExtendedTeamConfig, ModeConfig } from "@roo-code/types"
import { Button, StandardTooltip } from "@/components/ui"
// import { cn } from "@/lib/utils"
import { vscode } from "@/utils/vscode"
// import { useAppTranslation } from "@/i18n/TranslationContext" // 暂时未使用翻译功能
import { DEFAULT_TEAMS, DEFAULT_MODES } from "@roo-code/types"

import { TeamEditor } from "./TeamEditor"
import { TeamCard } from "./TeamCard"
import { ModeLibrary } from "./ModeLibrary"
import { TeamHealthDashboard } from "./TeamStatusIndicator"

interface TeamManagementViewProps {
	customTeams?: ExtendedTeamConfig[]
	customModes?: ModeConfig[]
	_onTeamChange?: (teams: ExtendedTeamConfig[]) => void // 暂时未使用，但保留接口兼容性
}

/**
 * 团队管理主视图
 * 提供团队的创建、编辑、删除和成员管理功能
 */
export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
	customTeams = [],
	customModes = [],
	_onTeamChange,
}) => {
	// const { t } = useAppTranslation() // 暂时未使用翻译功能

	// 合并内置团队和自定义团队
	const allTeams = useMemo((): ExtendedTeamConfig[] => {
		console.log("TeamManagementView - customTeams:", customTeams)

		// 直接使用内置团队，不调用getAllTeams避免数据污染
		const builtinTeams = DEFAULT_TEAMS.map(
			(team: TeamConfig): ExtendedTeamConfig => ({
				...team,
				isBuiltIn: true,
				version: "1.0.0",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				members: [],
			}),
		)

		// 过滤掉重复的团队（自定义团队优先）
		const customTeamSlugs = new Set(customTeams.map((team) => team.slug))
		const uniqueBuiltinTeams = builtinTeams.filter((team) => !customTeamSlugs.has(team.slug))

		const result = [...uniqueBuiltinTeams, ...customTeams]
		console.log("TeamManagementView - allTeams:", result)

		return result
	}, [customTeams])

	const [teams, setTeams] = useState<ExtendedTeamConfig[]>(allTeams)

	// 合并内置模式和自定义模式
	const allAvailableModes = useMemo(() => {
		const builtinModes = Object.values(DEFAULT_MODES)
		const customModeSlugs = new Set(customModes.map((mode) => mode.slug))
		const uniqueBuiltinModes = builtinModes.filter((mode) => !customModeSlugs.has(mode.slug))
		const result = [...uniqueBuiltinModes, ...customModes]
		console.log(
			"TeamManagementView - allAvailableModes:",
			result.length,
			result.map((m) => m.slug),
		)
		return result
	}, [customModes])

	const [availableModes, setAvailableModes] = useState<ModeConfig[]>(allAvailableModes)
	const [selectedTeam, setSelectedTeam] = useState<ExtendedTeamConfig | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [isCreating, setIsCreating] = useState(false)
	const [showModeLibrary, setShowModeLibrary] = useState(false)
	const [searchQuery, setSearchQuery] = useState("")
	const [filterType, setFilterType] = useState<"all" | "builtin" | "custom">("all")

	// 同步外部数据
	useEffect(() => {
		setTeams(allTeams)
	}, [allTeams])

	useEffect(() => {
		setAvailableModes(allAvailableModes)
	}, [allAvailableModes])

	// 监听团队管理相关消息
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			switch (message.type) {
				case "teamCreated":
					// 团队创建成功，关闭编辑界面
					setIsEditing(false)
					setSelectedTeam(null)
					setIsCreating(false)
					// 不需要手动更新数据，因为后端会通过 postStateToWebview 更新状态
					// ExtensionState 的变化会自动触发 allTeams 的重新计算
					console.log("团队创建成功:", message.teamData)
					break
				case "teamUpdated":
					// 团队更新成功，关闭编辑界面
					setIsEditing(false)
					setSelectedTeam(null)
					setIsCreating(false)
					console.log("团队更新成功")
					break
				case "teamDeleted":
					// 团队删除成功
					setIsEditing(false)
					setSelectedTeam(null)
					setIsCreating(false)
					console.log("团队删除成功")
					break
				case "modeCreated":
					// 模式创建成功
					console.log("模式创建成功:", message.customMode)
					break
				case "modeUpdated":
					// 模式更新成功
					console.log("模式更新成功:", message.customMode)
					break
				case "modeDeleted":
					// 模式删除成功
					console.log("模式删除成功:", message.slug)
					break
				case "teamManagementError":
					// 显示错误消息
					console.error("团队管理错误:", message.text)
					break
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	// 过滤团队
	const filteredTeams = teams.filter((team) => {
		const matchesSearch =
			team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			team.description?.toLowerCase().includes(searchQuery.toLowerCase())

		const matchesFilter =
			filterType === "all" ||
			(filterType === "builtin" && team.isBuiltIn) ||
			(filterType === "custom" && !team.isBuiltIn)

		return matchesSearch && matchesFilter
	})

	// 创建新团队
	const handleCreateTeam = useCallback(() => {
		setSelectedTeam(null)
		setIsCreating(true)
		setIsEditing(true)
	}, [])

	// 编辑团队
	const handleEditTeam = useCallback((team: ExtendedTeamConfig) => {
		if (team.isBuiltIn) {
			// 内置团队不能直接编辑，需要复制
			// 直接显示提示信息，不使用消息框
			console.warn("内置团队不能直接编辑，您可以复制后进行修改")
			return
		}
		setSelectedTeam(team)
		setIsCreating(false)
		setIsEditing(true)
	}, [])

	// 复制团队
	const handleDuplicateTeam = useCallback((team: ExtendedTeamConfig) => {
		const newSlug = `${team.slug}-copy-${Date.now()}`
		const newName = `${team.name} (副本)`

		vscode.postMessage({
			type: "duplicateTeam",
			sourceSlug: team.slug,
			newSlug,
			newName,
		})
	}, [])

	// 删除团队
	const handleDeleteTeam = useCallback((team: ExtendedTeamConfig) => {
		if (team.isBuiltIn) {
			console.error("内置团队不能删除")
			return
		}

		// 直接发送删除请求，让后端处理确认逻辑
		vscode.postMessage({
			type: "deleteTeam",
			teamSlug: team.slug,
			text: `确定要删除团队 "${team.name}" 吗？此操作不可撤销。`,
		})
	}, [])

	// 保存团队
	const handleSaveTeam = useCallback(
		(teamData: Partial<ExtendedTeamConfig>) => {
			if (isCreating) {
				vscode.postMessage({
					type: "createTeam",
					teamData,
				})
			} else if (selectedTeam) {
				vscode.postMessage({
					type: "updateTeam",
					teamSlug: selectedTeam.slug,
					updates: teamData,
				})
			}
			setIsEditing(false)
			setSelectedTeam(null)
		},
		[isCreating, selectedTeam],
	)

	// 取消编辑
	const handleCancelEdit = useCallback(() => {
		setIsEditing(false)
		setSelectedTeam(null)
		setIsCreating(false)
	}, [])

	// 导出团队
	const handleExportTeam = useCallback((team: ExtendedTeamConfig) => {
		vscode.postMessage({
			type: "exportTeam",
			teamSlug: team.slug,
		})
	}, [])

	// 导入团队
	const handleImportTeam = useCallback(() => {
		vscode.postMessage({
			type: "importTeam",
		})
	}, [])

	// 打开模式库
	const handleOpenModeLibrary = useCallback(() => {
		setShowModeLibrary(true)
	}, [])

	if (showModeLibrary) {
		return (
			<ModeLibrary
				availableModes={availableModes}
				onClose={() => setShowModeLibrary(false)}
				onModeCreate={(mode: Partial<ModeConfig>) => {
					vscode.postMessage({
						type: "createMode",
						modeData: mode,
					})
				}}
			/>
		)
	}

	if (isEditing) {
		return (
			<TeamEditor
				team={selectedTeam}
				availableModes={availableModes}
				isCreating={isCreating}
				onSave={handleSaveTeam}
				onCancel={handleCancelEdit}
			/>
		)
	}

	return (
		<div className="flex flex-col h-full bg-vscode-editor-background">
			{/* 头部工具栏 */}
			<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
				<div className="flex items-center gap-4">
					<h2 className="text-lg font-semibold text-vscode-foreground">团队管理</h2>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vscode-descriptionForeground" />
							<input
								type="text"
								placeholder="搜索团队..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8 pr-3 py-1.5 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
							/>
						</div>
						<select
							value={filterType}
							onChange={(e) => setFilterType(e.target.value as any)}
							className="px-3 py-1.5 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground">
							<option value="all">全部团队</option>
							<option value="builtin">内置团队</option>
							<option value="custom">自定义团队</option>
						</select>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<StandardTooltip content="模式库管理">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleOpenModeLibrary}
							className="flex items-center gap-2">
							<Settings className="w-4 h-4" />
							模式库
						</Button>
					</StandardTooltip>

					<StandardTooltip content="导入团队">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleImportTeam}
							className="flex items-center gap-2">
							<Upload className="w-4 h-4" />
							导入
						</Button>
					</StandardTooltip>

					<StandardTooltip content="创建新团队">
						<Button
							variant="default"
							size="sm"
							onClick={handleCreateTeam}
							className="flex items-center gap-2">
							<Plus className="w-4 h-4" />
							新建团队
						</Button>
					</StandardTooltip>
				</div>
			</div>

			{/* 团队健康度仪表盘 */}
			{teams.length > 0 && (
				<div className="p-4 border-b border-vscode-widget-border">
					<h3 className="text-md font-medium text-vscode-foreground mb-3">团队概览</h3>
					<TeamHealthDashboard teams={teams} />
				</div>
			)}

			{/* 团队列表 */}
			<div className="flex-1 overflow-y-auto p-4">
				{filteredTeams.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-vscode-descriptionForeground">
						<div className="text-4xl mb-4">🏢</div>
						<h3 className="text-lg font-medium mb-2">{searchQuery ? "未找到匹配的团队" : "暂无团队"}</h3>
						<p className="text-sm text-center mb-4">
							{searchQuery ? "尝试调整搜索条件或筛选器" : "创建您的第一个自定义团队来开始协作开发"}
						</p>
						{!searchQuery && (
							<Button variant="default" onClick={handleCreateTeam} className="flex items-center gap-2">
								<Plus className="w-4 h-4" />
								创建团队
							</Button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredTeams.map((team) => (
							<TeamCard
								key={team.slug}
								team={team}
								_availableModes={availableModes}
								onEdit={() => handleEditTeam(team)}
								_onDuplicate={() => handleDuplicateTeam(team)}
								onDelete={() => handleDeleteTeam(team)}
								_onExport={() => handleExportTeam(team)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
