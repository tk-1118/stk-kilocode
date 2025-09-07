import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"
import {
	DISCORD_URL,
	REDDIT_URL,
	TWITTER_URL,
	GITHUB_MAIN_REPO_URL,
	GITHUB_ISSUES_MAIN_URL,
	GITHUB_FEATURES_URL,
	VSCODE_MARKETPLACE_URL,
	OPEN_VSX_URL,
	CONTACT_EMAIL,
	CAREERS_URL,
	WEBSITE_PRIVACY_URL,
	EXTENSION_PRIVACY_URL,
	GITHUB_REPO_URL,
} from "./src/constants"

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: "HN Code Docs",
	tagline: "HN Code Documentation",
	favicon: "img/favicon.ico",

	// Set the production url of your site here
	url: "https://kilocode.ai",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/docs",

	customFields: {
		freeTierAmount: process.env.FREE_TIER_AMOUNT || "$20",
	},

	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en", "zh-CN"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					routeBasePath: "/",
					editUrl: `${GITHUB_REPO_URL}/edit/main/`,
					showLastUpdateTime: true,
				},
				blog: false, // Disable blog feature
				sitemap: {
					lastmod: "date",
					priority: null,
					changefreq: null,
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	themes: [
		[
			require.resolve("@easyops-cn/docusaurus-search-local"),
			{
				hashed: true,
				language: ["en"],
				highlightSearchTermsOnTargetPage: false,
				explicitSearchResultPath: true,
				docsRouteBasePath: "/",
			},
		],
	],

	plugins: [
		...(process.env.POSTHOG_API_KEY
			? [
					[
						"posthog-docusaurus",
						{
							apiKey: process.env.POSTHOG_API_KEY,
							appUrl: "https://us.i.posthog.com",
							enableInDevelopment: true,
						},
					],
				]
			: []),
		[
			"@docusaurus/plugin-client-redirects",
			{
				redirects: [
					// Files moved from advanced-usage to features
					{
						to: "/features/checkpoints",
						from: ["/advanced-usage/checkpoints"],
					},
					{
						to: "/features/code-actions",
						from: ["/advanced-usage/code-actions"],
					},
					{
						to: "/advanced-usage/custom-instructions",
						from: ["/features/custom-instructions"],
					},
					{
						to: "/features/custom-modes",
						from: ["/advanced-usage/custom-modes"],
					},
					{
						to: "/features/enhance-prompt",
						from: ["/advanced-usage/enhance-prompt"],
					},
					{
						to: "/features/experimental/experimental-features",
						from: ["/advanced-usage/experimental-features"],
					},
					{
						to: "/features/model-temperature",
						from: ["/advanced-usage/model-temperature"],
					},
					{
						to: "/features/auto-approving-actions",
						from: ["/advanced-usage/auto-approving-actions"],
					},
					{
						to: "/features/api-configuration-profiles",
						from: ["/advanced-usage/api-configuration-profiles"],
					},

					// MCP related redirects
					{
						to: "/features/mcp/overview",
						from: ["/advanced-usage/mcp", "/mcp/overview"],
					},
					{
						to: "/features/mcp/using-mcp-in-kilo-code",
						from: ["/mcp/using-mcp-in-kilo-code"],
					},
					{
						to: "/features/mcp/what-is-mcp",
						from: ["/mcp/what-is-mcp"],
					},
					{
						to: "/features/mcp/server-transports",
						from: ["/mcp/server-transports"],
					},
					{
						to: "/features/mcp/mcp-vs-api",
						from: ["/mcp/mcp-vs-api"],
					},
				],
			},
		],
	],

	themeConfig: {
		image: "img/kilo-v1.svg",
		navbar: {
			title: "HN Code",
			logo: {
				alt: "HN Code Logo",
				src: "img/kilo-v1.svg",
				srcDark: "img/kilo-v1-white.svg",
				href: "/",
				target: "_self",
			},
			items: [
				{
					href: GITHUB_MAIN_REPO_URL,
					label: "GitHub",
					position: "right",
				},
				{
					href: VSCODE_MARKETPLACE_URL,
					label: "Install Extension",
					position: "right",
				},
				{
					type: "localeDropdown",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Community",
					items: [
						{
							label: "Discord",
							href: DISCORD_URL,
						},
						{
							label: "Reddit",
							href: REDDIT_URL,
						},
						{
							label: "Twitter",
							href: TWITTER_URL,
						},
					],
				},
				{
					title: "GitHub",
					items: [
						{
							label: "Issues",
							href: GITHUB_ISSUES_MAIN_URL,
						},
						{
							label: "Feature Requests",
							href: GITHUB_FEATURES_URL,
						},
					],
				},
				{
					title: "Download",
					items: [
						{
							label: "VS Code Marketplace",
							href: VSCODE_MARKETPLACE_URL,
						},
						{
							label: "Open VSX Registry",
							href: OPEN_VSX_URL,
						},
					],
				},
				{
					title: "Company",
					items: [
						{
							label: "Contact",
							href: CONTACT_EMAIL,
							target: "_self",
						},
						{
							label: "Careers",
							href: CAREERS_URL,
						},
						{
							label: "Website Privacy Policy",
							href: WEBSITE_PRIVACY_URL,
						},
						{
							label: "Extension Privacy Policy",
							href: EXTENSION_PRIVACY_URL,
						},
					],
				},
			],
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
}

export default config
