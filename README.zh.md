# MCPM CLI

[![npm version](https://img.shields.io/npm/v/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![npm downloads](https://img.shields.io/npm/dm/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![Build Status](https://github.com/MCP-Club/mcpm/actions/workflows/test.yml/badge.svg)](https://github.com/MCP-Club/mcpm/actions)
[![GitHub license](https://img.shields.io/github/license/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/issues)
[![GitHub stars](https://img.shields.io/github/stars/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/stargazers)

Claude App 的 MCP 服务器管理命令行工具。

[English](./README.md) | 简体中文

## 特性

- 🚀 **便捷服务器管理**：通过简单的命令在 Claude App 中添加、删除和管理多个 MCP 服务器
- 🔄 **服务器状态控制**：随时启用/禁用服务器并查看其状态
- 🛠️ **交互式命令行**：用户友好的命令行界面，提供交互式提示以便于配置
- 🔌 **自集成**：只需一条命令即可将 MCPM CLI 本身添加为 MCP 服务器
- 📝 **JSON 配置**：通过 Claude 的配置文件管理服务器，并提供适当的错误处理
- 🔍 **包发现**：搜索和发现社区的 MCP 包

## 待办事项

- [x] 添加远程 MCP 发现功能（用于搜索和推荐的 MCPHub）
- [x] 自动安装 MCP 服务器
- [ ] MCPM CLI 的图形用户界面

## 安装

```bash
npm install -g @mcpm/cli
```

## 使用方法

```bash
> mcpm help

用法: mcpm [选项] [命令]

选项:
  -V, --version         输出版本号
  -d, --debug          启用详细日志记录（默认：false）
  -h, --help           显示帮助信息

命令:
  search [query]        搜索 MCP 包
  install <n>          从注册表安装 MCP 包
  add [选项] [名称]     手动添加新的 MCP 服务器到 Claude App
  remove [名称]         从 Claude App 移除 MCP 服务器
  disable [名称]        禁用 MCP 服务器（将其从 Claude 移动到存储）
  enable [名称]         启用已禁用的 MCP 服务器（将其从存储移动到 Claude）
  list [选项]          列出所有 MCP 服务器
  mcp                  启动 MCPM MCP 服务器
  restart              重启 Claude.app
  help [命令]          显示命令帮助
```

### 搜索 MCP 包

在注册表中搜索可用的 MCP 包：

```bash
mcpm search              # 交互式搜索模式
mcpm search <查询词>      # 使用特定查询词搜索
mcpm search --json       # 以 JSON 格式输出结果
```

### 安装 MCP 包

通过包 ID 安装 MCP 包：

```bash
mcpm install <包ID>      # 安装特定包
mcpm install -y <包ID>   # 无需确认直接安装
```

### 禁用 MCP 服务器

将服务器从 Claude App 移动到存储，使其暂时不可用：

```bash
mcpm disable            # 交互式模式
mcpm disable <名称>     # 指定服务器名称
```

### 启用 MCP 服务器

将之前禁用的服务器从存储移回 Claude App：

```bash
mcpm enable             # 交互式模式
mcpm enable <名称>      # 指定服务器名称
```

### 列出 MCP 服务器

```bash
mcpm list              # 显示所有已配置的 MCP 服务器
```

### 作为 MCP 服务器启动

```bash
mcpm mcp               # 将 MCPM 作为 MCP 服务器启动
```

### 将自身添加为 MCP 服务器

```bash
mcpm add --self        # 将 MCPM CLI 添加为 MCP 服务器
```

更多信息，请访问 [MCP.md](./docs/MCP.md)。

## 配置

- 活动服务器存储在 Claude App 的配置中
- 禁用的服务器存储在 `~/.mcpm/*` 中

## 开发

请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。
