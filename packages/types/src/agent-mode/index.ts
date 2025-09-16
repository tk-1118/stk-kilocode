/**
 * Agent模式统一管理
 * 
 * 导出所有子agent的定义，供mode.ts统一引入使用
 */

import type { ModeConfig } from '../mode.ts'

// 收集所有agent配置
import { FDEV01 } from './fdev01-page-coder.js'
import { FDEV02 } from './fdev02-api-service-coder.js'
import { FDEV04 } from './fdev04-mockjs-service-coder.js'
import { FDEV07 } from './fdev07-ui-design-system-coder.js'
import { FDEV08 } from './fdev08-quality-coder.js'

/**
 * 所有Agent模式配置数组
 * 按照编号顺序排列
 */
export const AGENT_MODES: readonly ModeConfig[] = [
  FDEV01,
  FDEV02,
  FDEV04,
  FDEV07,
  FDEV08,
]

/**
 * Agent模式活动描述映射
 * 用于UI中显示用户当前正在进行的活动类型
 */
export const AGENT_MODE_ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  'fdev01-vue3ts-page-coder-agent': '开始开发Vue3+TS页面组件',
  'fdev02-vue3ts-api-service-coder-agent': '开始开发API服务层',
  'fdev04-vue3ts-mockjs-service-coder-agent': '开始配置MockJS数据模拟服务',
  'fdev07-vue3ts-ui-design-system-coder-agent': '开始设计UI设计系统',
  'fdev08-vue3ts-quality-coder-agent': '开始进行代码质量检查',
} as const

/**
 * 获取Agent模式活动描述的工具函数
 */
export function getAgentModeActivityDescription(modeSlug: string): string {
  return AGENT_MODE_ACTIVITY_DESCRIPTIONS[modeSlug] || "开始处理任务"
}
