# 团队状态栏和工作成果清单

## 概述

本模块提供了团队状态栏和工作成果清单功能，用于显示当前团队工作状态并统计工作成果。

## 组件

### TeamStatusBar

团队状态栏组件，显示当前团队、成员和工作状态，并提供查看工作成果清单的功能。

#### Props

```typescript
interface TeamStatusBarProps {
	currentTeam?: string // 当前团队标识
	currentMode: string // 当前模式标识
	customTeams?: TeamConfig[] // 自定义团队配置
	isWorking?: boolean // 是否正在工作
	className?: string // 自定义样式类
	messages?: ClineMessage[] // 消息历史（用于生成工作成果）
}
```

#### 使用示例

```tsx
import { TeamStatusBar } from "@/components/teams/TeamStatusBar"

function App() {
	return (
		<TeamStatusBar
			currentTeam="backend-team"
			currentMode="dev07-domain-model-and-value-object-coder-agent"
			customTeams={customTeams}
			isWorking={true}
			messages={messageHistory}
		/>
	)
}
```

### WorkResultsModal

工作成果清单弹窗组件，显示详细的工作统计信息。

#### Props

```typescript
interface WorkResultsModalProps {
	isOpen: boolean // 是否打开弹窗
	onClose: () => void // 关闭弹窗回调
	workResults?: TaskWorkResults // 工作成果数据
	className?: string // 自定义样式类
}
```

## 功能特性

### 工作成果统计

- **Token消耗统计**：显示输入和输出token的使用量
- **代码行数统计**：基于消息内容估算生成的代码行数
- **工作时长统计**：基于消息时间戳计算工作时长
- **成本统计**：显示API调用的总成本
- **团队协作统计**：按团队和成员分组显示工作情况

### 数据导出

支持导出工作成果数据：

- **JSON格式**：完整的结构化数据
- **CSV格式**：表格格式，便于Excel处理

### 实时状态显示

- **工作状态指示器**：显示当前是否正在工作
- **成员信息**：显示当前活跃成员和角色
- **动画效果**：工作时显示动态指示器

## 数据结构

### TaskWorkResults

```typescript
interface TaskWorkResults {
	taskId: string // 任务ID
	taskDescription?: string // 任务描述
	taskStartTime: string // 任务开始时间
	taskEndTime?: string // 任务结束时间
	taskDuration: number // 任务总时长
	teams: TeamWorkStats[] // 参与团队统计
	totalTokens: number // 总消耗token
	totalCodeLines: number // 总代码行数
	totalCost: number // 总成本
	activeMembersCount: number // 活跃成员数量
	teamsCount: number // 参与团队数量
}
```

### MemberWorkStats

```typescript
interface MemberWorkStats {
	modeSlug: string // 成员模式标识
	memberName: string // 成员显示名称
	roleName: string // 成员角色名称
	tokensIn: number // 消耗的输入token
	tokensOut: number // 消耗的输出token
	totalTokens: number // 总消耗token
	codeLines: number // 产出代码行数
	workDuration: number // 工作时长（毫秒）
	startTime?: string // 工作开始时间
	endTime?: string // 工作结束时间
	isActive: boolean // 是否当前活跃
}
```

## 工具函数

### extractWorkResultsFromMessages

从消息历史中提取工作成果数据：

```typescript
function extractWorkResultsFromMessages(
	messages: ClineMessage[],
	currentTeam?: string,
	customTeams?: TeamConfig[],
	historyItem?: { tokensIn: number; tokensOut: number; totalCost: number },
): TaskWorkResults | null
```

### generateWorkResultsSummary

生成工作成果摘要文本：

```typescript
function generateWorkResultsSummary(workResults: TaskWorkResults): string
```

### calculateTeamEfficiency

计算团队效率指标：

```typescript
function calculateTeamEfficiency(workResults: TaskWorkResults): {
	tokensPerHour: number // 每小时token消耗
	linesPerHour: number // 每小时代码行数
	costPerLine: number // 每行代码成本
	avgMemberProductivity: number // 平均成员生产力
}
```

## 样式说明

组件使用VSCode主题变量，确保与编辑器主题保持一致：

- `--vscode-statusBar-background`：状态栏背景色
- `--vscode-statusBar-foreground`：状态栏前景色
- `--vscode-button-secondaryBackground`：次要按钮背景色
- `--vscode-editorWidget-background`：编辑器小部件背景色

## 注意事项

1. **数据估算**：由于ClineMessage本身不包含token信息，工具函数会基于消息长度和历史数据进行估算
2. **性能考虑**：大量消息历史可能影响计算性能，建议适当限制消息数量
3. **模式识别**：目前模式识别基于默认值，实际使用时需要根据消息结构调整
4. **时间计算**：工作时长基于消息时间戳计算，可能不完全准确

## 扩展建议

1. **更精确的模式识别**：通过消息内容或元数据识别实际使用的模式
2. **实时数据更新**：支持实时更新工作成果数据
3. **更多导出格式**：支持PDF、Excel等更多导出格式
4. **历史对比**：支持不同任务间的工作成果对比
5. **性能分析**：提供更详细的性能分析和优化建议
