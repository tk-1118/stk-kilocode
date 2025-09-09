import React, { useState, useEffect, useCallback } from "react"
import { Save, X, Plus, Trash2 } from "lucide-react"
import { ExtendedTeamConfig, TeamMemberConfig, ModeConfig } from "@roo-code/types"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"
// import { useAppTranslation } from "@/i18n/TranslationContext" // 暂时未使用

import { ModeSelector } from "./ModeSelector"
import { TeamMemberItem } from "./TeamMemberItem"
import { validateTeamConfig, formatTeamSlug } from "@/utils/teamValidation"
import { isBaseMode, getBaseModeList } from "@/utils/teams"
import { TeamStatusIndicator } from "./TeamStatusIndicator"

interface TeamEditorProps {
	team?: ExtendedTeamConfig | null
	availableModes: ModeConfig[]
	isCreating: boolean
	onSave: (teamData: Partial<ExtendedTeamConfig>) => void
	onCancel: () => void
}

/**
 * 团队编辑器组件
 * 用于创建和编辑团队配置
 *
 * 功能特性：
 * - 支持团队基本信息编辑（名称、描述、图标、颜色）
 * - 动态成员管理（添加、删除、配置成员）
 * - 工作流程自定义配置
 * - 任务分配策略设置
 * - 实时表单验证和错误提示
 * - 响应式布局设计
 */
