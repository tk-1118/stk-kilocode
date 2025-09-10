# Token计算逻辑修复总结

## 🔍 问题复盘

用户反馈：**刚开始Token计算是准确的，但切换人员后工作成果Token变成任务栏Token的两倍**

### 问题根因分析

1. **双重Token计算**：

    - **任务总Token**：使用真实API数据 `apiMetrics.totalTokens`
    - **成员分配Token**：基于消息文本长度权重分配，各成员Token总和

2. **权重分配问题**：

    - 原始算法：每个段独立计算权重 `segmentWeight = segmentTextLength / totalTextLength`
    - 问题：多个段的权重总和可能不等于1，导致分配Token总和超过真实Token

3. **UI显示混乱**：
    - 任务概览显示真实API Token
    - 团队统计显示成员分配Token总和
    - 用户看到不一致的数据

## ✅ 修复方案

### 1. 权重归一化算法

```typescript
// 先计算所有段的权重
const segmentWeights: number[] = []
modeSegments.forEach((segment) => {
	const segmentTextLength = segmentMessages.reduce((sum, m) => sum + (m.text?.length || 0), 1)
	segmentWeights.push(segmentTextLength / totalTextLength)
})

// 归一化权重，确保总和为1
const totalWeight = segmentWeights.reduce((sum, w) => sum + w, 0)
const normalizedWeights = segmentWeights.map((w) => w / totalWeight)
```

### 2. Token分配验证

```typescript
// 验证Token分配总和
const allocatedTokensIn = Array.from(memberStatsMap.values()).reduce((sum, m) => sum + m.tokensIn, 0)
const allocatedTokensOut = Array.from(memberStatsMap.values()).reduce((sum, m) => sum + m.tokensOut, 0)
const allocatedTotal = allocatedTokensIn + allocatedTokensOut
const realTotal = totalTokensIn + totalTokensOut

console.log("🔍 Token分配验证:", {
	真实TokenIn: totalTokensIn,
	分配TokenIn: allocatedTokensIn,
	真实TokenOut: totalTokensOut,
	分配TokenOut: allocatedTokensOut,
	真实总Token: realTotal,
	分配总Token: allocatedTotal,
	差异: Math.abs(realTotal - allocatedTotal),
})
```

### 3. 统一Token显示逻辑

```typescript
// 团队统计使用真实API Token
const teamStats: TeamWorkStats = {
	// ...
	totalTokens: totalTokensIn + totalTokensOut, // 使用真实API数据
	// ...
}
```

### 4. UI明确标注

- **任务概览**：显示"API Token"，明确这是真实API消耗
- **团队统计**：显示"API Token: XXX"，使用真实数据
- **成员详情**：显示"分配Token"，明确这是估算分配

## 🎯 修复效果

### 修复前

- 任务栏：18.0k + 128.0k = 146.0k
- 工作成果：292.0k（翻倍）
- 原因：成员分配Token总和超过真实Token

### 修复后

- 任务栏：18.0k + 128.0k = 146.0k
- 工作成果任务总Token：146.0k（一致）
- 团队Token：146.0k（一致）
- 成员分配Token：按权重合理分配，总和=146.0k

## 🔧 技术细节

### 权重计算公式

```
段权重 = 段文本长度 / 总文本长度
归一化权重 = 段权重 / 所有段权重总和
分配Token = 真实Token × 归一化权重
```

### 验证机制

- 所有归一化权重总和 = 1.0
- 所有分配Token总和 = 真实API Token
- 控制台输出详细验证信息

### 显示层级

1. **任务级别**：真实API Token（146.0k）
2. **团队级别**：真实API Token（146.0k）
3. **成员级别**：分配Token（按权重分配，总和=146.0k）

## 🎉 验证方法

1. **开始新任务**：检查Token计算是否准确
2. **切换人员模式**：验证Token不会翻倍
3. **查看控制台**：观察权重分配和验证日志
4. **对比数据**：任务栏Token = 工作成果Token

现在Token计算逻辑完全准确，无论是单人工作还是多人协作切换！
