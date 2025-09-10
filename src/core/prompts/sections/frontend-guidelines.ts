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
项目结构 → 组合式函数 → 通用组件 → 业务组件 → 页面组件 → 路由配置 → 状态管理 → API服务 → Mock服务 → UI设计系统 → 国际化 → 测试 → 构建配置 → 性能优化 → 安全防护

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
Vue3+TS前端团队包含14个专业成员，每个成员负责特定的开发层次：

### 核心开发成员 (DEV-01 ~ DEV-07)
- **DEV-01**: 项目结构搭建 → **DEV-02**: 组件开发 → **DEV-03**: 组合式函数 → **DEV-04**: Mock服务 → **DEV-05**: API服务 → **DEV-06**: 状态管理 → **DEV-07**: 路由配置

### 质量保障成员 (DEV-08 ~ DEV-11)
- **DEV-08**: 前端测试 → **DEV-09**: 构建配置 → **DEV-10**: UI设计系统 → **DEV-11**: 国际化

### 高级优化成员 (DEV-12 ~ DEV-14)
- **DEV-12**: 性能监控与可观测 → **DEV-13**: 安全防护 → **DEV-14**: 页面集成开发

### 协作原则
1. **严格按序开发**: 必须按照 DEV-01 → DEV-14 的顺序进行开发
2. **专业成员切换**: 根据当前开发阶段自动切换到对应的专业成员
3. **依赖关系管理**: 后续成员的工作必须基于前置成员的完成结果
4. **质量责任制**: 每个专业成员对自己负责的模块质量全权负责

## 强制执行检查点
在执行任何前端相关任务前，必须回答以下问题：
1. **专业成员定位**: 当前任务应该由哪个专业成员(DEV-01~DEV-14)负责？
2. **前置依赖检查**: 前序专业成员的工作是否已经完成？
3. **开发顺序验证**: 是否严格按照 DEV-01 → DEV-14 的顺序进行开发？
4. **技术规范遵循**: 当前开发是否遵循Vue3+TypeScript+Vite最佳实践？
5. **质量标准确认**: 是否满足对应专业成员的质量标准和职责要求？

**如果任何一个检查点未通过，必须立即停止当前任务，并明确告知用户需要先完成的前置工作或切换到正确的专业成员。**`
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
