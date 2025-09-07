---
sidebar_label: "Orchestrator Mode"
---

import YouTubeEmbed from '@site/src/components/YouTubeEmbed';

# Orchestrator Mode：协调复杂工作流

Orchestrator Mode（原称为 Boomerang Tasks）允许你将复杂项目分解为更小、更易管理的部分。你可以将其理解为将工作的各个部分委派给专门的助手。每个子任务都在自己的上下文中运行，通常使用为特定工作定制的不同 HN Code 模式（如 [`code`](/basic-usage/using-modes#code-mode-default)、[`architect`](/basic-usage/using-modes#architect-mode) 或 [`debug`](/basic-usage/using-modes#debug-mode)）。

<YouTubeEmbed
  url="https://www.youtube.com/watch?v=20MmJNeOODo"
  caption="Orchestrator Mode 的说明与演示"
/>

## 为什么使用 Orchestrator Mode？

- **处理复杂性**：将大型、多步骤项目（如构建完整功能）分解为专注的子任务（如设计、实现、文档）。
- **使用专门模式**：自动将子任务委派给最适合该工作的模式，利用其专门能力以获得最佳结果。
- **保持专注与效率**：每个子任务都在其独立的上下文中运行，具有单独的对话历史。这可以防止父任务（orchestrator）被详细的执行步骤（如代码差异或文件分析结果）所干扰，使其能够专注于高层次的工作流，并根据已完成子任务的简洁摘要高效管理整体流程。
- **简化工作流**：一个子任务的结果可以自动传递给下一个子任务，从而创建顺畅的工作流（例如，架构决策直接传递给编码任务）。

## 工作原理

1.  使用 Orchestrator Mode，Kilo 可以分析复杂任务并建议将其分解为子任务[^1]。
2.  父任务暂停，新的子任务以不同模式开始[^2]。
3.  当子任务的目标达成时，Kilo 会发出完成信号。
4.  父任务恢复，并仅接收子任务的摘要[^3]。父任务使用该摘要继续主工作流。

## 关键注意事项

- **需要批准**：默认情况下，每个子任务的创建和完成都需要你的批准。如果需要，可以通过 [Auto-Approving Actions](/features/auto-approving-actions#subtasks) 设置自动完成此操作。
- **上下文隔离与传递**：每个子任务都在完全隔离的上下文中运行，具有自己的对话历史。它不会自动继承父任务的上下文。信息必须显式传递：
    - **向下**：在子任务创建时通过初始指令传递。
    - **向上**：在子任务完成时通过最终摘要传递。注意，只有该摘要会返回给父任务。
- **导航**：Kilo 的界面帮助你查看任务的层次结构（哪个任务是父任务，哪些是子任务）。你通常可以在活动和暂停的任务之间导航。

Orchestrator Mode 提供了一种强大的方式来管理复杂的开发工作流，直接在 HN Code 中利用专门模式以实现最大效率。

:::tip 保持任务专注
使用子任务来保持清晰度。如果请求显著改变了焦点或需要不同的专业知识（模式），请考虑创建子任务，而不是让当前任务过载。
:::

[^1]: 此上下文通过 [`new_task`](/features/tools/new-task) 工具的 `message` 参数传递。

[^2]: 子任务的模式通过 [`new_task`](/features/tools/new-task) 工具的 `mode` 参数在启动时指定。

[^3]: 此摘要通过 [`attempt_completion`](/features/tools/attempt-completion) 工具的 `result` 参数在子任务完成时传递。
