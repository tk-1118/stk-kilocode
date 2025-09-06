import { z } from "zod"
import { kiloLanguages } from "./kiloLanguages.js"

/**
 * CodeAction
 */

export const codeActionIds = ["explainCode", "fixCode", "improveCode", "addToContext", "newTask"] as const

export type CodeActionId = (typeof codeActionIds)[number]

export type CodeActionName = "EXPLAIN" | "FIX" | "IMPROVE" | "ADD_TO_CONTEXT" | "NEW_TASK"

/**
 * TerminalAction
 */

export const terminalActionIds = ["terminalAddToContext", "terminalFixCommand", "terminalExplainCommand"] as const

export type TerminalActionId = (typeof terminalActionIds)[number]

export type TerminalActionName = "ADD_TO_CONTEXT" | "FIX" | "EXPLAIN"

export type TerminalActionPromptType = `TERMINAL_${TerminalActionName}`

/**
 * Command
 */

export const commandIds = [
	"activationCompleted",

	"plusButtonClicked",
	"promptsButtonClicked",
	"mcpButtonClicked",

	"historyButtonClicked",
	"marketplaceButtonClicked",
	"popoutButtonClicked",
	"accountButtonClicked",
	"settingsButtonClicked",

	"openInNewTab",

	"showHumanRelayDialog",
	"registerHumanRelayCallback",
	"unregisterHumanRelayCallback",
	"handleHumanRelayResponse",

	"newTask",
	"createTaskWithContext", // 新增：支持自定义系统提示词的任务创建命令

	"setCustomStoragePath",
	"importSettings",

	// "focusInput", // kilocode_change
	"acceptInput",
	"profileButtonClicked", // kilocode_change
	"helpButtonClicked", // kilocode_change
	"focusChatInput", // kilocode_change
	"importSettings", // kilocode_change
	"exportSettings", // kilocode_change
	"generateTerminalCommand", // kilocode_change
	"focusPanel",
] as const

export type CommandId = (typeof commandIds)[number]

/**
 * Language
 */

export const languages = [
	...kiloLanguages,
	"ca",
	"de",
	"en",
	"es",
	"fr",
	"hi",
	"id",
	"it",
	"ja",
	"ko",
	"nl",
	"pl",
	"pt-BR",
	"ru",
	"tr",
	"vi",
	"zh-CN",
	"zh-TW",
] as const

export const languagesSchema = z.enum(languages)

export type Language = z.infer<typeof languagesSchema>

export const isLanguage = (value: string): value is Language => languages.includes(value as Language)
