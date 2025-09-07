---
sidebar_label: OpenRouter
---

# Using OpenRouter With HN Code

OpenRouter is an AI platform that provides access to a wide variety of language models from different providers, all through a single API. This can simplify setup and allow you to easily experiment with different models.

**Website:** [https://openrouter.ai/](https://openrouter.ai/)

## Getting an API Key

1.  **Sign Up/Sign In:** Go to the [OpenRouter website](https://openrouter.ai/). Sign in with your Google or GitHub account.
2.  **Get an API Key:** Go to the [keys page](https://openrouter.ai/keys). You should see an API key listed. If not, create a new key.
3.  **Copy the Key:** Copy the API key.

## Supported Models

OpenRouter supports a large and growing number of models. HN Code automatically fetches the list of available models. Refer to the [OpenRouter Models page](https://openrouter.ai/models) for the complete and up-to-date list.

## Configuration in HN Code

1.  **Open HN Code Settings:** Click the gear icon (<Codicon name="gear" />) in the HN Code panel.
2.  **Select Provider:** Choose "OpenRouter" from the "API Provider" dropdown.
3.  **Enter API Key:** Paste your OpenRouter API key into the "OpenRouter API Key" field.
4.  **Select Model:** Choose your desired model from the "Model" dropdown.
5.  **(Optional) Custom Base URL:** If you need to use a custom base URL for the OpenRouter API, check "Use custom base URL" and enter the URL. Leave this blank for most users.

## Supported Transforms

OpenRouter provides an [optional "middle-out" message transform](https://openrouter.ai/docs/features/message-transforms) to help with prompts that exceed the maximum context size of a model. You can enable it by checking the "Compress prompts and message chains to the context size" box.

## Tips and Notes

- **Model Selection:** OpenRouter offers a wide range of models. Experiment to find the best one for your needs.
- **Pricing:** OpenRouter charges based on the underlying model's pricing. See the [OpenRouter Models page](https://openrouter.ai/models) for details.
- **Prompt Caching:** Some providers support prompt caching. See the OpenRouter documentation for supported models.
