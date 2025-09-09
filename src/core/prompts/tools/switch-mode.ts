export function getSwitchModeDescription(): string {
	return `## switch_mode
Description: 切换到不同的团队成员（模式）。作为智能体，您必须主动分析任务并切换到最合适的专业团队成员。这不是可选的 - 每个任务开始时都应该评估是否需要切换到更专业的团队成员。

**核心原则：智能体主动决策，专业成员优先**
- 您必须在任务开始时主动分析任务类型和专业需求
- 基于分析结果主动选择最合适的团队成员
- 优先选择专业成员，避免使用通用模式
- 不要等待用户指定，而是展现您的专业判断能力

Parameters:
- mode_slug: (必需) 要切换到的团队成员的标识符（必须是当前团队的成员）
- reason: (可选) 切换到此团队成员的原因

Usage:
<switch_mode>
<mode_slug>团队成员标识符</mode_slug>
<reason>切换原因</reason>
</switch_mode>

**专业成员优先示例：**

API开发任务：
<switch_mode>
<mode_slug>dev02-northbound-api-controller-coder-agent</mode_slug>
<reason>需要API接口开发专家来设计和实现RESTful API</reason>
</switch_mode>

数据库任务：
<switch_mode>
<mode_slug>dev12-southbound-respository-coder-agent</mode_slug>
<reason>需要数据持久化专家来处理数据库操作和Repository模式</reason>
</switch_mode>

领域建模任务：
<switch_mode>
<mode_slug>dev07-domain-model-and-value-object-coder-agent</mode_slug>
<reason>需要领域建模专家来设计业务实体和值对象</reason>
</switch_mode>

**避免的示例（除非确实没有合适的专业成员）：**
<switch_mode>
<mode_slug>dev99-coder</mode_slug>
<reason>通用编码任务</reason>
</switch_mode>

**关键原则：**
1. 优先分析任务的专业领域
2. 选择最匹配的专业成员
3. 只有在没有合适专业成员时才使用通用模式
4. 提供清晰的切换理由

Important: 只有在您的团队成员列表中的成员才可以切换。尝试切换到团队外的成员将导致错误。`
}
