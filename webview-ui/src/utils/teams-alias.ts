// 团队相关函数的别名，用于在webview中使用
// 由于webview环境的限制，我们需要重新导出这些函数
//
// 注意：这里导出的 getModeDisplayName 和 getModeActivityDescription 函数
// 应该与 src/shared/constants/unified-modes.ts 中的统一映射保持一致

export {
	getAllTeams,
	getTeamBySlug,
	getTeamModesSlugs,
	isModeInTeam,
	findTeamByMode,
	getModeDisplayName,
	getModeActivityDescription,
	defaultTeamSlug,
	DEFAULT_TEAMS,
	type Team,
} from "./teams"
