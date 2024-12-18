# MCPM CLI

[![npm version](https://img.shields.io/npm/v/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![npm downloads](https://img.shields.io/npm/dm/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![Build Status](https://github.com/MCP-Club/mcpm/actions/workflows/test.yml/badge.svg)](https://github.com/MCP-Club/mcpm/actions)
[![GitHub license](https://img.shields.io/github/license/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/issues)
[![GitHub stars](https://img.shields.io/github/stars/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/stargazers)

A command-line tool for managing MCP servers in Claude App.

## Highlights

- 🚀 **Easy Server Management**: Add, remove, and manage multiple MCP servers in Claude App with simple commands
- 🔄 **Server Status Control**: Enable/disable servers and view their status at any time
- 🛠️ **Interactive CLI**: User-friendly command-line interface with interactive prompts for easy configuration
- 🔌 **Self-Integration**: Can add MCPM CLI itself as a MCP server with a single command
- 📝 **JSON Configuration**: Manages servers through Claude's configuration file with proper error handling
<!-- - 🎯 **Zero Dependencies**: Lightweight and efficient, built to work seamlessly with Claude App -->

## TODO

- [ ] Add Remote MCP Discovery (A MCPHub for search and recommendation)
- [ ] Auto Install MCP Servers For you
- [ ] A GUI for MCPM CLI

## Installation

```bash
npm install -g @mcpm/cli
```

## Usage

```bash

> mcpm help

Usage: mcpm [options] [command]

Options:
  -V, --version         output the version number
  -d, --debug           enables verbose logging (default: false)
  -h, --help            display help for command

Commands:
  add [options] [name]  Add a new MCP server to your Claude App
  remove [name]         Remove a MCP server from your Claude App
  disable [name]        Disable an MCP server (moves it from Claude to storage)
  enable [name]         Enable a disabled MCP server (moves it from storage to Claude)
  list [options]        List all your MCP servers
  mcp                   Start the MCPM MCP server
  restart               Restart Claude.app
  help [command]        display help for command

```

### Disable an MCP server

Moves a server from Claude App to storage, making it temporarily unavailable.

```bash
mcpm disable               # Interactive mode
mcpm disable <name>        # Specify server name
```

### Enable an MCP server

Moves a previously disabled server from storage back to Claude App.

```bash
mcpm enable               # Interactive mode
mcpm enable <name>        # Specify server name
```

### List MCP servers

```bash
mcpm list            # Shows all configured MCP servers
```

## Configuration

- Active servers are stored in Claude App's configuration
- Disabled servers are stored in `~/.mcpm/*`

## Development

### Publish A new version

GitHub Actions will automatically publish a new version when a new tag is created

```bash
git tag v1.4.0
git push origin v1.4.0
```
