# MCPM CLI

[![npm version](https://img.shields.io/npm/v/@mcpm/cli.svg)](https://www.npmjs.com/package/@poai/mcpm-aider)
[![npm downloads](https://img.shields.io/npm/dm/@mcpm/cli.svg)](https://www.npmjs.com/package/@poai/mcpm-aider)
[![GitHub license](https://img.shields.io/github/license/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/issues)
[![GitHub stars](https://img.shields.io/github/stars/MCP-Club/mcpm.svg)](https://github.com/lutzleonhardt/mcpm-aider/stargazers)

A command-line tool for managing MCP servers in Claude App.

## Extension for aider

[![YouTube Video](https://img.youtube.com/vi/OM1h4YDPjRU/maxresdefault.jpg)](https://www.youtube.com/watch?v=OM1h4YDPjRU)
[YouTube Explanation](https://www.youtube.com/watch?v=OM1h4YDPjRU)

This is a fork of [mcpm/cli](https://github.com/mcp-club/cli) with additional features for use with aider.
Treat this as an experiment on how to use MCP servers with aider without modifying aider source code UNTIL native MCP support becomes available.

There are three main components to using MCPM with aider:

1. MCP Server Management - Install and configure your MCP servers
2. Using MCP with Aider via Toolprompt - The original method using prompt-based tool descriptions
3. Using MCP with Aider via Bridge Service - A more integrated approach using an OpenAI-compatible proxy

## 1. MCP Server Management

First, you need to install and manage your MCP servers:

```bash
mcpm-aider install @jsonallen/perplexity-mcp
```

This tool is originally written to maintain MCP servers for Claude App. You need to ensure the Claude config file is in the correct path:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`
- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Boiler plate:
```json
{
  "mcpServers": {
  }
}
```

Consult Claude docs or install Claude Desktop App if you encounter any issues.

Most of the time you also need to install the dependencies of the MCP server (check the README of the MCP server). For example:

```bash
# Ubuntu
pipx install perplexity-mcp
# Windows/MacOS
uv pip install perplexity-mcp
```

## 2. Using MCP with Aider via Toolprompt

Once you have your MCP servers installed, you can use the toolprompt method to integrate them with aider:

```bash
/run mcpm-aider toolprompt
```

This will generate a prompt describing all available tools and attach it to your chat. 

You can then use the tools directly in your prompts, for example:
"Please ask perplexity about the sense of life"

The LLM will parse this request and execute the appropriate tool call using `mcpm-aider call`.

**Hint**: Only in /code mode aider auto-executes your terminal commands. This is handy in conjunction with aider `--yes`.

## 3. Using MCP with Aider via Bridge Service

A more elegant approach is to use the new MCP-Bridge, which creates an OpenAI-compatible proxy that handles tool calls:

```bash
/run mcpm-aider start-bridge
```

This starts a local Python service that:
1. Automatically syncs Python dependencies using UV
2. Creates an OpenAI-compatible API endpoint on port 8000
3. Handles tool calls directly without needing to generate tool prompts
4. Returns results back to the AI assistant

**Requirements:** The MCP-Bridge requires UV package manager to be installed on your system. If UV is not detected, instructions for installation will be shown.

### Configuration

The bridge service can use different inference servers by providing the `--server` option:

```bash
/run mcpm-aider start-bridge --server https://api.openai.com/v1/
```

The proxy uses the API key it receives from the caller as a header, so you don't need to set up API keys in MCPM. This allows you to keep using your existing API keys while benefiting from MCP tool functionality.

### Example Configurations for Aider

#### 1. OpenAI o3-mini

Inference URL: https://api.openai.com/v1/

Configure in `~/.aider.model.settings.yml`:
```yml
- name: o3-mini
  extra_params:
    api_key: this-key-is-used-by-the-bridge
    api_base: http://localhost:8000/v1/
```

Start aider with: `aider --model o3-mini`

#### 2. Anthropic Claude 3.5 Sonnet (OpenAI-compatible endpoint)

Inference URL: https://api.anthropic.com/v1/ (default if omitted)

Configure in `~/.aider.model.settings.yml`:
```yml
- name: anthropic/claude-3-5-sonnet-latest
  streaming: false
  extra_params:
    max_tokens: 8192
    model: openai/claude-3-5-sonnet-latest
    api_key: this-key-is-used-by-the-bridge
    api_base: http://localhost:8000/v1/
```

Start aider with: `aider --model anthropic/claude-3-5-sonnet-latest`

**Note**: Streaming needs to be set to `false` currently due to a bug in the Anthropic OpenAI-compatible beta API.

### Important: Activating Tool Usage with #use-tools

By default, tools are NOT automatically used to reduce noise when you don't need them. To enable tool usage in your current LLM request, include the tag `#use-tools` in your message.

For example:
```
Hey Claude, can you search for recent news about AI? #use-tools
```

When tools are used, you can see the tool calls and their results in the terminal where the bridge is running. If you're experiencing issues with tool execution, check this terminal for error messages.

### Security Considerations

The bridge service runs locally on your machine on port 8000. While it requires API keys to use, exercise caution when running on shared networks. The bridge will forward your API key to the selected inference server.

### Multiple Bridge Instances

If you need to run multiple bridge instances simultaneously (for different inference servers), you'll need to modify the port for additional instances to avoid conflicts.

### Credits

The MCP-Bridge is based on the work from [SecretiveShell/MCP-Bridge](https://github.com/SecretiveShell/MCP-Bridge) with extensions to support additional servers like Anthropic's beta OpenAI-compatible endpoints. If you find this useful, please consider giving the original project a ⭐ on GitHub!


## Highlights

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
  call <tool> <function> '<parameters>'  Call an MCP server tool function
  start-bridge [options] Start the MCP-Bridge Python service
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

### Use the Toolprompt Method

Generate a tool prompt for use with aider:

```bash
mcpm-aider toolprompt       # Generate tool prompt with all available MCP servers
```

### Use the Bridge Service

Start the MCP-Bridge service for a more integrated experience:

```bash
mcpm-aider start-bridge     # Start the MCP-Bridge with default settings
mcpm-aider start-bridge --server https://custom-api-url/  # Use a custom API server
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
- The MCP-Bridge requires UV package manager to be installed on your system

