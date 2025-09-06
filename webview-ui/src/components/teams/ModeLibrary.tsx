import React, { useState, useMemo } from "react"
import { Plus, Search, Upload, Edit, Trash2, X } from "lucide-react"
import { ModeConfig, DEFAULT_MODES } from "@roo-code/types"
import { Button, StandardTooltip } from "@/components/ui"
import { cn } from "@/lib/utils"
import { vscode } from "@/utils/vscode"

interface ModeLibraryProps {
	availableModes: ModeConfig[] // 自定义模式
	onClose: () => void
	onModeCreate: (mode: Partial<ModeConfig>) => void
}

/**
 * 模式库管理组件
 * 提供模式的创建、编辑、删除和导入导出功能
 */
export const ModeLibrary: React.FC<ModeLibraryProps> = ({ availableModes, onClose, onModeCreate }) => {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [editingMode, setEditingMode] = useState<ModeConfig | null>(null)

	// 合并所有模式：内置模式 + 自定义模式
	const allModes = useMemo(() => {
		// 获取所有内置模式
		const builtinModes = Object.values(DEFAULT_MODES)

		// 过滤掉重复的模式（自定义模式优先）
		const customModeSlugs = new Set(availableModes.map((mode) => mode.slug))
		const uniqueBuiltinModes = builtinModes.filter((mode) => !customModeSlugs.has(mode.slug))

		return [...uniqueBuiltinModes, ...availableModes]
	}, [availableModes])

	// 模式分类
	const categories = useMemo(() => {
		const basicModes = ["architect", "code", "ask", "debug", "orchestrator"]

		return {
			all: { name: "全部模式", modes: allModes },
			basic: {
				name: "基础模式",
				modes: allModes.filter((mode) => basicModes.includes(mode.slug)),
			},
			custom: {
				name: "自定义模式",
				modes: availableModes, // 只显示自定义模式
			},
			builtin: {
				name: "内置模式",
				modes: allModes.filter((mode) => !basicModes.includes(mode.slug) && mode.source === "global"),
			},
		}
	}, [allModes, availableModes])

	// 过滤模式
	const filteredModes = useMemo(() => {
		let modes = categories[selectedCategory as keyof typeof categories]?.modes || []

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			modes = modes.filter(
				(mode) =>
					mode.name.toLowerCase().includes(query) ||
					mode.slug.toLowerCase().includes(query) ||
					mode.description?.toLowerCase().includes(query) ||
					mode.roleDefinition.toLowerCase().includes(query),
			)
		}

		return modes
	}, [categories, selectedCategory, searchQuery])

	// 创建新模式
	const handleCreateMode = () => {
		setShowCreateForm(true)
	}

	// 编辑模式
	const handleEditMode = (mode: ModeConfig) => {
		setEditingMode(mode)
	}

	// 保存编辑的模式
	const handleSaveEditedMode = (modeData: Partial<ModeConfig>) => {
		if (editingMode) {
			vscode.postMessage({
				type: "editMode",
				modeSlug: editingMode.slug,
				modeData: modeData,
			})
			setEditingMode(null)
		}
	}

	// 复制模式 - 暂时禁用
	// const handleDuplicateMode = (mode: ModeConfig) => {
	// 	const newSlug = `${mode.slug}-copy-${Date.now()}`
	// 	const newName = `${mode.name} (副本)`

	// 	const duplicatedMode: Partial<ModeConfig> = {
	// 		...mode,
	// 		slug: newSlug,
	// 		name: newName,
	// 		source: "project"
	// 	}

	// 	onModeCreate(duplicatedMode)
	// }

	// 删除模式
	const handleDeleteMode = (mode: ModeConfig) => {
		if (mode.source === "global") {
			console.error("内置模式不能删除")
			return
		}

		// 直接发送删除请求，让后端处理确认逻辑
		vscode.postMessage({
			type: "deleteMode",
			modeSlug: mode.slug,
			text: `确定要删除模式 "${mode.name}" 吗？此操作不可撤销。`,
		})
	}

	// 导出模式 - 暂时禁用
	// const handleExportMode = (mode: ModeConfig) => {
	// 	vscode.postMessage({
	// 		type: "exportMode",
	// 		modeSlug: mode.slug
	// 	})
	// }

	// 导入模式
	const handleImportMode = () => {
		vscode.postMessage({
			type: "importMode",
		})
	}

	// 获取模式类型标签
	const getModeTypeLabel = (mode: ModeConfig) => {
		const basicModes = ["architect", "code", "ask", "debug", "orchestrator"]
		if (basicModes.includes(mode.slug)) return "基础"
		if (mode.source === "global") return "内置"
		return "自定义"
	}

	// 获取模式类型样式
	const getModeTypeStyle = (mode: ModeConfig) => {
		const type = getModeTypeLabel(mode)
		switch (type) {
			case "基础":
				return "bg-blue-500/20 text-blue-400 border-blue-500/30"
			case "内置":
				return "bg-green-500/20 text-green-400 border-green-500/30"
			case "自定义":
				return "bg-purple-500/20 text-purple-400 border-purple-500/30"
			default:
				return "bg-gray-500/20 text-gray-400 border-gray-500/30"
		}
	}

	if (showCreateForm) {
		return (
			<ModeCreateForm
				onSave={(modeData) => {
					onModeCreate(modeData)
					setShowCreateForm(false)
				}}
				onCancel={() => setShowCreateForm(false)}
			/>
		)
	}

	if (editingMode) {
		return <ModeEditForm mode={editingMode} onSave={handleSaveEditedMode} onCancel={() => setEditingMode(null)} />
	}

	return (
		<div className="flex flex-col h-full bg-vscode-editor-background">
			{/* 头部工具栏 */}
			<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
				<div className="flex items-center gap-4">
					<h2 className="text-lg font-semibold text-vscode-foreground">模式库管理</h2>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vscode-descriptionForeground" />
							<input
								type="text"
								placeholder="搜索模式..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8 pr-3 py-1.5 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
							/>
						</div>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-3 py-1.5 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground">
							{Object.entries(categories).map(([key, category]) => (
								<option key={key} value={key}>
									{category.name} ({category.modes.length})
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<StandardTooltip content="导入模式">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleImportMode}
							className="flex items-center gap-2">
							<Upload className="w-4 h-4" />
							导入
						</Button>
					</StandardTooltip>

					<StandardTooltip content="创建新模式">
						<Button
							variant="default"
							size="sm"
							onClick={handleCreateMode}
							className="flex items-center gap-2">
							<Plus className="w-4 h-4" />
							新建模式
						</Button>
					</StandardTooltip>

					<StandardTooltip content="关闭">
						<Button variant="ghost" size="sm" onClick={onClose} className="p-1">
							<X className="w-4 h-4" />
						</Button>
					</StandardTooltip>
				</div>
			</div>

			{/* 模式列表 */}
			<div className="flex-1 overflow-y-auto p-4">
				{filteredModes.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-vscode-descriptionForeground">
						<div className="text-4xl mb-4">🤖</div>
						<h3 className="text-lg font-medium mb-2">{searchQuery ? "未找到匹配的模式" : "暂无模式"}</h3>
						<p className="text-sm text-center mb-4">
							{searchQuery ? "尝试调整搜索条件或筛选器" : "创建您的第一个自定义模式"}
						</p>
						{!searchQuery && (
							<Button variant="default" onClick={handleCreateMode} className="flex items-center gap-2">
								<Plus className="w-4 h-4" />
								创建模式
							</Button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredModes.map((mode) => (
							<div
								key={mode.slug}
								className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-4 hover:border-vscode-focusBorder transition-colors">
								{/* 模式头部 */}
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<div className="w-10 h-10 bg-vscode-button-background rounded-lg flex items-center justify-center text-vscode-button-foreground">
											{mode.iconName ? (
												<span className={`codicon ${mode.iconName}`} />
											) : (
												<span className="text-lg">🤖</span>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-vscode-foreground truncate">{mode.name}</h3>
											<div className="flex items-center gap-2 mt-1">
												<span className="text-xs text-vscode-descriptionForeground">
													{mode.slug}
												</span>
												<span
													className={cn(
														"px-2 py-0.5 text-xs rounded border",
														getModeTypeStyle(mode),
													)}>
													{getModeTypeLabel(mode)}
												</span>
											</div>
										</div>
									</div>

									{/* 操作按钮 */}
									<div className="flex items-center gap-1">
										{mode.source === "project" && (
											<StandardTooltip content="编辑模式">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditMode(mode)}
													className="p-1">
													<Edit className="w-4 h-4" />
												</Button>
											</StandardTooltip>
										)}

										{/* 暂时隐藏复制和导出功能 */}
										{/* <StandardTooltip content="复制模式">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDuplicateMode(mode)}
												className="p-1">
												<Copy className="w-4 h-4" />
											</Button>
										</StandardTooltip>

										<StandardTooltip content="导出模式">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleExportMode(mode)}
												className="p-1">
												<Download className="w-4 h-4" />
											</Button>
										</StandardTooltip> */}

										{mode.source === "project" && (
											<StandardTooltip content="删除模式">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteMode(mode)}
													className="p-1 text-vscode-errorForeground hover:text-vscode-errorForeground">
													<Trash2 className="w-4 h-4" />
												</Button>
											</StandardTooltip>
										)}
									</div>
								</div>

								{/* 模式描述 */}
								<p className="text-sm text-vscode-descriptionForeground mb-3 line-clamp-3">
									{mode.description || mode.roleDefinition}
								</p>

								{/* 适用场景 */}
								{mode.whenToUse && (
									<div className="mb-3">
										<h4 className="text-xs font-medium text-vscode-foreground mb-1">适用场景</h4>
										<p className="text-xs text-vscode-descriptionForeground line-clamp-2">
											{mode.whenToUse}
										</p>
									</div>
								)}

								{/* 工具组 */}
								{mode.groups && mode.groups.length > 0 && (
									<div>
										<h4 className="text-xs font-medium text-vscode-foreground mb-1">工具组</h4>
										<div className="flex flex-wrap gap-1">
											{mode.groups.slice(0, 3).map((group, index) => (
												<span
													key={index}
													className="px-1.5 py-0.5 text-xs bg-vscode-input-background text-vscode-input-foreground rounded">
													{Array.isArray(group) ? group[0] : group}
												</span>
											))}
											{mode.groups.length > 3 && (
												<span className="text-xs text-vscode-descriptionForeground">
													+{mode.groups.length - 3}
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

// 模式创建表单组件
interface ModeCreateFormProps {
	onSave: (modeData: Partial<ModeConfig>) => void
	onCancel: () => void
}

const ModeCreateForm: React.FC<ModeCreateFormProps> = ({ onSave, onCancel }) => {
	const [formData, setFormData] = useState<Partial<ModeConfig>>({
		slug: "",
		name: "",
		roleDefinition: "",
		description: "",
		whenToUse: "",
		customInstructions: "",
		groups: ["read", "edit"],
		source: "project",
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	// 表单验证
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.slug?.trim()) {
			newErrors.slug = "模式标识不能为空"
		} else if (!/^[a-zA-Z0-9-]+$/.test(formData.slug)) {
			newErrors.slug = "模式标识只能包含字母、数字和短横线"
		}

		if (!formData.name?.trim()) {
			newErrors.name = "模式名称不能为空"
		}

		if (!formData.roleDefinition?.trim()) {
			newErrors.roleDefinition = "角色定义不能为空"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// 更新表单字段
	const updateField = (field: keyof ModeConfig, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[field]
				return newErrors
			})
		}
	}

	// 保存模式
	const handleSave = () => {
		if (!validateForm()) return
		onSave(formData)
	}

	return (
		<div className="flex flex-col h-full bg-vscode-editor-background">
			{/* 头部 */}
			<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
				<h2 className="text-lg font-semibold text-vscode-foreground">创建新模式</h2>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={onCancel}>
						取消
					</Button>
					<Button variant="default" size="sm" onClick={handleSave}>
						保存
					</Button>
				</div>
			</div>

			{/* 表单内容 */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="max-w-2xl mx-auto space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">模式标识 *</label>
							<input
								type="text"
								value={formData.slug || ""}
								onChange={(e) => updateField("slug", e.target.value)}
								placeholder="my-custom-mode"
								className={cn(
									"w-full px-3 py-2 text-sm bg-vscode-input-background border rounded",
									"focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground",
									errors.slug ? "border-vscode-errorForeground" : "border-vscode-input-border",
								)}
							/>
							{errors.slug && <p className="text-xs text-vscode-errorForeground mt-1">{errors.slug}</p>}
						</div>

						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">模式名称 *</label>
							<input
								type="text"
								value={formData.name || ""}
								onChange={(e) => updateField("name", e.target.value)}
								placeholder="我的自定义模式"
								className={cn(
									"w-full px-3 py-2 text-sm bg-vscode-input-background border rounded",
									"focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground",
									errors.name ? "border-vscode-errorForeground" : "border-vscode-input-border",
								)}
							/>
							{errors.name && <p className="text-xs text-vscode-errorForeground mt-1">{errors.name}</p>}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">角色定义 *</label>
						<textarea
							value={formData.roleDefinition || ""}
							onChange={(e) => updateField("roleDefinition", e.target.value)}
							placeholder="你是一个专业的..."
							rows={4}
							className={cn(
								"w-full px-3 py-2 text-sm bg-vscode-input-background border rounded",
								"focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none",
								errors.roleDefinition ? "border-vscode-errorForeground" : "border-vscode-input-border",
							)}
						/>
						{errors.roleDefinition && (
							<p className="text-xs text-vscode-errorForeground mt-1">{errors.roleDefinition}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">模式描述</label>
						<textarea
							value={formData.description || ""}
							onChange={(e) => updateField("description", e.target.value)}
							placeholder="简要描述这个模式的功能和特点..."
							rows={2}
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">适用场景</label>
						<textarea
							value={formData.whenToUse || ""}
							onChange={(e) => updateField("whenToUse", e.target.value)}
							placeholder="什么时候使用这个模式..."
							rows={2}
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
						/>
					</div>

					{/* 自定义指令 - 只在自定义模式时显示 */}
					{formData.source === "project" && (
						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">自定义指令</label>
							<textarea
								value={formData.customInstructions || ""}
								onChange={(e) => updateField("customInstructions", e.target.value)}
								placeholder="为这个模式添加特定的自定义指令..."
								rows={3}
								className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
							/>
							<p className="text-xs text-vscode-descriptionForeground mt-1">
								这些指令将在使用此模式时自动应用，用于定制模式的特定行为
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

// 模式编辑表单组件
interface ModeEditFormProps {
	mode: ModeConfig
	onSave: (modeData: Partial<ModeConfig>) => void
	onCancel: () => void
}

const ModeEditForm: React.FC<ModeEditFormProps> = ({ mode, onSave, onCancel }) => {
	const [formData, setFormData] = useState<Partial<ModeConfig>>({
		slug: mode.slug,
		name: mode.name,
		roleDefinition: mode.roleDefinition,
		description: mode.description,
		whenToUse: mode.whenToUse,
		customInstructions: mode.customInstructions,
		source: mode.source,
	})

	const updateField = (field: keyof ModeConfig, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleSave = () => {
		if (!formData.name?.trim()) {
			alert("请输入模式名称")
			return
		}

		onSave(formData)
	}

	return (
		<div className="flex flex-col h-full bg-vscode-editor-background">
			{/* 头部 */}
			<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
				<div className="flex items-center gap-2">
					<Edit className="w-5 h-5 text-vscode-foreground" />
					<h2 className="text-lg font-semibold text-vscode-foreground">编辑模式</h2>
				</div>
				<Button variant="ghost" size="sm" onClick={onCancel} className="p-1">
					<X className="w-4 h-4" />
				</Button>
			</div>

			{/* 表单内容 */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4 max-w-2xl">
					{/* 模式标识 - 不可编辑 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">模式标识</label>
						<input
							type="text"
							value={formData.slug || ""}
							disabled
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded text-vscode-descriptionForeground cursor-not-allowed"
						/>
						<p className="text-xs text-vscode-descriptionForeground mt-1">模式标识不可修改</p>
					</div>

					{/* 模式名称 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">模式名称 *</label>
						<input
							type="text"
							value={formData.name || ""}
							onChange={(e) => updateField("name", e.target.value)}
							placeholder="输入模式名称..."
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
						/>
					</div>

					{/* 角色定义 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">角色定义</label>
						<textarea
							value={formData.roleDefinition || ""}
							onChange={(e) => updateField("roleDefinition", e.target.value)}
							placeholder="定义这个模式的角色和职责..."
							rows={3}
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
						/>
					</div>

					{/* 模式描述 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">模式描述</label>
						<textarea
							value={formData.description || ""}
							onChange={(e) => updateField("description", e.target.value)}
							placeholder="描述这个模式的功能和特点..."
							rows={2}
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
						/>
					</div>

					{/* 使用场景 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">使用场景</label>
						<textarea
							value={formData.whenToUse || ""}
							onChange={(e) => updateField("whenToUse", e.target.value)}
							placeholder="什么时候使用这个模式..."
							rows={2}
							className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
						/>
					</div>

					{/* 自定义指令 - 只在自定义模式时显示 */}
					{formData.source === "project" && (
						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">自定义指令</label>
							<textarea
								value={formData.customInstructions || ""}
								onChange={(e) => updateField("customInstructions", e.target.value)}
								placeholder="为这个模式添加特定的自定义指令..."
								rows={3}
								className="w-full px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground resize-none"
							/>
							<p className="text-xs text-vscode-descriptionForeground mt-1">
								这些指令将在使用此模式时自动应用，用于定制模式的特定行为
							</p>
						</div>
					)}

					{/* 操作按钮 */}
					<div className="flex items-center gap-3 pt-4">
						<Button onClick={handleSave} className="px-4 py-2">
							保存修改
						</Button>
						<Button variant="ghost" onClick={onCancel} className="px-4 py-2">
							取消
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
