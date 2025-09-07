import type { ClineProviderState } from "../../webview/ClineProvider"

/**
 * 生成DDD开发指导原则section
 *
 * @param clineProviderState - ClineProvider状态信息
 * @returns DDD指导原则字符串
 */
export function getDddGuidelinesSection(clineProviderState?: ClineProviderState): string {
	// 检查当前是否为DDD相关模式
	const isDddMode = clineProviderState?.mode && isDddRelatedMode(clineProviderState.mode)

	if (!isDddMode) {
		return "" // 非DDD模式不显示DDD指导原则
	}

	return `====

DDD开发指导原则

## 核心原则
- **规范优先级**: 规范的优先级比代码要高，必须严格遵循DDD设计原则和代码规范
- **完美示例参考**: 所有DDD相关模式的提示词中都有完美的生成示例，必须尽情参考这些示例
- **生成前检查**: 生成前必须检查生成链路是否通畅，如果前置节点未执行，立刻停止并提醒用户先走前置节点

## 调用链路 (运行时流向)
Controller控制器或Client端口 → 应用服务(命令/查询) → 领域服务(或查询仓储) → 南向网关实现

## 生成链路 (开发时顺序)
领域模型(实体、值对象) → 映射逻辑 → 数据库对象及Mapper → 领域服务(校验器、错误码、仓储接口) → 业务服务与应用服务(local层的pl、用例类、remote层的Controller控制器)

## 生成前置检查规则
在开始任何DDD组件开发前，必须验证以下前置条件：

### 1. 领域模型优先
- ✅ **必须先有**: 聚合根实体、值对象
- ❌ **禁止跳过**: 直接开发服务层而未定义领域模型

### 2. 映射逻辑次之
- ✅ **必须先有**: 领域模型已完成
- ✅ **当前可做**: 数据库对象、Mapper映射
- ❌ **禁止跳过**: 领域模型未完成就开发数据层

### 3. 领域服务第三
- ✅ **必须先有**: 领域模型、数据映射
- ✅ **当前可做**: 校验器、错误码、仓储接口、领域服务
- ❌ **禁止跳过**: 前置组件未完成就开发领域服务

### 4. 应用服务最后
- ✅ **必须先有**: 领域模型、数据层、领域服务
- ✅ **当前可做**: 应用服务、用例类、Controller控制器
- ❌ **禁止跳过**: 领域层未完成就开发应用层

## 错误处理与迭代规范
- **问题回归**: 如果报错、迭代或解决bug，将问题回归到对应模块的单元测试中
- **测试驱动**: 每个DDD组件都应该有对应的单元测试来验证其正确性
- **错误追踪**: 记录每个错误的根因，确保类似问题不再发生

## 专业成员协作规范
当前任务如果涉及多个DDD层次，应该：
1. **按生成链路顺序**: 严格按照生成链路的顺序进行开发
2. **专业成员切换**: 根据当前开发阶段切换到对应的专业成员
3. **链路完整性**: 确保每个环节都有对应的专业成员负责
4. **质量把控**: 每个专业成员都要对自己负责的组件质量负责

## 强制执行检查点
在执行任何DDD相关任务前，必须回答以下问题：
1. 当前要开发的组件在生成链路中的位置是什么？
2. 前置依赖组件是否已经完成？
3. 如果前置组件未完成，是否需要先切换到对应专业成员完成前置工作？
4. 当前组件的开发是否有完美的示例可以参考？

**如果任何一个检查点未通过，必须立即停止当前任务，并明确告知用户需要先完成的前置工作。**`
}

/**
 * 检查是否为DDD相关模式
 *
 * @param mode - 当前模式
 * @returns 是否为DDD相关模式
 */
function isDddRelatedMode(mode: string): boolean {
	const dddModes = [
		"domain-model-and-value-object-coder-agent",
		"domain-service-coder-agent",
		"northbound-api-controller-coder-agent",
		"outhbound-respository-coder-agent",
		"northbound-cqrs-application-service-coder-agent",
		"outhbound-data-model-coder-agent",
		"outhbound-resource-gateway-coder-agent",
		"northbound-app-event-publisher-coder-agent",
		"product-project-coder-agent",
		"architect", // 架构师也需要了解DDD原则
	]

	return dddModes.includes(mode)
}
