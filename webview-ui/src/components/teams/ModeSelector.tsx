import React, { useState, useMemo } from "react"
import { Search, X, Plus, Star, Code, Brain, Bug, Layers } from "lucide-react"
import { ModeConfig } from "@roo-code/types"
import { Button, StandardTooltip } from "@/components/ui"
import { cn } from "@/lib/utils"

interface ModeSelectorProps {
	availableModes: ModeConfig[]
	onSelect: (modeSlug: string) => void
	onClose: () => void
}

/**
 * 模式选择器组件
 * 用于选择要添加到团队的成员（模式）
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({ availableModes, onSelect, onClose }) => {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("all")

	// 模式分类
	const categories = useMemo(() => {
		const basicModes = ["architect", "code", "ask", "debug", "orchestrator"]

		return {
			all: { name: "全部", modes: availableModes },
			basic: {
				name: "基础模式",
				modes: availableModes.filter((mode) => basicModes.includes(mode.slug)),
			},
			specialty: {
				name: "专业模式",
				modes: availableModes.filter((mode) => !basicModes.includes(mode.slug)),
			},
		}
	}, [availableModes])

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

	// 获取模式图标
	const getModeIcon = (modeSlug: string) => {
		switch (modeSlug) {
			case "architect":
				return <Layers className="w-5 h-5" />
			case "code":
				return <Code className="w-5 h-5" />
			case "debug":
				return <Bug className="w-5 h-5" />
			case "ask":
				return <Brain className="w-5 h-5" />
			default:
				return <Star className="w-5 h-5" />
		}
	}

	// 获取模式类型标签
	const getModeTypeLabel = (modeSlug: string) => {
		const basicModes = ["architect", "code", "ask", "debug", "orchestrator"]
		return basicModes.includes(modeSlug) ? "基础" : "专业"
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-vscode-editor-background border border-vscode-widget-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
				{/* 头部 */}
				<div className="flex items-center justify-between p-4 border-b border-vscode-widget-border">
					<h3 className="text-lg font-semibold text-vscode-foreground">选择团队成员</h3>
					<Button variant="ghost" size="sm" onClick={onClose} className="p-1">
						<X className="w-4 h-4" />
					</Button>
				</div>

				{/* 搜索和筛选 */}
				<div className="p-4 border-b border-vscode-widget-border">
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vscode-descriptionForeground" />
							<input
								type="text"
								placeholder="搜索模式..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
							/>
						</div>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-3 py-2 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground">
							{Object.entries(categories).map(([key, category]) => (
								<option key={key} value={key}>
									{category.name} ({category.modes.length})
								</option>
							))}
						</select>
					</div>
				</div>

				{/* 模式列表 */}
				<div className="flex-1 overflow-y-auto p-4">
					{filteredModes.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-vscode-descriptionForeground">
							<div className="text-4xl mb-4">🔍</div>
							<h4 className="text-lg font-medium mb-2">未找到匹配的模式</h4>
							<p className="text-sm text-center">尝试调整搜索条件或选择不同的分类</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredModes.map((mode) => (
								<div
									key={mode.slug}
									className="bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-4 hover:border-vscode-focusBorder transition-colors cursor-pointer"
									onClick={() => onSelect(mode.slug)}>
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0 w-10 h-10 bg-vscode-button-background rounded-lg flex items-center justify-center text-vscode-button-foreground">
											{mode.iconName ? (
												<span className={`codicon ${mode.iconName}`} />
											) : (
												getModeIcon(mode.slug)
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium text-vscode-foreground truncate">
													{mode.name}
												</h4>
												<span
													className={cn(
														"px-2 py-0.5 text-xs rounded",
														getModeTypeLabel(mode.slug) === "基础"
															? "bg-vscode-button-background text-vscode-button-foreground"
															: "bg-vscode-badge-background text-vscode-badge-foreground",
													)}>
													{getModeTypeLabel(mode.slug)}
												</span>
											</div>

											<p className="text-sm text-vscode-descriptionForeground mb-2 line-clamp-2">
												{mode.description || mode.roleDefinition}
											</p>

											{mode.whenToUse && (
												<p className="text-xs text-vscode-descriptionForeground line-clamp-1">
													<strong>适用场景:</strong> {mode.whenToUse}
												</p>
											)}
										</div>

										<div className="flex-shrink-0">
											<StandardTooltip content="添加到团队">
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation()
														onSelect(mode.slug)
													}}
													className="p-2">
													<Plus className="w-4 h-4" />
												</Button>
											</StandardTooltip>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* 底部统计 */}
				<div className="p-4 border-t border-vscode-widget-border">
					<div className="flex items-center justify-between text-sm text-vscode-descriptionForeground">
						<span>显示 {filteredModes.length} 个模式</span>
						<span>点击模式卡片添加到团队</span>
					</div>
				</div>
			</div>
		</div>
	)
}
