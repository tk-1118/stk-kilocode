import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"

import type { ModeConfig, TeamConfig } from "@roo-code/types"

import { getAllModesWithPrompts } from "../../../shared/modes"
import { getTeamModes, getTeamBySlug } from "../../../shared/teams"

export async function getModesSection(
	context: vscode.ExtensionContext,
	currentTeam?: string,
	customTeams?: TeamConfig[],
): Promise<string> {
	const settingsDir = path.join(context.globalStorageUri.fsPath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })

	// 如果指定了当前团队，优先显示团队成员信息
	if (currentTeam) {
		const teamConfig = getTeamBySlug(currentTeam, customTeams)
		if (teamConfig) {
			const teamModes = getTeamModes(currentTeam, customTeams)

			let modesContent = `====

TEAM MEMBERS

You are currently working as part of the "${teamConfig.name}" team. Your available team members are:
${teamModes
	.map((mode: ModeConfig) => {
		let description: string
		if (mode.whenToUse && mode.whenToUse.trim() !== "") {
			description = mode.whenToUse.replace(/\n/g, "\n    ")
		} else {
			description = mode.roleDefinition.split(".")[0]
		}
		return `  * "${mode.name}" (${mode.slug}) - ${description}`
	})
	.join("\n")}

Team Description: ${teamConfig.description || "A professional development team"}

You can switch to any of these team members using the switch_mode tool when their expertise is needed for the current task.

TEAM MEMBER SELECTION GUIDELINES:
- For architecture and design tasks: Use "architect" mode
- For coding and implementation: Use "code" mode
- For debugging and troubleshooting: Use "debug" mode
- For questions and consultation: Use "ask" mode
- For DDD domain modeling: Use "domain-model-and-value-object-coder-agent" mode
- For product and project management: Use "product-project-coder-agent" mode
- For API development: Use "northbound-api-controller-coder-agent" mode
- For data persistence: Use "outhbound-respository-coder-agent" mode

Always consider the nature of the current task and choose the most appropriate team member for optimal results.
`

			modesContent += `
If the user asks you to create or edit a new mode for this project, you should read the instructions by using the fetch_instructions tool, like this:
<fetch_instructions>
<task>create_mode</task>
</fetch_instructions>
`
			return modesContent
		}
	}

	// 回退到原有逻辑：显示所有可用模式
	const allModes = await getAllModesWithPrompts(context)

	let modesContent = `====

MODES

- These are the currently available modes:
${allModes
	.map((mode: ModeConfig) => {
		let description: string
		if (mode.whenToUse && mode.whenToUse.trim() !== "") {
			// Use whenToUse as the primary description, indenting subsequent lines for readability
			description = mode.whenToUse.replace(/\n/g, "\n    ")
		} else {
			// Fallback to the first sentence of roleDefinition if whenToUse is not available
			description = mode.roleDefinition.split(".")[0]
		}
		return `  * "${mode.name}" mode (${mode.slug}) - ${description}`
	})
	.join("\n")}`

	modesContent += `
If the user asks you to create or edit a new mode for this project, you should read the instructions by using the fetch_instructions tool, like this:
<fetch_instructions>
<task>create_mode</task>
</fetch_instructions>
`

	return modesContent
}
