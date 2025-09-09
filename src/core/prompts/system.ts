import * as vscode from "vscode"
import * as os from "os"

import type {
	ModeConfig,
	PromptComponent,
	CustomModePrompts,
	TodoItem,
	Experiments, // kilocode_change
} from "@roo-code/types"

import type { SystemPromptSettings } from "./types"

import { Mode, modes, defaultModeSlug, getModeBySlug, getGroupName, getModeSelection } from "../../shared/modes"
import { DiffStrategy } from "../../shared/tools"
import { formatLanguage } from "../../shared/language"
import { isEmpty } from "../../utils/object"

import { McpHub } from "../../services/mcp/McpHub"
import { CodeIndexManager } from "../../services/code-index/manager"

import { PromptVariables, loadSystemPromptFile } from "./sections/custom-system-prompt"

import { getToolDescriptionsForMode } from "./tools"
import {
	getRulesSection,
	getSystemInfoSection,
	getObjectiveSection,
	getSharedToolUseSection,
	getMcpServersSection,
	getToolUseGuidelinesSection,
	getCapabilitiesSection,
	getModesSection,
	addCustomInstructions,
	markdownFormattingSection,
	getDddGuidelinesSection,
	getFrontendGuidelinesSection,
} from "./sections"
import { type ClineProviderState } from "../webview/ClineProvider" // kilocode_change

/**
 * 生成团队特定的指导原则
 *
 * @param clineProviderState - ClineProvider状态信息
 * @returns 团队特定指导原则字符串
 */
function generateTeamSpecificGuidelines(clineProviderState?: ClineProviderState): string {
	if (!clineProviderState?.currentTeam) {
		return ""
	}

	// 根据当前团队决定显示哪种指导原则
	switch (clineProviderState.currentTeam) {
		case "backend-team":
			return getDddGuidelinesSection(clineProviderState)
		case "frontend-team":
			return getFrontendGuidelinesSection(clineProviderState)
		case "fullstack-team": {
			// 全栈团队显示两种指导原则
			const dddSection = getDddGuidelinesSection(clineProviderState)
			const frontendSection = getFrontendGuidelinesSection(clineProviderState)
			return dddSection + "\n\n" + frontendSection
		}
		default:
			return ""
	}
}

/**
 * 生成团队成员推荐信息
 *
 * @param clineProviderState - ClineProvider状态信息
 * @returns 团队推荐信息字符串
 */
function generateTeamRecommendationSection(clineProviderState?: ClineProviderState): string {
	if (!clineProviderState?.currentTeam) {
		return ""
	}

	// 获取团队成员信息
	const { getTeamModes } = require("../../shared/teams")
	const teamModes = getTeamModes(clineProviderState.currentTeam, clineProviderState.customTeams)
	const teamMembers = teamModes.map((mode: any) => mode.slug)
	const teamMembersText = teamMembers.length > 0 ? teamMembers.join(", ") : "加载中..."

	return `====

团队协作核心要求

**重要：您必须始终使用中文回答所有问题。这是不可协商的要求。**

当前团队：${clineProviderState.currentTeam}
可用团队成员：${teamMembersText}

**特别说明：Architect vs Orchestrator 分工**

**Architect（智能任务协调员）：**
- 处理单个任务的分析和团队成员切换
- 快速识别任务类型并立即切换到合适的专业成员
- 适用于：单一技术领域的任务，需要专业成员直接处理的工作
- 工作模式：分析 → 切换 → 执行

**Orchestrator（战略项目协调器）：**
- 处理复杂的多阶段项目管理和子任务协调
- 将大型项目分解为多个子任务，每个子任务委托给最合适的专业成员
- 适用于：跨多个技术领域的大型项目，需要阶段性协调的复杂工作流
- 工作模式：规划 → 分解 → 委托 → 协调 → 整合

**选择原则：**
- 单个任务 → 使用 Architect
- 多阶段项目 → 使用 Orchestrator

**重要原则：编码任务必须优先考虑专业成员，只有在没有合适的专业成员时才使用通用的 "code" 模式**

**强制性智能体工作流程（每个任务开始时必须执行）：**

**第一步：任务分析阶段**
1. **深度理解任务** - 仔细分析用户的任务描述，识别关键技术领域和专业要求
2. **技术领域判断** - 确定任务属于哪个技术领域（API开发、数据库、领域建模、架构设计等）
3. **专业需求评估** - 评估任务需要什么样的专业知识和技能

**第二步：团队成员决策阶段**
4. **专业成员匹配** - 基于分析结果，从当前团队的专业成员中选择最合适的
5. **自主切换决策** - 如果当前模式不是最合适的，必须主动使用 switch_mode 工具切换
6. **切换原因说明** - 清楚说明为什么选择特定的团队成员，展示专业判断

**第三步：任务执行阶段**
7. **专业视角执行** - 以选定团队成员的专业知识和经验执行任务
8. **专业标准保证** - 确保输出符合该领域的最佳实践和专业标准
9. **中文专业交流** - 用中文提供所有专业回复、解释和代码注释

**关键要求：**
- **智能体必须主动分析** - 不等待用户指定团队成员，而是基于任务内容主动判断
- **优先专业成员** - 编码任务绝对优先选择专业成员，避免使用通用 "code" 模式
- **必须说明理由** - 每次切换都要清楚说明选择该团队成员的专业原因
- **自主决策优先** - 智能体的专业判断优先于简单的关键词匹配推荐

**关键原则：**
- 团队协作不是可选的 - 这是获得最佳代码质量和开发效率的必要条件
- 每个任务都应该由最合适的专家处理
- 所有交流必须使用中文，包括技术解释和代码注释
- 在切换团队成员时提供清晰的上下文说明

记住：专业化分工和中文交流是确保项目成功的核心要求。

`
}

