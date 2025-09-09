import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"

import type { ModeConfig, TeamConfig } from "@roo-code/types"

import { getAllModesWithPrompts } from "../../../shared/modes"
import { getTeamModes, getTeamBySlug } from "../../../shared/teams"

/**
 * 生成团队特定的成员选择指导
 */
function generateTeamSpecificGuidelines(currentTeam?: string): string {
	switch (currentTeam) {
		case "backend-team":
			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**CODING TASKS - PRIORITIZE SPECIALIST MEMBERS:**
- API interface development: Use "northbound-api-controller-coder-agent" mode (PRIORITY)
- Database and persistence: Use "southbound-repository-coder-agent" mode (PRIORITY)
- Domain model development: Use "domain-model-and-value-object-coder-agent" mode (PRIORITY)
- Domain service development: Use "domain-service-coder-agent" mode (PRIORITY)
- Product project structure development: Use "product-project-coder-agent" mode (PRIORITY)
- Event publishing: Use "northbound-app-event-publisher-coder-agent" mode (PRIORITY)
- CQRS application services: Use "northbound-cqrs-business-service-and-application-service-coder-agent" mode (PRIORITY)
- Data model development: Use "southbound-data-model-coder-agent" mode (PRIORITY)
- Resource gateway development: Use "southbound-resource-gateway-coder-agent" mode (PRIORITY)

**BASIC TASKS - USE ONLY WHEN NO SPECIALIST AVAILABLE:**
- Architecture and design: Use "architect" mode
- Generic coding: Use "code" mode (ONLY when no specialist member fits)
- Debugging and troubleshooting: Use "debug" mode
- Questions and consultation: Use "ask" mode

**CRITICAL RULE: For any coding task, you MUST first check if a specialist member is available. Only use the generic "code" mode as a last resort when no specialist member matches the task requirements.**

Always analyze the task deeply and choose the most specialized team member for optimal professional results.`

		case "frontend-team":
			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**CODING TASKS - PRIORITIZE SPECIALIST MEMBERS:**
- Project structure setup: Use "frontend-project-structure-coder-agent" mode (PRIORITY)
- Vue component development: Use "vue-component-coder-agent" mode (PRIORITY)
- Composable functions: Use "vue-composable-coder-agent" mode (PRIORITY)
- API service layer: Use "api-service-coder-agent" mode (PRIORITY)
- Mock data services: Use "mockjs-service-coder-agent" mode (PRIORITY)
- State management: Use "pinia-store-coder-agent" mode (PRIORITY)
- Routing configuration: Use "vue-router-coder-agent" mode (PRIORITY)
- Testing implementation: Use "frontend-testing-coder-agent" mode (PRIORITY)
- Build configuration: Use "vite-build-coder-agent" mode (PRIORITY)
- UI design system: Use "ui-design-system-coder-agent" mode (PRIORITY)
- Internationalization: Use "vue-i18n-coder-agent" mode (PRIORITY)

**BASIC TASKS - USE ONLY WHEN NO SPECIALIST AVAILABLE:**
- Architecture and design: Use "architect" mode
- Generic coding: Use "code" mode (ONLY when no specialist member fits)
- Debugging and troubleshooting: Use "debug" mode
- Questions and consultation: Use "ask" mode

**CRITICAL RULE: For any coding task, you MUST first check if a specialist member is available. Only use the generic "code" mode as a last resort when no specialist member matches the task requirements.**

Always analyze the task deeply and choose the most specialized team member for optimal professional results.`

		case "fullstack-team":
			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**BACKEND CODING TASKS - PRIORITIZE BACKEND SPECIALISTS:**
- API interface development: Use "northbound-api-controller-coder-agent" mode (PRIORITY)
- Database and persistence: Use "southbound-repository-coder-agent" mode (PRIORITY)
- Domain model development: Use "domain-model-and-value-object-coder-agent" mode (PRIORITY)
- Domain service development: Use "domain-service-coder-agent" mode (PRIORITY)
- Product project structure development: Use "product-project-coder-agent" mode (PRIORITY)

**FRONTEND CODING TASKS - PRIORITIZE FRONTEND SPECIALISTS:**
- Vue component development: Use "vue-component-coder-agent" mode (PRIORITY)
- API service layer: Use "api-service-coder-agent" mode (PRIORITY)
- State management: Use "pinia-store-coder-agent" mode (PRIORITY)
- Routing configuration: Use "vue-router-coder-agent" mode (PRIORITY)
- UI design system: Use "ui-design-system-coder-agent" mode (PRIORITY)

**BASIC TASKS - USE ONLY WHEN NO SPECIALIST AVAILABLE:**
- Architecture and design: Use "architect" mode
- Generic coding: Use "code" mode (ONLY when no specialist member fits)
- Debugging and troubleshooting: Use "debug" mode
- Questions and consultation: Use "ask" mode

**CRITICAL RULE: For any coding task, you MUST first check if a specialist member is available. Only use the generic "code" mode as a last resort when no specialist member matches the task requirements.**

Always analyze the task deeply and choose the most specialized team member for optimal professional results.`

		default:
			return `TEAM MEMBER SELECTION GUIDELINES (SPECIALIST MEMBERS FIRST):

**BASIC TASKS:**
- Architecture and design: Use "architect" mode
- Generic coding: Use "code" mode
- Debugging and troubleshooting: Use "debug" mode
- Questions and consultation: Use "ask" mode

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
