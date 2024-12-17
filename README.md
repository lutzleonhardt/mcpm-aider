# MCPM CLI

[![npm version](https://img.shields.io/npm/v/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![npm downloads](https://img.shields.io/npm/dm/@mcpm/cli.svg)](https://www.npmjs.com/package/@mcpm/cli)
[![Build Status](https://github.com/MCP-Club/mcpm/actions/workflows/test.yml/badge.svg)](https://github.com/MCP-Club/mcpm/actions)
[![GitHub license](https://img.shields.io/github/license/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/issues)
[![GitHub stars](https://img.shields.io/github/stars/MCP-Club/mcpm.svg)](https://github.com/MCP-Club/mcpm/stargazers)

A command-line tool for managing MCP servers in Claude App.

## Installation

```bash
npm install -g @mcpm/cli
```

## Usage

### Add a new MCP server

```bash
mcpm add                    # Interactive mode
mcpm add <name>            # Specify server name
```

### Remove an MCP server

```bash
mcpm remove                # Interactive mode
mcpm remove <name>         # Specify server name
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
mcpm host scan            # Shows all configured MCP servers
```

## Configuration

- Active servers are stored in Claude App's configuration
- Disabled servers are stored in `~/.mcpm/config.json`
