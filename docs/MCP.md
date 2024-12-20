# Model Context Protocol (MCP) Implementation

## Overview

The Model Context Protocol (MCP) implementation in MCPM CLI provides a robust framework for managing and interacting with MCP servers in Claude App (or any other host in the future). This document outlines the core components and functionality of our MCP implementation.

## Start MCP Server

```bash
mcpm mcp

# Or start without install globally
npx -y @mcpm/cli mcp
```

## Auto Install MCPM itself as a MCP server by cli

```bash
mcpm add --self
```

### Available Tools

The MCP implementation provides several built-in tools:

1. **add-mcp-server**
   - Purpose: Add a new MCP server to Claude App
   - Parameters:
     - name: Server name
     - config: Server configuration (command and arguments)

2. **remove-mcp-server**
   - Purpose: Remove an existing MCP server
   - Parameters:
     - name: Name of the server to remove

3. **enable-mcp-server**
   - Purpose: Enable a disabled server
   - Parameters:
     - name: Name of the server to enable

4. **disable-mcp-server**
   - Purpose: Disable an active server
   - Parameters:
     - name: Name of the server to disable

5. **list-mcp-servers**
   - Purpose: List all MCP servers

6. **restart-claude**
   - Purpose: Restart Claude App
