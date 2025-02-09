# MCPM CLI

[![npm version](https://img.shields.io/npm/v/@mcpm/cli.svg)](https://www.npmjs.com/package/@poai/mcpm-aider)
[![npm downloads](https://img.shields.io/npm/dm/@mcpm/cli.svg)](https://www.npmjs.com/package/@poai/mcpm-aider)
[![GitHub license](https://img.shields.io/github/license/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/issues)
[![GitHub stars](https://img.shields.io/github/stars/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/stargazers)

A command-line tool for managing MCP servers in Claude App.

## Extension for aider

[![YouTube Video](https://img.youtube.com/vi/OM1h4YDPjRU/maxresdefault.jpg)](https://www.youtube.com/watch?v=OM1h4YDPjRU)

This is a fork of [mcpm/cli](https://github.com/mcp-club/cli) with some additional features for use with aider.
Treat this as an experiment how to use MCP servers with aider without modifying aider source code UNTIL native MCP support will be available.

I added 2 new commands:

- `mcpm-aider call <tool> <function> '<parameters as jsonstring>'` - Call a function of a tool
- `mcpm-aider toolprompt` - Generate a tool prompt for Claude App

First you install some MCP servers:
```bash
mcpm-aider install @jsonallen/perplexity-mcp
```
This tool is originally written to maintain MCP servers for Claude App. So you need to ensure the claude config file is there.
Under Linux it is `~/.config/claude/claude.json`, under Windows it is `%APPDATA%\claude\claude.json`. (But consult Claude docs for this or install Claude Desktop App).

Most of the time you also need to install the dependencies of the MCP server (looking at the README of the MCP server). In this case:

```bash
# Ubuntu
pipx install perplexity-mcp
# Windows/MacOS
uv pip install perplexity-mcp
```

Inside of aider (you should not source the venv otherwise /run could not find uv, npm, ...) you can now run:

```bash
/run mcpm-aider toolprompt
```
This will attach a prompt about the available tools to you chat.

You can then use the registered tools like:
"Please ask perplexity about the sense of life"

The LLM will then call the tool and return the result with the help of `mcpm-aider call`.
**Hint**: Only in /code mode aider is auto-executing your terminal commands. This is handy in conjuction with aider `--yes`.


## Highlights (original contributor)

- 🚀 **Easy Server Management**: Add, remove, and manage multiple MCP servers in Claude App with simple commands
- 🔄 **Server Status Control**: Enable/disable servers and view their status at any time
- 🛠️ **Interactive CLI**: User-friendly command-line interface with interactive prompts for easy configuration
- 🔌 **Self-Integration**: Can add MCPM CLI itself as a MCP server with a single command
- 📝 **JSON Configuration**: Manages servers through Claude's configuration file with proper error handling
- 🔍 **Package Discovery**: Search and discover MCP packages from the community
<!-- - 🎯 **Zero Dependencies**: Lightweight and efficient, built to work seamlessly with Claude App -->

## Installation

```bash
npm install -g @poai/mcpm-aider
```

## Usage

```bash

> mcpm-aider help

Usage: mcpm-aider [options] [command]

Options:
  -V, --version         output the version number
  -d, --debug           enables verbose logging (default: false)
  -h, --help            display help for command

Commands:
  search [query]        Search for MCP packages
  install <n>           Install a MCP package from the registry
  add [options] [name]  Manually add a new MCP server to your Claude App
  remove [name]         Remove a MCP server from your Claude App
  disable [name]        Disable an MCP server (moves it from Claude to storage)
  enable [name]         Enable a disabled MCP server (moves it from storage to Claude)
  list [options]        List all your MCP servers
  mcp                   Start the MCPM MCP server
  restart               Restart Claude.app
  help [command]        display help for command
  toolprompt            Generate tool use prompt with all available MCP servers
  call [tool] [function] [parameters]  Call an MCP server tool function


```

### Search for MCP packages

Search for available MCP packages in the registry:

```bash
mcpm-aider search              # Interactive search mode
mcpm-aider search <query>      # Search with a specific query
mcpm-aider search --json       # Output results in JSON format
```

### Install a MCP package

Install a MCP package by its ID:

```bash
mcpm-aider install <package-id>     # Install a specific package
mcpm-aider i <package-id>          # Short alias for install
mcpm-aider install -y <package-id>  # Install without confirmation
```

### Remove a MCP server

Remove a MCP server from Claude App:

```bash
mmcpm-aidercpm remove                 # Interactive mode
mcpm-aider remove <name>          # Remove a specific server
mcpm-aider rm <name>              # Short alias for remove
```

### Disable an MCP server

Moves a server from Claude App to storage, making it temporarily unavailable.

```bash
mcpm-aider disable               # Interactive mode
mcpm-aider disable <name>        # Specify server name
```

### Enable an MCP server

Moves a previously disabled server from storage back to Claude App.

```bash
mcpm-aider enable               # Interactive mode
mcpm-aider enable <name>        # Specify server name
```

### List MCP servers

```bash
mcpm-aider list            # Shows all configured MCP servers
```

### Start As A MCP Server

```bash
mcpm-aider mcp               # Start MCPM as a MCP server
```

For more information, visit our [MCP.md](./docs/MCP.md).

### Add itself as a MCP server to your Claude App

```bash
mcpm-aider add --self          # Add MCPM CLI as a MCP server
```

## Configuration

- Active servers are stored in Claude App's configuration
- Disabled servers are stored in `~/.mcpm/*`

