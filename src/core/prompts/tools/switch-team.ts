/**
 * 获取团队切换工具的描述
 *
 * @returns 团队切换工具的描述字符串
 */
export function getSwitchTeamDescription(): string {
	return `## switch_team

切换到不同的开发团队。每个团队都有特定的专业领域和成员配置，适合不同类型的开发任务。

### 使用场景
- 当前任务需要不同团队的专业知识时
- 项目进入新的开发阶段需要不同的团队配置时
- 需要访问特定团队成员的专业技能时

### 参数
- **team_slug** (必需): 目标团队的标识符
  - 可用团队：backend-team, frontend-team, fullstack-team, mobile-team, devops-team, data-team, ai-team
- **reason** (可选): 切换团队的原因说明

### 示例
\`\`\`xml
<switch_team>
<team_slug>frontend-team</team_slug>
<reason>需要前端团队的UI/UX专业知识来优化用户界面</reason>
</switch_team>
\`\`\`

### 注意事项
- 团队切换会影响可用的团队成员（模式）
- 切换后可以使用 switch_mode 工具选择该团队的具体成员
- 建议在切换团队时提供清晰的原因说明
- 团队切换是为了获得最佳的专业化协作效果`
}
