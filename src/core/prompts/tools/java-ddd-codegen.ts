import { ToolArgs } from "./types"

/**
 * Java DDD代码生成器工具描述
 * 基于JSON Schema生成符合DDD规范的Java领域模型代码
 */
export function getJavaDddCodegenDescription(args: ToolArgs): string {
	return `## java_ddd_codegen

基于JSON Schema自动生成符合DDD（领域驱动设计）规范的Java领域模型代码，包括聚合根实体、聚合子项、值对象和枚举值对象。

### 功能特性
- **聚合根实体生成**: 生成继承AggregateRoot的聚合根实体类
- **聚合子项生成**: 生成继承BaseEntity的聚合子项实体类
- **值对象生成**: 生成实现ValueObject接口的值对象类
- **枚举值对象生成**: 生成实现ValueObject接口的枚举类
- **自动Id/SN生成**: 自动为每个实体生成Id和SN值对象
- **递归子对象生成**: 支持值对象嵌套，自动生成所有子对象

### 参数说明
- **json_schema** (必需): JSON格式的领域模型定义，包含实体名称、类型、属性等信息
  - 🚨 **严格优先级原则**：
    1. **用户消息中的JSON数据** - 如果用户提供了包含"name"、"type"、"attributes"的JSON结构，直接使用
    2. **用户指定的Schema文件** - 使用read_file读取用户提到的JSON文件
    3. **搜索现有文件** - 查找项目中可能存在的Schema文件
    4. **最后才构建** - 只有确认没有现成Schema时才手动构建
  - ❌ **严格禁止的行为**：
    - 说"我将构建符合规范的JSON Schema"
    - 说"需要去重"、"清理重复属性"、"优化JSON结构"
    - 对用户JSON进行任何形式的修改、改造、优化
    - 分析用户JSON后说"有重复项需要处理"
  - ✅ **正确做法**：说"发现用户提供的JSON Schema，原样使用"
- **package_name** (必需): Java包名，如 "com.zz.dingdangmallprd.orderbc.domain.orderaggr"
- **output_dir** (可选): 输出目录路径，相对于当前工作目录，默认为 "."
- **overwrite** (可选): 是否覆盖现有文件，默认为false
- **backup** (可选): 覆盖前是否备份现有文件，默认为false
- **verbose** (可选): 是否显示详细日志，默认为false

### 🚨 输出路径重要说明
- **包名解析规则**：工具只使用package_name中".domain."之后的部分创建目录
- **路径计算逻辑**：
  1. 从package_name提取".domain."后的部分
  2. 在output_dir下创建对应目录结构
  3. 聚合根文件放在聚合目录下
  4. 值对象文件放在聚合目录的valueobject子目录下

- **正确的路径设置示例**：
  - package_name: "com.zz.dingdangmallprd.goodsbc.domain.goodsaggr"
  - 期望最终路径: "./goodsbc/goodsbc-domain/src/main/java/com/zz/dingdangmallprd/goodsbc/domain/goodsaggr/"
  - **正确的output_dir**: "./goodsbc/goodsbc-domain/src/main/java/com/zz/dingdangmallprd/goodsbc/domain"
  - **错误的output_dir**: "./goodsbc/goodsbc-domain/src/main/java/com/zz/domain"

- **生成结果**：
  - 工具提取: "goodsaggr"（.domain.之后的部分）
  - 聚合根位置: "./goodsbc/goodsbc-domain/src/main/java/com/zz/dingdangmallprd/goodsbc/domain/goodsaggr/GoodsAggregateRootEntity.java"
  - 值对象位置: "./goodsbc/goodsbc-domain/src/main/java/com/zz/dingdangmallprd/goodsbc/domain/goodsaggr/valueobject/GoodsSN.java"

- **重要提醒**：生成后必须验证文件是否在正确位置，如果找不到文件，检查实际生成的目录结构

### JSON Schema格式示例
\`\`\`json
{
  "name": "order",
  "type": "AggregateRootEntity",
  "description": "订单聚合根",
  "itemFormat": "SINGLE",
  "attributes": [
    {
      "name": "orderStatus",
      "type": "enum implements ValueObject",
      "description": "订单状态",
      "itemFormat": "SINGLE",
      "attributes": [{
        "name": "value",
        "type": "ENUM",
        "enumData": "[{\\"englishName\\":\\"PENDING_PAYMENT\\",\\"businessMeaning\\":\\"待支付\\"}]"
      }]
    },
    {
      "name": "orderMoney",
      "type": "ValueObject",
      "realDataType": "DECIMAL",
      "description": "订单金额",
      "itemFormat": "SINGLE"
    }
  ]
}
\`\`\`

### 支持的数据类型
- **基本类型**: STRING, INTEGER, BOOLEAN, LONG, DECIMAL, LOCAL_DATETIME
- **复杂类型**: ValueObject, SimpleEntity, enum implements ValueObject
- **集合类型**: 支持SINGLE和MULTI格式

### 生成的代码规范
- 严格遵循DDD架构规范
- 符合项目代码风格和命名约定
- 自动生成必要的注解和导入语句
- 实现正确的相等性比较方法

### 使用场景
- 快速生成领域模型骨架代码
- 确保代码符合DDD规范
- 减少重复性编码工作
- 保持代码结构一致性

此工具特别适合与bdev07-domain-model-and-value-object-coder-agent智能体配合使用，实现领域模型的快速生成和验证。`
}
