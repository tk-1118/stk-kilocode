import { ToolArgs } from "./types"

export function getNewTaskDescription(args: ToolArgs): string {
	const todosRequired = args.settings?.newTaskRequireTodos === true

	// When setting is disabled, don't show todos parameter at all
	if (!todosRequired) {
		return `## new_task
Description: This will let you create a new task instance with a specific team member using your provided message. The new task will be handled by the selected team member.

Parameters:
- mode: (required) The slug of the team member to handle the new task (must be available in your current team).
- message: (required) The initial user message or instructions for this new task.

Usage:
<new_task>
<mode>team-member-slug-here</mode>
<message>Your initial instructions here</message>
</new_task>

Example:
<new_task>
<mode>code</mode>
<message>Implement a new feature for the application.</message>
</new_task>

Note: The specified team member must be available in your current team. Check your TEAM MEMBERS section for available options.
`
	}

	// When setting is enabled, show todos as required
	return `## new_task
Description: This will let you create a new task instance with a specific team member using your provided message and initial todo list. The new task will be handled by the selected team member.

Parameters:
- mode: (required) The slug of the team member to handle the new task (must be available in your current team).
- message: (required) The initial user message or instructions for this new task.
- todos: (required) The initial todo list in markdown checklist format for the new task.

Usage:
<new_task>
<mode>team-member-slug-here</mode>
<message>Your initial instructions here</message>
<todos>
[ ] First task to complete
[ ] Second task to complete
[ ] Third task to complete
</todos>
</new_task>

Example:
<new_task>
<mode>code</mode>
<message>Implement user authentication</message>
<todos>
[ ] Set up auth middleware
[ ] Create login endpoint
[ ] Add session management
[ ] Write tests
</todos>
</new_task>

Note: The specified team member must be available in your current team. Check your TEAM MEMBERS section for available options.
`
}
