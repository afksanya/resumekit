# ResumeKit

[English](./README.md)

ResumeKit 是一个本地优先的简历版本管理与求职投递记录工具。

它帮助求职者用结构化方式管理简历内容，为不同岗位创建定制版本，导出可读简历，对比版本差异，并记录每次投递使用了哪一版简历。

## 为什么做这个

很多人的简历文件最后都会变成这样：

- `简历最终版.pdf`
- `简历最终版2.pdf`
- `前端岗位简历.pdf`
- `某公司投递版_new.pdf`

时间一长，很难记清楚哪份简历投给了哪家公司，也很难复用之前改好的内容。

ResumeKit 的目标是：让简历像代码一样结构化、可版本化、可对比、可复用。

## 当前功能

- 初始化本地简历工作区
- 使用 JSON 存储简历内容
- 创建命名简历版本
- 导出 HTML、PDF 或 JSON
- 支持 `classic`、`ats`、`modern` 三种 HTML 和 PDF 模板
- 记录求职投递
- 查看投递状态摘要
- 校验简历完整度
- 对比两个简历版本

## 快速开始

```bash
node ./bin/resumekit.js demo
```

这条命令会创建一个带完整示例简历的本地 `.resumekit` 工作区，导出 HTML，并告诉你哪些内容需要补全。

## 常用命令

创建一个本地 ResumeKit 工作区：

```bash
resumekit init
```

创建一个面向特定岗位的简历版本：

```bash
resumekit version create frontend-intern
```

使用 `modern` 模板导出 HTML 简历：

```bash
resumekit export frontend-intern --format html --template modern
```

导出 PDF 简历：

```bash
resumekit export frontend-intern --format pdf --template modern
```

PDF 导出会优先使用无头浏览器打印所选 HTML 模板。如果本机没有 Chrome、Edge 或 Chromium，则会回退到内置的简易 PDF 渲染器。

记录一次投递，并保存这次投递使用的简历版本：

```bash
resumekit apply add --company "Example Inc" --role "Frontend Intern" --version frontend-intern
```

查看投递状态摘要：

```bash
resumekit status
```

检查某个简历版本是否有缺失或薄弱内容：

```bash
resumekit validate frontend-intern
```

对比两个简历版本的差异：

```bash
resumekit diff base frontend-intern
```

## 工作区结构

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

## 示例场景

你可以先维护一份基础简历：

```bash
resumekit init
```

然后针对不同岗位创建版本：

```bash
resumekit version create frontend-intern
resumekit version create backend-java
resumekit version create english-version
```

每次投递时记录公司、岗位和使用的简历版本：

```bash
resumekit apply add --company "Example Inc" --role "Frontend Intern" --version frontend-intern
```

之后就能知道自己投了哪些岗位，以及每次用的是哪份简历。

## 路线图

- Markdown 编辑模式
- JD 关键词匹配
- 带实时预览的 Web UI
- 社区模板系统
- Git 集成
- 更完善的中文 PDF 导出

## 参与贡献

欢迎贡献。适合第一次参与的方向包括：

- 改进简历模板
- 增加校验规则
- 完善中文和英文文档
- 增加测试
- 改进 PDF 导出

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解本地开发和贡献方式。

## 许可证

MIT
