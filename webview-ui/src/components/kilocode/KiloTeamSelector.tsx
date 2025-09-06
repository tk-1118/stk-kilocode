import React from "react"
import { TeamConfig } from "@roo-code/types"
import { SelectDropdown, DropdownOptionType } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { cn } from "@/lib/utils"
import { getAllTeams, defaultTeamSlug } from "@roo/teams"

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
	const allTeams = React.useMemo(() => getAllTeams(customTeams), [customTeams])

	const handleChange = React.useCallback(
		(selectedValue: string) => {
			if (selectedValue === "teamsButtonClicked") {
				// TODO: 添加 openTeamsView 消息类型到 WebviewMessage
				console.log("Open teams view requested")
				return
			}

			const newTeam = selectedValue as Team
			onChange(newTeam)
			// TODO: 添加 team 消息类型到 WebviewMessage
			console.log("Team changed to:", selectedValue)
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
