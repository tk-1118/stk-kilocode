import React from "react"
import { TeamConfig } from "@roo-code/types"
import { SelectDropdown, DropdownOptionType } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { cn } from "@/lib/utils"
import { defaultTeamSlug } from "@roo/teams"
import { DEFAULT_TEAMS } from "@roo-code/types"
import { vscode } from "@/utils/vscode"

export type Team = string

interface KiloTeamSelectorProps {
	value: Team
	onChange: (value: Team) => void
	teamShortcutText: string
	customTeams?: TeamConfig[]
	disabled?: boolean
	title?: string
	triggerClassName?: string
	initiallyOpen?: boolean
}

export const KiloTeamSelector = ({
	value,
	onChange,
	teamShortcutText,
	customTeams,
	disabled = false,
	title,
	triggerClassName,
	initiallyOpen,
}: KiloTeamSelectorProps) => {
	const { t } = useAppTranslation()
	const allTeams = React.useMemo(() => {
		// 直接合并内置团队和自定义团队，避免数据污染
		const safeCustomTeams = customTeams || []
		const customTeamSlugs = new Set(safeCustomTeams.map((team) => team.slug))
		const uniqueBuiltinTeams = DEFAULT_TEAMS.filter((team) => !customTeamSlugs.has(team.slug))
		return [...uniqueBuiltinTeams, ...safeCustomTeams]
	}, [customTeams])

	const handleChange = React.useCallback(
		(selectedValue: string) => {
			if (selectedValue === "teamsButtonClicked") {
				// 打开团队管理视图
				vscode.postMessage({
					type: "openTeamsView",
				})
				return
			}

			const newTeam = selectedValue as Team
			onChange(newTeam)
			// 发送团队切换消息
			vscode.postMessage({
				type: "setCurrentTeam",
				currentTeam: selectedValue,
			})
		},
		[onChange],
	)

	// 获取当前选中的团队
	const selectedTeam = allTeams.find((team) => team.slug === value)

	return (
		<SelectDropdown
			value={selectedTeam?.slug ?? defaultTeamSlug}
			title={title || t("chat:selectTeam")}
			disabled={disabled}
			initiallyOpen={initiallyOpen}
			placeholder="选择团队"
			options={[
				{
					value: "shortcut",
					label: teamShortcutText,
					disabled: true,
					type: DropdownOptionType.SHORTCUT,
				},
				...allTeams.map((team) => ({
					value: team.slug,
					label: team.name,
					codicon: team.iconName,
					description: team.description,
					type: DropdownOptionType.ITEM,
					// 添加团队颜色作为样式
					style: team.color ? { borderLeft: `3px solid ${team.color}` } : undefined,
				})),
				{
					value: "sep-1",
					label: t("chat:separator"),
					type: DropdownOptionType.SEPARATOR,
				},
				{
					value: "teamsButtonClicked",
					label: t("chat:manageTeams"),
					type: DropdownOptionType.ACTION,
				},
			]}
			onChange={handleChange}
			shortcutText={teamShortcutText}
			triggerClassName={cn(
				"min-w-[80px] max-w-[120px] text-xs bg-[var(--background)] border-[var(--vscode-input-border)] hover:bg-[var(--color-vscode-list-hoverBackground)]",
				triggerClassName,
			)}
		/>
	)
}

export default KiloTeamSelector
