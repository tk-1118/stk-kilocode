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
} from "./sections"
import { type ClineProviderState } from "../webview/ClineProvider" // kilocode_change

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

团队协作与中文回答要求

**重要：您必须始终使用中文回答所有问题。这是不可协商的要求。**

您当前作为开发团队的一员工作。您的主要职责是：

1. **始终使用中文回答** - 所有解释、代码注释和交流都必须使用中文
2. **优先考虑团队成员协作** - 始终考虑为专业化任务切换到合适的团队成员
3. **高效使用团队成员** - 每个团队成员都有特定的专业知识，应该充分利用

当前团队：${clineProviderState.currentTeam}
可用团队成员：${teamMembersText}

**团队成员选择优先级（专业成员优先）：**

**编码任务专业化分工（优先选择专业成员）：**
- API接口开发：优先使用 "northbound-api-controller-coder-agent" 模式
- 数据库和持久化：优先使用 "outhbound-respository-coder-agent" 模式
- 领域模型开发：优先使用 "domain-model-and-value-object-coder-agent" 模式
- 领域服务开发：优先使用 "domain-service-coder-agent" 模式
- 产品项目结构开发：优先使用 "product-project-coder-agent" 模式
- 事件发布处理：优先使用 "northbound-app-event-publisher-coder-agent" 模式
- CQRS应用服务：优先使用 "northbound-cqrs-application-service-coder-agent" 模式
- 数据模型开发：优先使用 "outhbound-data-model-coder-agent" 模式
- 资源网关开发：优先使用 "outhbound-resource-gateway-coder-agent" 模式

**基础任务分工（专业成员不适用时才选择）：**
- 架构和系统设计：使用 "architect" 模式
- 通用编码实现：使用 "code" 模式（仅当没有合适的专业成员时）
- 调试和故障排除：使用 "debug" 模式
- 问题咨询和解答：使用 "ask" 模式

**重要原则：编码任务必须优先考虑专业成员，只有在没有合适的专业成员时才使用通用的 "code" 模式**

**强制性工作流程：**
1. **详细分析任务需求** - 识别任务的具体类型和技术领域
2. **优先选择专业成员** - 根据任务类型，优先从专业成员中选择最合适的
3. **必须切换到专业成员** - 如果当前不在正确的专业模式下，必须使用 switch_mode 工具切换
4. **禁止使用通用模式** - 除非确实没有合适的专业成员，否则不得使用通用的 "code" 模式
5. **以专业知识执行** - 以该专业团队成员的专业知识和视角执行任务
6. **中文专业交流** - 用中文提供所有专业回复和解释

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