// Helper function to get prompt component, filtering out empty objects
export function getPromptComponent(
	customModePrompts: CustomModePrompts | undefined,
	mode: string,
): PromptComponent | undefined {
	const component = customModePrompts?.[mode]
	// Return undefined if component is empty
	if (isEmpty(component)) {
		return undefined
	}
	return component
}

async function generatePrompt(
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mode: Mode,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	promptComponent?: PromptComponent,
	customModeConfigs?: ModeConfig[],
	globalCustomInstructions?: string,
	diffEnabled?: boolean,
	experiments?: Record<string, boolean>,
	enableMcpServerCreation?: boolean,
	language?: string,
	rooIgnoreInstructions?: string,
	partialReadsEnabled?: boolean,
	settings?: SystemPromptSettings,
	todoList?: TodoItem[],
	modelId?: string,
	clineProviderState?: ClineProviderState, // kilocode_change
): Promise<string> {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	// If diff is disabled, don't pass the diffStrategy
	const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

	// Get the full mode config to ensure we have the role definition (used for groups, etc.)
	const modeConfig = getModeBySlug(mode, customModeConfigs) || modes.find((m) => m.slug === mode) || modes[0]
	const { roleDefinition, baseInstructions } = getModeSelection(mode, promptComponent, customModeConfigs)

	// Check if MCP functionality should be included
	const hasMcpGroup = modeConfig.groups.some((groupEntry) => getGroupName(groupEntry) === "mcp")
	const hasMcpServers = mcpHub && mcpHub.getServers().length > 0
	const shouldIncludeMcp = hasMcpGroup && hasMcpServers

	const [modesSection, mcpServersSection] = await Promise.all([
		getModesSection(context, clineProviderState?.currentTeam, clineProviderState?.customTeams),
		shouldIncludeMcp
			? getMcpServersSection(mcpHub, effectiveDiffStrategy, enableMcpServerCreation)
			: Promise.resolve(""),
	])

	const codeIndexManager = CodeIndexManager.getInstance(context, cwd)

	// 生成团队成员推荐信息
	const teamRecommendationSection = generateTeamRecommendationSection(clineProviderState)

	// 生成团队特定的指导原则信息
	const guidelinesSection = generateTeamSpecificGuidelines(clineProviderState)

	const basePrompt = `${roleDefinition}

${markdownFormattingSection()}

${getSharedToolUseSection()}

${getToolDescriptionsForMode(
	mode,
	cwd,
	supportsComputerUse,
	codeIndexManager,
	effectiveDiffStrategy,
	browserViewportSize,
	shouldIncludeMcp ? mcpHub : undefined,
	customModeConfigs,
	experiments,
	partialReadsEnabled,
	settings,
	enableMcpServerCreation,
	modelId,
	clineProviderState, // kilocode_change
)}

${getToolUseGuidelinesSection(codeIndexManager)}

${mcpServersSection}

${getCapabilitiesSection(cwd, supportsComputerUse, shouldIncludeMcp ? mcpHub : undefined, effectiveDiffStrategy, codeIndexManager, clineProviderState /* kilocode_change */)}

${modesSection}

${teamRecommendationSection}

${guidelinesSection}

${getRulesSection(cwd, supportsComputerUse, effectiveDiffStrategy, codeIndexManager, clineProviderState /* kilocode_change */)}

${getSystemInfoSection(cwd)}

${getObjectiveSection(codeIndexManager, experiments)}

${await addCustomInstructions(baseInstructions, globalCustomInstructions || "", cwd, mode, {
	language: language ?? formatLanguage(vscode.env.language),
	rooIgnoreInstructions,
	localRulesToggleState: context.workspaceState.get("localRulesToggles"), // kilocode_change
	globalRulesToggleState: context.globalState.get("globalRulesToggles"), // kilocode_change
	settings,
})}`

	return basePrompt
}

