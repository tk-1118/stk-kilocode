import React, { useState } from "react"
import { GripVertical, Eye, EyeOff, Trash2, Settings } from "lucide-react"
import { TeamMemberConfig, ModeConfig } from "@roo-code/types"
import { Button, StandardTooltip } from "@/components/ui"
import { cn } from "@/lib/utils"
import { getModeDisplayName, isBaseMode } from "@/utils/teams"

interface TeamMemberItemProps {
	member: TeamMemberConfig
	mode?: ModeConfig
	index: number
	onUpdate: (updates: Partial<TeamMemberConfig>) => void
	onRemove: () => void
}

/**
 * 团队成员项组件
 * 显示和编辑单个团队成员的信息
 */
export const TeamMemberItem: React.FC<TeamMemberItemProps> = ({ member, mode, index: _index, onUpdate, onRemove }) => {
	const [showSettings, setShowSettings] = useState(false)
	const [editingName, setEditingName] = useState(false)
	const [tempDisplayName, setTempDisplayName] = useState(member.displayName || "")

	// 保存显示名称
	const handleSaveDisplayName = () => {
		onUpdate({ displayName: tempDisplayName.trim() || mode?.name })
		setEditingName(false)
	}

	// 取消编辑显示名称
	const handleCancelEditName = () => {
		setTempDisplayName(member.displayName || mode?.name || "")
		setEditingName(false)
	}

	// 切换激活状态
	const handleToggleActive = () => {
		onUpdate({ isActive: !member.isActive })
	}

	// 更新优先级
	const handleUpdatePriority = (priority: number) => {
		onUpdate({ priority })
	}

	return (
		<div
			className={cn(
				"bg-vscode-sideBar-background border border-vscode-widget-border rounded-lg p-3",
				"hover:border-vscode-focusBorder transition-colors",
				!member.isActive && "opacity-60",
			)}>
			<div className="flex items-center gap-3">
				{/* 拖拽手柄 */}
				<div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-vscode-descriptionForeground">
					<GripVertical className="w-4 h-4" />
				</div>

				{/* 成员信息 */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						{/* 显示名称 */}
						{editingName ? (
							<div className="flex items-center gap-2 flex-1">
								<input
									type="text"
									value={tempDisplayName}
									onChange={(e) => setTempDisplayName(e.target.value)}
									onBlur={handleSaveDisplayName}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSaveDisplayName()
										} else if (e.key === "Escape") {
											handleCancelEditName()
										}
									}}
									className="flex-1 px-2 py-1 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
									autoFocus
								/>
							</div>
						) : (
							<h4
								className="font-medium text-vscode-foreground cursor-pointer hover:text-vscode-focusBorder transition-colors"
								onClick={() => {
									setTempDisplayName(member.displayName || mode?.name || "")
									setEditingName(true)
								}}>
								{member.displayName || mode?.name || getModeDisplayName(member.modeSlug)}
							</h4>
						)}

						{/* 成员类型标签 */}
						<span
							className={cn(
								"px-2 py-0.5 text-xs rounded",
								isBaseMode(member.modeSlug)
									? "bg-vscode-button-background text-vscode-button-foreground"
									: "bg-vscode-badge-background text-vscode-badge-foreground",
							)}>
							{isBaseMode(member.modeSlug) ? "基础" : "专业"}
						</span>

						{/* 优先级 */}
						<span className="text-xs text-vscode-descriptionForeground">#{member.priority + 1}</span>
					</div>

					{/* 模式描述 */}
					<p className="text-sm text-vscode-descriptionForeground line-clamp-1">
						{mode?.description || mode?.roleDefinition || `模式: ${member.modeSlug}`}
					</p>

					{/* 权限信息 */}
					{member.permissions && member.permissions.length > 0 && (
						<div className="mt-2">
							<div className="flex flex-wrap gap-1">
								{member.permissions.map((permission, idx) => (
									<span
										key={idx}
										className="px-1.5 py-0.5 text-xs bg-vscode-input-background text-vscode-input-foreground rounded">
										{permission}
									</span>
								))}
							</div>
						</div>
					)}
				</div>

				{/* 操作按钮 */}
				<div className="flex items-center gap-1">
					{/* 激活/停用 */}
					<StandardTooltip content={member.isActive ? "停用成员" : "激活成员"}>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleToggleActive}
							className={cn(
								"p-1",
								member.isActive ? "text-vscode-foreground" : "text-vscode-descriptionForeground",
							)}>
							{member.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
						</Button>
					</StandardTooltip>

					{/* 设置 */}
					<StandardTooltip content="成员设置">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowSettings(!showSettings)}
							className="p-1">
							<Settings className="w-4 h-4" />
						</Button>
					</StandardTooltip>

					{/* 删除 */}
					<StandardTooltip content="移除成员">
						<Button
							variant="ghost"
							size="sm"
							onClick={onRemove}
							className="p-1 text-vscode-errorForeground hover:text-vscode-errorForeground">
							<Trash2 className="w-4 h-4" />
						</Button>
					</StandardTooltip>
				</div>
			</div>

			{/* 展开的设置面板 */}
			{showSettings && (
				<div className="mt-3 pt-3 border-t border-vscode-widget-border space-y-3">
					{/* 优先级设置 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">优先级</label>
						<input
							type="number"
							min="0"
							max="99"
							value={member.priority}
							onChange={(e) => handleUpdatePriority(parseInt(e.target.value) || 0)}
							className="w-20 px-2 py-1 text-sm bg-vscode-input-background border border-vscode-input-border rounded focus:border-vscode-focusBorder focus:outline-none text-vscode-input-foreground"
						/>
						<p className="text-xs text-vscode-descriptionForeground mt-1">数字越小优先级越高</p>
					</div>

					{/* 权限设置 */}
					<div>
						<label className="block text-sm font-medium text-vscode-foreground mb-1">权限标签</label>
						<div className="flex flex-wrap gap-2">
							{["read", "write", "execute", "admin"].map((permission) => (
								<label key={permission} className="flex items-center gap-1 text-sm">
									<input
										type="checkbox"
										checked={member.permissions?.includes(permission) || false}
										onChange={(e) => {
											const currentPermissions = member.permissions || []
											const newPermissions = e.target.checked
												? [...currentPermissions, permission]
												: currentPermissions.filter((p) => p !== permission)
											onUpdate({ permissions: newPermissions })
										}}
										className="rounded border-vscode-input-border"
									/>
									<span className="text-vscode-foreground">{permission}</span>
								</label>
							))}
						</div>
					</div>

					{/* 模式信息 */}
					{mode && (
						<div>
							<label className="block text-sm font-medium text-vscode-foreground mb-1">模式信息</label>
							<div className="text-xs text-vscode-descriptionForeground space-y-1">
								<div>
									<strong>标识:</strong> {mode.slug}
								</div>
								{mode.whenToUse && (
									<div>
										<strong>适用场景:</strong> {mode.whenToUse}
									</div>
								)}
								{mode.groups && (
									<div>
										<strong>工具组:</strong> {mode.groups.join(", ")}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
