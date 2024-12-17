# MCPM CLI

A command-line tool for managing MCP servers in Claude App.

## Installation

```bash
npm install -g mcpm-cli
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

## License

MIT 

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

[npm-img]: https://img.shields.io/npm/v/mcpm-cli
[npm-url]: https://www.npmjs.com/package/mcpm-cli
[build-img]: https://github.com/weightwave/mcpm-cli/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/weightwave/mcpm-cli/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/mcpm-cli
[downloads-url]: https://www.npmjs.com/package/mcpm-cli
[issues-img]: https://img.shields.io/github/issues/weightwave/mcpm-cli
[issues-url]: https://github.com/weightwave/mcpm-cli/issues
[codecov-img]: https://codecov.io/gh/weightwave/mcpm-cli/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/weightwave/mcpm-cli
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
