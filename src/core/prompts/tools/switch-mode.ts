export function getSwitchModeDescription(): string {
	return `## switch_mode
Description: Request to switch to a different team member (mode). This tool allows you to delegate tasks to other team members when their specific expertise is needed. You can only switch to team members that are part of your current team. The user must approve the mode switch.
Parameters:
- mode_slug: (required) The slug of the team member to switch to (must be a member of your current team)
- reason: (optional) The reason for switching to this team member
Usage:
<switch_mode>
<mode_slug>Team member slug here</mode_slug>
<reason>Reason for switching here</reason>
</switch_mode>

Example: Switching to the code specialist for implementation
<switch_mode>
<mode_slug>code</mode_slug>
<reason>Need to implement the designed architecture</reason>
</switch_mode>

Important: Only team members listed in your TEAM MEMBERS section are available for switching. Attempting to switch to a member outside your team will result in an error.`
}
