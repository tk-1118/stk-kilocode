import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"

import type { ModeConfig, TeamConfig } from "@roo-code/types"

import { getAllModesWithPrompts } from "../../../shared/modes"
import { getTeamModes, getTeamBySlug } from "../../../shared/teams"
import {
	BACKEND_SPECIALTY_MODE_LIST,
	FRONTEND_SPECIALTY_MODE_LIST,
	BASE_MODES,
	getModeDisplayName,
} from "../../../shared/constants/unified-modes"

/**
 * 生成团队特定的成员选择指导
 * 🎯 统一数据源：动态生成指导原则，避免硬编码
 */
function generateTeamSpecificGuidelines(currentTeam?: string): string {
	// 基础任务模式（所有团队通用）
	const basicTasksGuidelines = `**BASIC TASKS - USE ONLY WHEN NO SPECIALIST AVAILABLE:**
- Architecture and design: Use "${BASE_MODES.SA01_SYSTEM_ARCHITECT}" mode
- Generic coding: Use "${BASE_MODES.DEV99_CODER}" mode (ONLY when no specialist member fits)
- Project management: Use "${BASE_MODES.PM01_PROJECT_MANAGER}" mode
- Unit testing: Use "qa01-unit-test" mode
- Debugging: Use "qa01-debug" mode
- Quality control: Use "${BASE_MODES.QE01_QUALITY_CONTROL}" mode
- Security inspection: Use "se01-security-control" mode`

	const criticalRule = `**CRITICAL RULE: For any coding task, you MUST first check if a specialist member is available. Only use the generic "dev99-coder" mode as a last resort when no specialist member matches the task requirements.**

Always analyze the task deeply and choose the most specialized team member for optimal professional results.`

	switch (currentTeam) {
		case "backend-team": {
			// 🎯 动态生成后端专业模式指导
			const backendSpecialistGuidelines = BACKEND_SPECIALTY_MODE_LIST.map(
				(mode) => `- ${getModeDisplayName(mode)}: Use "${mode}" mode (PRIORITY)`,
			).join("\n")

			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**CODING TASKS - PRIORITIZE SPECIALIST MEMBERS:**
${backendSpecialistGuidelines}

${basicTasksGuidelines}

${criticalRule}`
		}

		case "frontend-team": {
			// 🎯 动态生成前端专业模式指导
			const frontendSpecialistGuidelines = FRONTEND_SPECIALTY_MODE_LIST.map(
				(mode) => `- ${getModeDisplayName(mode)}: Use "${mode}" mode (PRIORITY)`,
			).join("\n")

			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**CODING TASKS - PRIORITIZE SPECIALIST MEMBERS:**
${frontendSpecialistGuidelines}

${basicTasksGuidelines}

${criticalRule}`
		}

		case "fullstack-team": {
			// 🎯 动态生成全栈团队指导（后端+前端）
			const backendGuidelines = BACKEND_SPECIALTY_MODE_LIST.map(
				(mode) => `- ${getModeDisplayName(mode)}: Use "${mode}" mode (PRIORITY)`,
			).join("\n")

			const frontendGuidelines = FRONTEND_SPECIALTY_MODE_LIST.map(
				(mode) => `- ${getModeDisplayName(mode)}: Use "${mode}" mode (PRIORITY)`,
			).join("\n")

			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**BACKEND CODING TASKS - PRIORITIZE BACKEND SPECIALISTS:**
${backendGuidelines}

**FRONTEND CODING TASKS - PRIORITIZE FRONTEND SPECIALISTS:**
${frontendGuidelines}

${basicTasksGuidelines}

${criticalRule}`
		}

		default:
			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

${basicTasksGuidelines}

Always analyze the task deeply and choose the most appropriate team member for optimal results.`
	}
}

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

${generateTeamSpecificGuidelines(currentTeam)}
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