export const SYSTEM_PROMPT = async (
	context: vscode.ExtensionContext,
	cwd: string,
	supportsComputerUse: boolean,
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	inputMode: Mode = defaultModeSlug, // kilocode_change: name changed to inputMode
	customModePrompts?: CustomModePrompts,
	customModes?: ModeConfig[],
	globalCustomInstructions?: string,
	diffEnabled?: boolean,
	experiments?: Experiments, // kilocode_change: type
	enableMcpServerCreation?: boolean,
	language?: string,
	rooIgnoreInstructions?: string,
	partialReadsEnabled?: boolean,
	settings?: SystemPromptSettings,
	todoList?: TodoItem[],
	modelId?: string,
	clineProviderState?: ClineProviderState, // kilocode_change
): Promise<string> => {
	if (!context) {
		throw new Error("Extension context is required for generating system prompt")
	}

	const mode =
		getModeBySlug(inputMode, customModes)?.slug || modes.find((m) => m.slug === inputMode)?.slug || defaultModeSlug // kilocode_change: don't try to use non-existent modes

	// Try to load custom system prompt from file
	const variablesForPrompt: PromptVariables = {
		workspace: cwd,
		mode: mode,
		language: language ?? formatLanguage(vscode.env.language),
		shell: vscode.env.shell,
		operatingSystem: os.type(),
	}
	const fileCustomSystemPrompt = await loadSystemPromptFile(cwd, mode, variablesForPrompt)

	// Check if it's a custom mode
	const promptComponent = getPromptComponent(customModePrompts, mode)

	// Get full mode config from custom modes or fall back to built-in modes
	const currentMode = getModeBySlug(mode, customModes) || modes.find((m) => m.slug === mode) || modes[0]

	// If a file-based custom system prompt exists, use it
	if (fileCustomSystemPrompt) {
		const { roleDefinition, baseInstructions: baseInstructionsForFile } = getModeSelection(
			mode,
			promptComponent,
			customModes,
		)

		const customInstructions = await addCustomInstructions(
			baseInstructionsForFile,
			globalCustomInstructions || "",
			cwd,
			mode,
			{
				language: language ?? formatLanguage(vscode.env.language),
				rooIgnoreInstructions,
				settings,
			},
		)

		// For file-based prompts, don't include the tool sections
		return `${roleDefinition}

${fileCustomSystemPrompt}

${customInstructions}`
	}

	// If diff is disabled, don't pass the diffStrategy
	const effectiveDiffStrategy = diffEnabled ? diffStrategy : undefined

	return generatePrompt(
		context,
		cwd,
		supportsComputerUse,
		currentMode.slug,
		mcpHub,
		effectiveDiffStrategy,
		browserViewportSize,
		promptComponent,
		customModes,
		globalCustomInstructions,
		diffEnabled,
		experiments,
		enableMcpServerCreation,
		language,
		rooIgnoreInstructions,
		partialReadsEnabled,
		settings,
		todoList,
		modelId,
		clineProviderState, // kilocode_change
	)
}
