---
sidebar_label: Claude Code
---

# Using Claude Code With HN Code

Claude Code is Anthropic's official CLI that provides direct access to Claude models from your terminal. Using Claude Code with HN Code lets you leverage your existing CLI setup without needing separate API keys.

**Website:** [https://docs.anthropic.com/en/docs/claude-code/setup](https://docs.anthropic.com/en/docs/claude-code/setup)

## Installing and Setting Up Claude Code

1. **Install Claude Code:** Follow the installation instructions at [Anthropic's Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/setup).
2. **Authenticate:** Run `claude` in your terminal. Claude Code offers multiple authentication options including the Anthropic Console (default), Claude App with Pro/Max plans, and enterprise platforms like Amazon Bedrock or Google Vertex AI. See [Anthropic's authentication documentation](https://docs.anthropic.com/en/docs/claude-code/setup) for complete details.
3. **Verify Installation:** Test that everything works by running `claude --version` in your terminal.

:::warning Environment Variable Usage
The `claude` command-line tool, like other Anthropic SDKs, can use the `ANTHROPIC_API_KEY` environment variable for authentication. This is a common method for authorizing CLI tools in non-interactive environments.

If this environment variable is set on your system, the `claude` tool may use it for authentication instead of the interactive `/login` method. When HN Code executes the tool, it will accurately reflect that an API key is being used, as this is the underlying behavior of the `claude` CLI itself.
:::

**Website:** [https://docs.anthropic.com/en/docs/claude-code/setup](https://docs.anthropic.com/en/docs/claude-code/setup)

## Supported Models

HN Code supports the following Claude models through Claude Code:

- **Claude Opus 4.1** (Most capable)
- **Claude Opus 4**
- **Claude Sonnet 4** (Latest, recommended)
- **Claude 3.7 Sonnet**
- **Claude 3.5 Sonnet**
- **Claude 3.5 Haiku** (Fast responses)

The specific models available depend on your Claude subscription and plan. See [Anthropic's Model Documentation](https://docs.anthropic.com/en/docs/about-claude/models) for more details on each model's capabilities.

## Configuration in HN Code

1. **Open HN Code Settings:** Click the gear icon (<Codicon name="gear" />) in the HN Code panel.
2. **Select Provider:** Choose "Claude Code" from the "API Provider" dropdown.
3. **Select Model:** Choose your desired Claude model from the "Model" dropdown.
4. **(Optional) Custom CLI Path:** If you installed Claude Code to a location other than the default `claude` command, enter the full path to your Claude executable in the "Claude Code Path" field. Most users won't need to change this.

## Tips and Notes

- **No API Keys Required:** Claude Code uses your existing CLI authentication, so you don't need to manage separate API keys.
- **Cost Transparency:** Usage costs are reported directly by the Claude CLI, giving you clear visibility into your spending.
- **Advanced Reasoning:** Full support for Claude's thinking modes and reasoning capabilities when available.
- **Context Windows:** Claude models have large context windows, allowing you to include significant amounts of code and context in your prompts.
- **Enhance Prompt Feature:** Full compatibility with HN Code's Enhance Prompt feature, allowing you to automatically improve and refine your prompts before sending them to Claude.
- **Custom Paths:** If you installed Claude Code in a non-standard location, you can specify the full path in the settings. Examples:
    - Windows: `C:\tools\claude\claude.exe`
    - macOS/Linux: `/usr/local/bin/claude` or `~/bin/claude`

## Troubleshooting

- **"Claude Code process exited with error":** Verify Claude Code is installed (`claude --version`) and authenticated (`claude auth login`). Make sure your subscription includes the selected model.
- **Custom path not working:** Use the full absolute path to the Claude executable and verify the file exists and is executable. On Windows, include the `.exe` extension.
