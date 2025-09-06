#!/usr/bin/env node

// 根级内置扩展打包脚本：在项目根目录生成 dist/kilo-code 目录
// 目标：便于作为 VS Code 内置扩展集成（无需 .vsix），包含运行时所需文件

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 工具方法：递归删除目录（用于清理目标产物）
function rmDir(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true })
	}
}

// 工具方法：递归复制目录
function copyDir(srcDir, dstDir) {
	fs.mkdirSync(dstDir, { recursive: true })
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const srcPath = path.join(srcDir, entry.name)
		const dstPath = path.join(dstDir, entry.name)
		if (entry.isDirectory()) {
			copyDir(srcPath, dstPath)
		} else if (entry.isSymbolicLink()) {
			const link = fs.readlinkSync(srcPath)
			fs.symlinkSync(link, dstPath)
		} else {
			fs.copyFileSync(srcPath, dstPath)
		}
	}
}

// 工具方法：复制文件（若存在父目录则自动创建）
function copyFile(srcPath, dstPath, { optional = false } = {}) {
	try {
		fs.mkdirSync(path.dirname(dstPath), { recursive: true })
		fs.copyFileSync(srcPath, dstPath)
		return true
	} catch (err) {
		if (optional && (err?.code === "ENOENT" || err?.code === "ENOTDIR")) {
			console.warn(`[build-dist] 可选文件不存在，跳过：${srcPath}`)
			return false
		}
		throw err
	}
}

async function main() {
	// 路径解析
	const repoRoot = path.resolve(path.join(__dirname, ".."))
	const srcRoot = path.join(repoRoot, "src")
	const outRoot = path.join(repoRoot, "dist")
	const extensionOut = path.join(outRoot, "kilo-code") // 内置扩展目录名

	console.log("[build-dist] 1/4 清理旧产物…")
	rmDir(extensionOut)
	fs.mkdirSync(extensionOut, { recursive: true })

	console.log("[build-dist] 2/4 产出扩展 bundle（src/dist）…")
	// 产出 src/dist：确保以 production 模式执行，包含 wasm、locales、walkthrough 等资源
	execSync("pnpm -C src bundle --production", { stdio: "inherit" })

	console.log("[build-dist] 3/4 复制运行时文件到 dist/kilo-code …")
	// 必需：扩展清单和主入口指向 dist/extension.js
	copyFile(path.join(srcRoot, "package.json"), path.join(extensionOut, "package.json"))

	// 本地化清单：与市场版一致
	for (const file of fs.readdirSync(srcRoot)) {
		if (file.startsWith("package.nls") && file.endsWith(".json")) {
			copyFile(path.join(srcRoot, file), path.join(extensionOut, file))
		}
	}

	// 法务/文档：可选
	copyFile(path.join(srcRoot, "README.md"), path.join(extensionOut, "README.md"), { optional: true })
	copyFile(path.join(srcRoot, "CHANGELOG.md"), path.join(extensionOut, "CHANGELOG.md"), { optional: true })
	copyFile(path.join(srcRoot, "LICENSE"), path.join(extensionOut, "LICENSE"), { optional: true })

	// 运行时目录：dist（包含编译后 JS、wasm、locales、walkthrough、workers 等）
	copyDir(path.join(srcRoot, "dist"), path.join(extensionOut, "dist"))

	// 静态资源：图标等（package.json 引用 assets/icons/...）
	if (fs.existsSync(path.join(srcRoot, "assets"))) {
		copyDir(path.join(srcRoot, "assets"), path.join(extensionOut, "assets"))
	}

	// Webview 产物与音频：扩展运行时通过 asAbsolutePath 访问
	if (fs.existsSync(path.join(srcRoot, "webview-ui"))) {
		copyDir(path.join(srcRoot, "webview-ui"), path.join(extensionOut, "webview-ui"))
	}

	console.log("[build-dist] 4/4 验证关键文件…")
	const requiredFiles = [
		path.join(extensionOut, "package.json"),
		path.join(extensionOut, "dist", "extension.js"),
	]
	for (const file of requiredFiles) {
		if (!fs.existsSync(file)) {
			throw new Error(`[build-dist] 缺少关键文件：${path.relative(repoRoot, file)}`)
		}
	}

	console.log(`\n✅ 内置扩展已生成：${path.relative(repoRoot, extensionOut)}`)
	console.log("   可将该目录复制到 VS Code 源码的 extensions/ 目录作为内置扩展。")
}

main().catch((err) => {
	console.error("\n❌ build:dist 失败", err)
	process.exit(1)
})


