import type { ClineProviderState } from "../../webview/ClineProvider"
import { FRONTEND_SPECIALTY_MODE_LIST, BASE_MODES } from "../../../shared/constants/unified-modes"

/**
 * 生成前端开发指导原则section
 *
 * @param clineProviderState - ClineProvider状态信息
 * @returns 前端指导原则字符串
 */
export function getFrontendGuidelinesSection(clineProviderState?: ClineProviderState): string {
	// 检查当前是否为前端相关模式
	const isFrontendMode = clineProviderState?.mode && isFrontendRelatedMode(clineProviderState.mode)

	if (!isFrontendMode) {
		return "" // 非前端模式不显示前端指导原则
	}

	return `====

前端开发指导原则

## 核心原则
- **技术栈统一**: 严格使用Vue3+TypeScript+Vite技术栈，确保代码风格和架构一致性
- **组件化优先**: 所有UI都应该组件化，遵循单一职责原则，提高复用性和可维护性
- **类型安全**: 全项目TypeScript，所有组件、函数、API都必须有完整的类型定义

## 前端架构层次 (开发顺序)
项目结构 → 基础组件 → 业务组件 → 页面组件 → 路由配置 → 状态管理 → API服务 → 测试

## 开发链路检查规则
在开始任何前端组件开发前，必须验证以下前置条件：

### 1. 项目基础设施优先
- ✅ **必须先有**: Vite配置、TypeScript配置、ESLint/Prettier规范
- ✅ **当前可做**: 目录结构、基础样式、工具函数
- ❌ **禁止跳过**: 基础设施未完成就开发组件

### 2. 通用组件次之
- ✅ **必须先有**: 项目基础设施、设计系统
- ✅ **当前可做**: 通用组件、布局组件、工具组合函数
- ❌ **禁止跳过**: 通用组件未完成就开发业务组件

### 3. 业务组件第三
- ✅ **必须先有**: 通用组件、API服务定义
- ✅ **当前可做**: 业务组件、页面组件、状态管理
- ❌ **禁止跳过**: 依赖组件未完成就开发上层组件

### 4. 集成测试最后
- ✅ **必须先有**: 组件开发完成、API集成完成
- ✅ **当前可做**: 单元测试、组件测试、E2E测试
- ❌ **禁止跳过**: 功能未完成就进行集成测试

## Vue3 开发规范
- **Composition API**: 优先使用 \`<script setup>\` 语法和组合式API
- **响应式数据**: 合理使用 ref/reactive，避免不必要的响应式包装
- **组件通信**: Props down, Events up，复杂状态使用Pinia
- **生命周期**: 使用组合式API的生命周期钩子

## TypeScript 规范
- **接口定义**: 所有Props、Events、API都要有接口定义
- **类型导入**: 使用 \`import type\` 导入类型
- **泛型使用**: 合理使用泛型提高组件复用性
- **严格模式**: 启用严格的TypeScript检查

## 组件开发规范
- **单一职责**: 每个组件只负责一个功能
- **Props验证**: 使用 \`defineProps<T>()\` 进行类型验证
- **事件定义**: 使用 \`defineEmits<T>()\` 定义事件类型
- **样式隔离**: 使用 \`scoped\` 样式，遵循BEM命名规范

## API与数据管理规范
- **服务分层**: API服务 → 业务逻辑 → 组件展示
- **错误处理**: 统一的错误处理和用户提示
- **加载状态**: 所有异步操作都要有加载状态
- **数据缓存**: 合理使用Pinia进行状态管理和缓存

## 专业成员协作规范
当前任务如果涉及多个前端层次，应该：
1. **按开发链路顺序**: 严格按照前端开发链路的顺序进行开发
2. **专业成员切换**: 根据当前开发阶段切换到对应的专业成员
3. **依赖关系管理**: 确保组件依赖关系清晰，避免循环依赖
4. **代码质量把控**: 每个专业成员都要对自己负责的组件质量负责

## 强制执行检查点
在执行任何前端相关任务前，必须回答以下问题：
1. 当前要开发的组件在前端架构中的位置是什么？
2. 前置依赖组件是否已经完成？
3. 如果前置组件未完成，是否需要先切换到对应专业成员完成前置工作？
4. 当前组件的开发是否遵循Vue3和TypeScript最佳实践？

**如果任何一个检查点未通过，必须立即停止当前任务，并明确告知用户需要先完成的前置工作。**`
}

/**
 * 检查是否为前端相关模式
 *
 * @param mode - 当前模式
 * @returns 是否为前端相关模式
 */
function isFrontendRelatedMode(mode: string): boolean {
	// 🎯 统一数据源：使用统一常量模块中的前端专业模式列表
	// 前端相关模式包括：所有前端专业模式 + 系统架构师
	const frontendModes: string[] = [
		...FRONTEND_SPECIALTY_MODE_LIST,
		BASE_MODES.SA01_SYSTEM_ARCHITECT, // 架构师在前端团队时也需要了解前端原则
	]

	return frontendModes.includes(mode)
}
