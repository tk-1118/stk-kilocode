import { getDddGuidelinesSection } from "../ddd-guidelines"
import type { ClineProviderState } from "../../../webview/ClineProvider"

describe("getDddGuidelinesSection", () => {
	it("should return empty string for non-DDD modes", () => {
		const state: Partial<ClineProviderState> = {
			mode: "dev99-coder",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toBe("")
	})

	it("should return DDD guidelines for domain model mode", () => {
		const state: Partial<ClineProviderState> = {
			mode: "domain-model-and-value-object-coder-agent",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toContain("DDD开发指导原则")
		expect(result).toContain("调用链路")
		expect(result).toContain("生成链路")
		expect(result).toContain("生成前置检查规则")
	})

	it("should return DDD guidelines for domain service mode", () => {
		const state: Partial<ClineProviderState> = {
			mode: "domain-service-coder-agent",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toContain("DDD开发指导原则")
		expect(result).toContain("领域模型优先")
		expect(result).toContain("强制执行检查点")
	})

	it("should return DDD guidelines for API controller mode", () => {
		const state: Partial<ClineProviderState> = {
			mode: "northbound-api-controller-coder-agent",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toContain("DDD开发指导原则")
		expect(result).toContain("应用服务最后")
	})

	it("should return DDD guidelines for repository mode", () => {
		const state: Partial<ClineProviderState> = {
			mode: "dev12-southbound-respository-coder-agent",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toContain("DDD开发指导原则")
		expect(result).toContain("映射逻辑次之")
	})

	it("should return DDD guidelines for architect mode", () => {
		const state: Partial<ClineProviderState> = {
			mode: "sa01-system-architect",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toContain("DDD开发指导原则")
		expect(result).toContain("规范优先级")
	})

	it("should handle undefined state", () => {
		const result = getDddGuidelinesSection(undefined)
		expect(result).toBe("")
	})

	it("should handle state without mode", () => {
		const state: Partial<ClineProviderState> = {}

		const result = getDddGuidelinesSection(state as ClineProviderState)
		expect(result).toBe("")
	})

	it("should include all key DDD principles", () => {
		const state: Partial<ClineProviderState> = {
			mode: "domain-service-coder-agent",
		}

		const result = getDddGuidelinesSection(state as ClineProviderState)

		// 检查核心原则
		expect(result).toContain("规范的优先级比代码要高")
		expect(result).toContain("完美的生成示例")
		expect(result).toContain("生成前检查生成链路是否通畅")

		// 检查调用链路
		expect(result).toContain("Controller控制器或Client端口")
		expect(result).toContain("应用服务(命令/查询)")
		expect(result).toContain("领域服务(或查询仓储)")
		expect(result).toContain("南向网关实现")

		// 检查生成链路
		expect(result).toContain("领域模型(实体、值对象)")
		expect(result).toContain("映射逻辑")
		expect(result).toContain("数据库对象及Mapper")
		expect(result).toContain("领域服务(校验器、错误码、仓储接口)")
		expect(result).toContain("业务服务与应用服务")

		// 检查错误处理
		expect(result).toContain("问题回归到对应模块的单元测试中")

		// 检查强制检查点
		expect(result).toContain("如果任何一个检查点未通过，必须立即停止当前任务")
	})
})
