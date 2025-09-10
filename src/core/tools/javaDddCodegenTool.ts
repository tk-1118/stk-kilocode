import { Task } from "../task/Task"
import { formatResponse } from "../prompts/responses"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { ClineSayTool } from "../../shared/ExtensionMessage"
import * as path from "path"
import * as fs from "fs"

// 导入java-ddd-codegen-ts的核心功能
// 使用动态导入避免在扩展激活时执行main.js中的URL代码
let templatesLoaded = false
let AggregateEntityTemplate: any = null
let ValueObjectTemplate: any = null
let EnumValueObjectTemplate: any = null
let writeToJavaFileAsync: any = null
let generateReport: any = null

async function loadTemplates() {
	if (!templatesLoaded) {
		try {
			// 分别导入需要的模块，避免导入包含URL代码的main.js
			const aggregateModule = await import("java-ddd-codegen-ts/dist/aggregateEntityTemplate.js")
			const valueObjectModule = await import("java-ddd-codegen-ts/dist/valueObjectTemplate.js")
			const enumModule = await import("java-ddd-codegen-ts/dist/enumValueObjectTemplate.js")
			const utilModule = await import("java-ddd-codegen-ts/dist/util.js")

			AggregateEntityTemplate = aggregateModule.AggregateEntityTemplate
			ValueObjectTemplate = valueObjectModule.ValueObjectTemplate
			EnumValueObjectTemplate = enumModule.EnumValueObjectTemplate
			writeToJavaFileAsync = utilModule.writeToJavaFileAsync
			generateReport = utilModule.generateReport

			templatesLoaded = true
		} catch (error) {
			throw new Error(
				`Failed to load java-ddd-codegen-ts templates: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}
}

/**
 * 本地实现的代码生成函数，避免导入有问题的main.js
 */
async function doGenerateCode(jsonData: any, packageName: string, outputDir = ".", options: any = {}) {
	await loadTemplates()

	const { overwrite = false, backup = false, verbose = false } = options
	console.log("\x1b[36m[INFO]\x1b[0m 开始生成代码...")
	console.log(`\x1b[36m[INFO]\x1b[0m 输出目录: ${outputDir}`)
	console.log(`\x1b[36m[INFO]\x1b[0m 覆盖模式: ${overwrite ? "是" : "否"}`)
	console.log(`\x1b[36m[INFO]\x1b[0m 备份模式: ${backup ? "是" : "否"}`)

	// 构建值对象模板
	function buildValueObjectTemplates(jsonData: any, packageName: string): any[] {
		const valueObjectPackageName = packageName + ".valueobject"
		const valueObjectList: any[] = []

		for (const item of jsonData.attributes || []) {
			if (item.type === "ValueObject") {
				valueObjectList.push(new ValueObjectTemplate(item, valueObjectPackageName))
			} else if (item.type === "enum implements ValueObject") {
				valueObjectList.push(new EnumValueObjectTemplate(item, valueObjectPackageName))
			}
		}

		// 构建子对象
		for (const item of valueObjectList) {
			valueObjectList.push(...item.buildChildren())
		}

		return valueObjectList
	}

	// 构建聚合子项
	function buildSimpleEntity(jsonData: any, packageName: string, valueObjectList: any[]): any[] {
		const simpleEntityList: any[] = []

		for (const item of jsonData.attributes || []) {
			if (item.type === "SimpleEntity") {
				// 将JsonAttribute转换为JsonSchema
				const simpleEntitySchema = {
					boundedContextName: item.boundedContextName || "",
					name: item.name,
					type: item.type,
					attributes: item.attributes || [],
					description: item.description || "",
					behavior: [],
					itemFormat: item.itemFormat,
					realDataType: item.realDataType,
					enumData: item.enumData,
				}
				simpleEntityList.push(new AggregateEntityTemplate(simpleEntitySchema, packageName))
			}
			// 递归构建值对象
			valueObjectList.push(...buildValueObjectTemplates(item, packageName))
		}

		return simpleEntityList
	}

	// 并行构建所有模板
	const aggregateEntity = new AggregateEntityTemplate(jsonData, packageName)
	const basicValueObjectsOfAggregateEntity = aggregateEntity.buildAggregateEntityBasicVos()
	const valueObjectList = buildValueObjectTemplates(jsonData, packageName)
	valueObjectList.push(...basicValueObjectsOfAggregateEntity)

	// 构建聚合子项
	const simpleEntityList = buildSimpleEntity(jsonData, packageName, valueObjectList)
	for (const se of simpleEntityList) {
		valueObjectList.push(...se.buildAggregateEntityBasicVos())
	}

	// 创建所有异步任务
	const tasks: Promise<any>[] = []
	const writeOptions = { overwrite, backup }

	// 添加聚合根实体任务
	tasks.push(
		writeToJavaFileAsync(
			aggregateEntity.packageName,
			aggregateEntity.aggregateEntityName,
			aggregateEntity.toString(),
			outputDir,
			writeOptions,
		)
			.then((result: any) => {
				if (verbose) {
					console.log(`\x1b[32m[SUCCESS]\x1b[0m 聚合根实体处理完成: ${result.status}`)
				}
				return result
			})
			.catch((error: any) => {
				console.error("\x1b[31m[ERROR]\x1b[0m 聚合根实体生成失败:", error.message)
				return {
					filePath: `${aggregateEntity.packageName}/${aggregateEntity.aggregateEntityName}.java`,
					status: "error",
					message: error.message,
				}
			}),
	)

	// 添加聚合子项任务
	const simpleEntityTasks = simpleEntityList.map((se: any) =>
		writeToJavaFileAsync(se.packageName, se.aggregateEntityName, se.toString(), outputDir, writeOptions)
			.then((result: any) => {
				if (verbose) {
					console.log(
						`\x1b[32m[SUCCESS]\x1b[0m 聚合子项 ${se.aggregateEntityName} 处理完成: ${result.status}`,
					)
				}
				return result
			})
			.catch((error: any) => {
				console.error(`\x1b[31m[ERROR]\x1b[0m 聚合子项 ${se.aggregateEntityName} 生成失败:`, error.message)
				return {
					filePath: `${se.packageName}/${se.aggregateEntityName}.java`,
					status: "error",
					message: error.message,
				}
			}),
	)
	tasks.push(...simpleEntityTasks)

	// 并行处理所有值对象
	const valueObjectTasks = valueObjectList.map((vo: any) => {
		const name = "valueObjectName" in vo ? vo.valueObjectName : "Unknown"
		return writeToJavaFileAsync(vo.packageName, name, vo.toString(), outputDir, writeOptions)
			.then((result: any) => {
				if (verbose) {
					console.log(`\x1b[32m[SUCCESS]\x1b[0m 值对象 ${name} 处理完成: ${result.status}`)
				}
				return result
			})
			.catch((error: any) => {
				console.error(`\x1b[31m[ERROR]\x1b[0m 值对象 ${name} 生成失败:`, error.message)
				return {
					filePath: `${vo.packageName}/${name}.java`,
					status: "error",
					message: error.message,
				}
			})
	})
	tasks.push(...valueObjectTasks)

	// 并发执行所有任务
	console.log(`\x1b[36m[INFO]\x1b[0m 开始并发处理 ${tasks.length} 个文件...`)
	const results = await Promise.all(tasks)

	// 生成报告
	const report = generateReport(results)

	// 总结
	if (report.errorFiles === 0) {
		console.log("\x1b[32m[SUCCESS]\x1b[0m 所有代码生成完成！")
	} else {
		console.log("\x1b[33m[WARNING]\x1b[0m 代码生成完成，但有部分错误！")
	}

	return report
}

/**
 * Java DDD代码生成器工具参数接口
 */
interface JavaDddCodegenParams {
	json_schema: string
	package_name: string
	output_dir?: string
	overwrite?: boolean
	backup?: boolean
	verbose?: boolean
}

/**
 * 验证JSON Schema格式
 */
function validateJsonSchema(jsonString: string): any {
	try {
		const schema = JSON.parse(jsonString)

		// 基本字段验证
		if (!schema.name || typeof schema.name !== "string") {
			throw new Error("JSON Schema必须包含有效的name字段")
		}

		if (
			!schema.type ||
			!["AggregateRootEntity", "SimpleEntity", "ValueObject", "enum implements ValueObject"].includes(schema.type)
		) {
			throw new Error(
				"JSON Schema的type字段必须是: AggregateRootEntity, SimpleEntity, ValueObject, 或 enum implements ValueObject",
			)
		}

		if (!Array.isArray(schema.attributes)) {
			throw new Error("JSON Schema必须包含attributes数组")
		}

		// 设置默认值
		return {
			name: schema.name,
			type: schema.type,
			description: schema.description || `${schema.name}领域模型`,
			itemFormat: schema.itemFormat || "SINGLE",
			attributes: schema.attributes || [],
			...schema,
		}
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`JSON格式错误: ${error.message}`)
		}
		throw error
	}
}

/**
 * 验证包名格式
 */
function validatePackageName(packageName: string): boolean {
	const packageRegex = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/
	return packageRegex.test(packageName)
}

/**
 * 确保输出目录存在
 */
async function ensureOutputDirectory(outputDir: string): Promise<void> {
	try {
		await fs.promises.access(outputDir)
	} catch {
		await fs.promises.mkdir(outputDir, { recursive: true })
	}
}

/**
 * 递归扫描目录，查找所有Java文件
 */
async function scanDirectory(dirPath: string): Promise<string[]> {
	const results: string[] = []

	try {
		const items = await fs.promises.readdir(dirPath, { withFileTypes: true })

		for (const item of items) {
			const fullPath = path.join(dirPath, item.name)

			if (item.isDirectory()) {
				// 递归扫描子目录
				const subResults = await scanDirectory(fullPath)
				results.push(...subResults)
			} else if (item.isFile() && item.name.endsWith(".java")) {
				// 添加Java文件
				results.push(fullPath)
			}
		}
	} catch (error) {
		// 目录不存在或无法访问
		console.log(`\x1b[33m[WARN]\x1b[0m 无法扫描目录 ${dirPath}: ${error.message}`)
	}

	return results
}

/**
 * Java DDD代码生成器工具实现
 */
export async function javaDddCodegenTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	try {
		const params = block.params as Partial<JavaDddCodegenParams>

		// 处理部分请求
		if (block.partial) {
			const partialMessage = JSON.stringify({
				tool: "newFileCreated",
				content: "正在准备Java DDD代码生成...",
			} satisfies ClineSayTool)

			await cline.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		}

		// 参数验证
		if (!params.json_schema) {
			cline.consecutiveMistakeCount++
			pushToolResult(formatResponse.toolError("缺少必需参数: json_schema"))
			return
		}

		if (!params.package_name) {
			cline.consecutiveMistakeCount++
			pushToolResult(formatResponse.toolError("缺少必需参数: package_name"))
			return
		}

		// 验证包名格式
		if (!validatePackageName(params.package_name)) {
			cline.consecutiveMistakeCount++
			pushToolResult(
				formatResponse.toolError("包名格式无效。包名必须符合Java包命名规范，如: com.example.domain.orderaggr"),
			)
			return
		}

		// 验证JSON Schema
		let jsonSchema: any
		try {
			jsonSchema = validateJsonSchema(params.json_schema)
		} catch (error) {
			cline.consecutiveMistakeCount++
			pushToolResult(
				formatResponse.toolError(`JSON Schema验证失败: ${error instanceof Error ? error.message : "未知错误"}`),
			)
			return
		}

		// 重置错误计数
		cline.consecutiveMistakeCount = 0

		// 准备生成选项
		let outputDir: string
		if (params.output_dir) {
			// 如果用户指定了输出目录，确保相对路径是相对于当前工作目录
			if (path.isAbsolute(params.output_dir)) {
				outputDir = params.output_dir
			} else {
				outputDir = path.resolve(cline.cwd, params.output_dir)
			}
		} else {
			outputDir = cline.cwd
		}
		const options: any = {
			overwrite: params.overwrite || false,
			backup: params.backup || false,
			verbose: true, // 强制启用详细日志以便调试
		}

		// 调试信息：显示实际的输出路径
		console.log(`\x1b[36m[DEBUG]\x1b[0m 当前工作目录: ${cline.cwd}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m 用户指定输出目录: ${params.output_dir || "未指定"}`)
		if (params.output_dir) {
			console.log(`\x1b[36m[DEBUG]\x1b[0m 用户路径是否为绝对路径: ${path.isAbsolute(params.output_dir)}`)
		}
		console.log(`\x1b[36m[DEBUG]\x1b[0m 解析后的输出目录: ${outputDir}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m 输出目录绝对路径: ${path.resolve(outputDir)}`)

		// 计算包路径
		const packagePath = (params.package_name.split(".domain.")[1] ?? "").replace(/\./g, "/") ?? ""
		console.log(`\x1b[36m[DEBUG]\x1b[0m 包名: ${params.package_name}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m 解析后的包路径: ${packagePath}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m 预期文件生成路径: ${path.join(outputDir, packagePath)}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m 预期文件生成绝对路径: ${path.resolve(path.join(outputDir, packagePath))}`)

		// 检查JSON Schema
		console.log(`\x1b[36m[DEBUG]\x1b[0m JSON Schema长度: ${params.json_schema.length}`)
		console.log(`\x1b[36m[DEBUG]\x1b[0m JSON Schema预览: ${params.json_schema.substring(0, 200)}...`)

		// 构建完整的消息用于用户确认
		const completeMessage = JSON.stringify({
			tool: "newFileCreated",
			content: `生成Java DDD代码:
- 实体名称: ${jsonSchema.name}
- 实体类型: ${jsonSchema.type}
- 包名: ${params.package_name}
- 输出目录: ${outputDir}
- 覆盖现有文件: ${options.overwrite ? "是" : "否"}
- 备份现有文件: ${options.backup ? "是" : "否"}
- 详细日志: ${options.verbose ? "是" : "否"}`,
		} satisfies ClineSayTool)

		// 请求用户批准
		const didApprove = await askApproval("tool", completeMessage)
		if (!didApprove) {
			return
		}

		// 确保输出目录存在
		await ensureOutputDirectory(outputDir)

		// 执行代码生成
		console.log(`\x1b[36m[DEBUG]\x1b[0m 开始调用doGenerateCode函数...`)
		const result = await doGenerateCode(jsonSchema, params.package_name, outputDir, options)
		console.log(`\x1b[36m[DEBUG]\x1b[0m doGenerateCode函数执行完成`)

		// 构建结果报告
		const successFiles = result.results.filter((r: any) => r.status === "created" || r.status === "updated")
		const errorFiles = result.results.filter((r: any) => r.status === "error")
		const skippedFiles = result.results.filter((r: any) => r.status === "skipped")

		let reportContent = `## Java DDD代码生成完成

### 🎯 生成路径信息
- **当前工作目录**: ${cline.cwd}
- **输出目录**: ${outputDir}
- **包路径**: ${packagePath}
- **完整生成路径**: ${path.join(outputDir, packagePath)}

### 📊 生成统计
- 总文件数: ${result.totalFiles}
- 成功生成: ${result.successFiles}
- 生成错误: ${result.errorFiles}
- 跳过文件: ${result.skippedFiles}

### 📁 生成的文件列表`

		if (successFiles.length > 0) {
			reportContent += `\n\n#### ✅ 成功生成的文件:`
			successFiles.forEach((file: any) => {
				reportContent += `\n- ${file.filePath} (${file.status})`
			})
		}

		if (skippedFiles.length > 0) {
			reportContent += `\n\n#### ⏭️ 跳过的文件:`
			skippedFiles.forEach((file: any) => {
				reportContent += `\n- ${file.filePath} (${file.message || "文件已存在"})`
			})
		}

		if (errorFiles.length > 0) {
			reportContent += `\n\n#### ❌ 生成失败的文件:`
			errorFiles.forEach((file: any) => {
				reportContent += `\n- ${file.filePath}: ${file.message || "未知错误"}`
			})
		}

		reportContent += `\n\n### 生成的代码特性
- ✅ 严格遵循DDD架构规范
- ✅ 自动生成Id和SN值对象
- ✅ 实现ValueObject接口和相等性比较
- ✅ 正确的包结构和导入语句
- ✅ 符合项目代码风格和命名约定

### 后续步骤
1. 检查生成的代码文件
2. 根据业务需求调整领域逻辑
3. 添加必要的业务方法和验证规则
4. 运行测试确保代码正确性`

		if (result.errorFiles > 0) {
			reportContent += `\n\n⚠️ **注意**: 有 ${result.errorFiles} 个文件生成失败，请检查错误信息并手动处理。`
		}

		// 验证文件是否真的存在
		reportContent += `\n\n### 🔍 文件存在性验证`
		console.log(`\x1b[36m[DEBUG]\x1b[0m 开始验证 ${successFiles.length} 个文件的存在性...`)

		let verificationCount = 0
		for (const file of successFiles) {
			const absolutePath = path.resolve(file.filePath)
			console.log(`\x1b[36m[DEBUG]\x1b[0m 检查文件: ${file.filePath}`)
			console.log(`\x1b[36m[DEBUG]\x1b[0m 绝对路径: ${absolutePath}`)

			try {
				await fs.promises.access(file.filePath)
				verificationCount++
				console.log(`\x1b[32m[SUCCESS]\x1b[0m 文件存在: ${file.filePath}`)
				reportContent += `\n- ✅ ${file.filePath} - 文件存在`
				reportContent += `\n  📍 绝对路径: ${absolutePath}`
			} catch (error) {
				console.log(`\x1b[31m[ERROR]\x1b[0m 文件不存在: ${file.filePath}`)
				console.log(`\x1b[31m[ERROR]\x1b[0m 错误详情: ${error.message}`)
				reportContent += `\n- ❌ ${file.filePath} - 文件不存在！`
				reportContent += `\n  📍 预期绝对路径: ${absolutePath}`
				reportContent += `\n  🔍 错误: ${error.message}`
			}
		}

		if (verificationCount === successFiles.length) {
			reportContent += `\n\n🎉 **验证成功**: 所有 ${verificationCount} 个文件都已正确生成！`
		} else {
			reportContent += `\n\n⚠️ **验证警告**: 只有 ${verificationCount}/${successFiles.length} 个文件实际存在！`

			// 如果有文件缺失，扫描输出目录看看实际生成了什么
			reportContent += `\n\n### 🔍 目录扫描 - 查找实际生成的文件`
			try {
				const scanResults = await scanDirectory(outputDir)
				if (scanResults.length > 0) {
					reportContent += `\n在输出目录 ${outputDir} 中找到以下文件:`
					scanResults.forEach((file) => {
						reportContent += `\n- 📄 ${file}`
					})
				} else {
					reportContent += `\n❌ 输出目录 ${outputDir} 中没有找到任何文件`
				}
			} catch (error) {
				reportContent += `\n❌ 无法扫描输出目录: ${error.message}`
			}
		}

		// 输出标准化的工具操作JSON，供workResults.ts统计代码行数
		const toolOperationJson = JSON.stringify({
			tool: "java_ddd_codegen",
			packageName: params.package_name,
			outputDir: outputDir,
			totalFiles: result.totalFiles,
			successFiles: result.successFiles,
			errorFiles: result.errorFiles,
			skippedFiles: result.skippedFiles,
			generatedFiles: successFiles.map((file: any) => ({
				path: file.filePath,
				status: file.status,
				type: file.filePath.includes("valueobject")
					? "ValueObject"
					: file.filePath.includes(jsonSchema.name)
						? "AggregateEntity"
						: "Entity",
			})),
			estimatedCodeLines: result.successFiles * 70, // 每个文件估算60行代码
			summary: `生成了${result.successFiles}个Java DDD文件，包含聚合根、值对象等`,
		})

		// 先输出工具操作JSON（用于workResults.ts统计）
		pushToolResult(formatResponse.toolResult(toolOperationJson))

		// 再输出详细报告（用于用户查看）
		pushToolResult(formatResponse.toolResult(reportContent))
	} catch (error) {
		await handleError("Java DDD代码生成", error)
	}
}