export const TeamEditor: React.FC<TeamEditorProps> = ({ team, availableModes, isCreating, onSave, onCancel }) => {
	// const { t } = useAppTranslation() // 暂时未使用翻译功能
	const [formData, setFormData] = useState<Partial<ExtendedTeamConfig>>({
		slug: "",
		name: "",
		description: "",
		iconName: "codicon-organization",
		color: "#007ACC",
		baseModes: getBaseModeList().slice(0, 2),
		specialtyModes: [],
		members: [],
		collaboration: {
			workflow: ["需求分析", "设计开发", "测试部署"],
			taskAssignment: "auto",
		},
	})
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [showModeSelector, setShowModeSelector] = useState(false)

	// 初始化表单数据
	useEffect(() => {
		if (team && !isCreating) {
			console.log("TeamEditor - initializing with team:", team)
			console.log("TeamEditor - team.members:", team.members)

			// 如果团队没有成员数据，根据baseModes和specialtyModes生成成员列表
			let members = team.members
			if (!members || members.length === 0) {
				const allModes = [...(team.baseModes || []), ...(team.specialtyModes || [])]
				const modeNames: Record<string, string> = {
					architect: "架构师",
					code: "编程助手",
					ask: "问答助手",
					debug: "调试专家",
					orchestrator: "协调者",
				}

				members = allModes.map((slug, index) => ({
					modeSlug: slug,
					displayName: modeNames[slug] || slug,
					isActive: true,
					priority: index,
					permissions: [],
				}))
				console.log("TeamEditor - generated members from modes:", members)
			}

			setFormData({
				...team,
				members: members || [],
			})
		}
	}, [team, isCreating])

	// 表单验证 - 使用统一的验证工具
	const validateForm = useCallback((): boolean => {
		const validation = validateTeamConfig(formData, [], isCreating)
		setErrors(validation.errors)
		return validation.isValid
	}, [formData, isCreating])

	// 更新表单字段
	const updateField = useCallback(
		(field: keyof ExtendedTeamConfig, value: any) => {
			console.log("TeamEditor - updateField called:", field, value)
			setFormData((prev) => {
				const newData = {
					...prev,
					[field]: value,
				}
				console.log("TeamEditor - new formData:", newData)
				return newData
			})
			// 清除相关错误
			if (errors[field]) {
				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors[field]
					return newErrors
				})
			}
		},
		[errors],
	)

	// 添加成员
	const handleAddMember = useCallback(
		(modeSlug: string) => {
			console.log("TeamEditor - handleAddMember called with:", modeSlug)
			console.log("TeamEditor - current formData.members:", formData.members)

			const mode = availableModes.find((m) => m.slug === modeSlug)
			if (!mode) {
				console.log("TeamEditor - mode not found:", modeSlug)
				return
			}

			const existingMember = formData.members?.find((m) => m.modeSlug === modeSlug)
			if (existingMember) {
				console.log("TeamEditor - member already exists:", modeSlug)
				return
			}

			const newMember: TeamMemberConfig = {
				modeSlug,
				displayName: mode.name,
				isActive: true,
				priority: formData.members?.length || 0,
				permissions: [],
			}

			const updatedMembers = [...(formData.members || []), newMember]
			console.log("TeamEditor - updating members to:", updatedMembers)
			updateField("members", updatedMembers)

			// 同时更新baseModes或specialtyModes
			if (isBaseMode(modeSlug)) {
				const currentBaseModes = formData.baseModes || []
				if (!currentBaseModes.includes(modeSlug)) {
					updateField("baseModes", [...currentBaseModes, modeSlug])
				}
			} else {
				const currentSpecialtyModes = formData.specialtyModes || []
				if (!currentSpecialtyModes.includes(modeSlug)) {
					updateField("specialtyModes", [...currentSpecialtyModes, modeSlug])
				}
			}

			setShowModeSelector(false)
		},
		[availableModes, formData.members, formData.baseModes, formData.specialtyModes, updateField],
	)

	// 移除成员
	const handleRemoveMember = useCallback(
		(modeSlug: string) => {
			const updatedMembers = formData.members?.filter((m) => m.modeSlug !== modeSlug) || []
			updateField("members", updatedMembers)

			// 同时从baseModes或specialtyModes中移除
			updateField("baseModes", formData.baseModes?.filter((mode) => mode !== modeSlug) || [])
			updateField("specialtyModes", formData.specialtyModes?.filter((mode) => mode !== modeSlug) || [])
		},
		[formData.members, formData.baseModes, formData.specialtyModes, updateField],
	)

	// 更新成员配置
	const handleUpdateMember = useCallback(
		(modeSlug: string, updates: Partial<TeamMemberConfig>) => {
			const updatedMembers =
				formData.members?.map((member) =>
					member.modeSlug === modeSlug ? { ...member, ...updates } : member,
				) || []
			updateField("members", updatedMembers)
		},
		[formData.members, updateField],
	)

	// 保存团队
	const handleSave = useCallback(() => {
		if (!validateForm()) return

		onSave(formData)
	}, [formData, validateForm, onSave])

	// 获取可添加的模式
	const getAvailableModes = useCallback(() => {
		const existingModes = new Set([...(formData.baseModes || []), ...(formData.specialtyModes || [])])
		return availableModes.filter((mode) => !existingModes.has(mode.slug))
	}, [availableModes, formData.baseModes, formData.specialtyModes])

	// 预设颜色选项 - 精心挑选的专业配色方案
	const colorOptions = [
		"#007ACC", // VS Code 蓝
		"#61DAFB", // React 蓝
		"#68217A", // Spring 紫
		"#FF6B6B", // 珊瑚红
		"#4CAF50", // 材料绿
		"#FF9800", // 橙色
		"#9C27B0", // 紫色
		"#2196F3", // 蓝色
		"#F44336", // 红色
		"#795548", // 棕色
	]

	return (
		<div className="flex flex-col h-full bg-vscode-editor-background">
			{/* 头部 */}
			<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
				<h2 className="text-lg font-semibold text-vscode-foreground">
					{isCreating ? "创建团队" : `编辑团队: ${team?.name}`}
				</h2>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={onCancel} className="flex items-center gap-2">
						<X className="w-4 h-4" />
						取消
					</Button>
					<Button variant="default" size="sm" onClick={handleSave} className="flex items-center gap-2">
						<Save className="w-4 h-4" />
						保存
					</Button>
				</div>
			</div>

			{/* 表单内容 */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="max-w-2xl mx-auto space-y-6">
					{/* 基本信息 */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-vscode-foreground">基本信息</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-vscode-foreground mb-1">
									团队标识 *
								</label>
								<input
									type="text"
									value={formData.slug || ""}
									onChange={(e) => updateField("slug", e.target.value)}
									placeholder="team-slug"
									disabled={!isCreating}
									onBlur={(e) => {
										if (isCreating && e.target.value) {
											const formatted = formatTeamSlug(e.target.value)
											if (formatted !== e.target.value) {
												updateField("slug", formatted)
											}
										}
									}}
									className={cn(
										"w-full px-3 py-2 text-sm bg-vscode-input-background border rounded",
										"focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground",
										errors.slug ? "border-vscode-errorForeground" : "border-vscode-input-border",
										!isCreating && "opacity-50 cursor-not-allowed",
									)}
								/>
								{errors.slug && (
									<p className="text-xs text-vscode-errorForeground mt-1">{errors.slug}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-vscode-foreground mb-1">
									团队名称 *
								</label>
								<input
									type="text"
									value={formData.name || ""}
									onChange={(e) => updateField("name", e.target.value)}
									placeholder="我的开发团队"
									className={cn(
										"w-full px-3 py-2 text-sm bg-vscode-input-background border rounded",
										"focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground",
										errors.name ? "border-vscode-errorForeground" : "border-vscode-input-border",
									)}
								/>
								{errors.name && (
									<p className="text-xs text-vscode-errorForeground mt-1">{errors.name}</p>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">团队描述</label>
							<textarea
								value={formData.description || ""}
								onChange={(e) => updateField("description", e.target.value)}
								placeholder="描述团队的职责和特点..."
								rows={3}
								className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-vscode-foreground mb-1">
									团队图标
								</label>
								<select
									value={formData.iconName || ""}
									onChange={(e) => updateField("iconName", e.target.value)}
									className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground">
									<option value="codicon-organization">组织</option>
									<option value="codicon-people">团队</option>
									<option value="codicon-layers">层级</option>
									<option value="codicon-browser">前端</option>
									<option value="codicon-server">后端</option>
									<option value="codicon-database">数据</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-vscode-foreground mb-1">主题色</label>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={formData.color || "#007ACC"}
										onChange={(e) => updateField("color", e.target.value)}
										className="w-8 h-8 rounded border border-vscode-input-border cursor-pointer"
									/>
									<div className="flex gap-1">
										{colorOptions.map((color) => (
											<button
												key={color}
												onClick={() => updateField("color", color)}
												className={cn(
													"w-6 h-6 rounded border-2 cursor-pointer",
													formData.color === color
														? "border-vscode-focusBorder"
														: "border-transparent",
												)}
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 团队成员 */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-md font-medium text-vscode-foreground">团队成员</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowModeSelector(true)}
								disabled={getAvailableModes().length === 0}
								className="flex items-center gap-2">
								<Plus className="w-4 h-4" />
								添加成员
							</Button>
						</div>

						{errors.modes && <p className="text-xs text-vscode-errorForeground">{errors.modes}</p>}

						{(() => {
							console.log("TeamEditor - rendering members, formData.members:", formData.members)
							console.log("TeamEditor - members length:", formData.members?.length)
							return formData.members && formData.members.length > 0
						})() ? (
							<div className="space-y-2">
								{formData.members!.map((member, index) => (
									<TeamMemberItem
										key={member.modeSlug}
										member={member}
										mode={availableModes.find((m) => m.slug === member.modeSlug)}
										index={index}
										onUpdate={(updates: Partial<TeamMemberConfig>) =>
											handleUpdateMember(member.modeSlug, updates)
										}
										onRemove={() => handleRemoveMember(member.modeSlug)}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-vscode-descriptionForeground">
								<div className="text-2xl mb-2">👥</div>
								<p className="text-sm">暂无团队成员</p>
								<p className="text-xs mt-1">点击&ldquo;添加成员&rdquo;来构建您的团队</p>
							</div>
						)}
					</div>

					{/* 团队状态预览 */}
					{!isCreating && formData.slug && (
						<div className="space-y-4">
							<h3 className="text-md font-medium text-vscode-foreground">团队状态</h3>
							<TeamStatusIndicator team={formData as ExtendedTeamConfig} showDetails={true} />
						</div>
					)}

					{/* 协作配置 */}
					<div className="space-y-4">
						<h3 className="text-md font-medium text-vscode-foreground">协作配置</h3>

						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">工作流程</label>
							<div className="space-y-2">
								{formData.collaboration?.workflow?.map((step, index) => (
									<div key={index} className="flex items-center gap-2">
										<input
											type="text"
											value={step}
											onChange={(e) => {
												const newWorkflow = [...(formData.collaboration?.workflow || [])]
												newWorkflow[index] = e.target.value
												updateField("collaboration", {
													...formData.collaboration,
													workflow: newWorkflow,
												})
											}}
											className="flex-1 px-3 py-1.5 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												const newWorkflow =
													formData.collaboration?.workflow?.filter((_, i) => i !== index) ||
													[]
												updateField("collaboration", {
													...formData.collaboration,
													workflow: newWorkflow,
												})
											}}
											className="p-1">
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										const newWorkflow = [...(formData.collaboration?.workflow || []), "新步骤"]
										updateField("collaboration", {
											...formData.collaboration,
											workflow: newWorkflow,
										})
									}}
									className="flex items-center gap-2">
									<Plus className="w-4 h-4" />
									添加步骤
								</Button>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">
								任务分配策略
							</label>
							<select
								value={formData.collaboration?.taskAssignment || "auto"}
								onChange={(e) =>
									updateField("collaboration", {
										...formData.collaboration,
										taskAssignment: e.target.value as "auto" | "manual" | "hybrid",
									})
								}
								className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground">
								<option value="auto">自动分配</option>
								<option value="manual">手动分配</option>
								<option value="hybrid">混合模式</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* 模式选择器弹窗 */}
			{showModeSelector && (
				<ModeSelector
					availableModes={getAvailableModes()}
					onSelect={handleAddMember}
					onClose={() => setShowModeSelector(false)}
				/>
			)}
		</div>
	)
}
