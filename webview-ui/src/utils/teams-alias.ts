// 团队相关函数的别名，用于在webview中使用
// 由于webview环境的限制，我们需要重新导出这些函数

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
