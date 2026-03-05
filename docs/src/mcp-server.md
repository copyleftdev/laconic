# MCP Server

Laconic ships as a Model Context Protocol (MCP) server that any MCP-compatible agent can call directly. The agent decides when compression is worth it; Laconic provides the tools.

## Setup

Build the MCP server binary:

```bash
cargo build --release --bin laconic-mcp
cp target/release/laconic-mcp /usr/local/bin/
```

## Agent Configuration

Add this to your MCP client config (Windsurf, Cursor, Claude Desktop, or any MCP-compatible agent):

```json
{
  "mcpServers": {
    "laconic": {
      "command": "laconic-mcp",
      "args": []
    }
  }
}
```

The server communicates over **stdio** — no ports, no HTTP, no configuration.

## Available Tools

### `compress_markdown`

Compresses a markdown string and returns the result with token statistics.

**Input:**

```json
{
  "markdown": "# Title\n\n[![Badge](https://img.shields.io/...)]\n\n| Col | Col |\n|---|---|\n| A | B |"
}
```

**Output:**

```json
{
  "text": "# Title\n\nCol,Col\nA,B",
  "original_tokens": 45,
  "compressed_tokens": 12,
  "tokens_saved": 33,
  "savings_pct": 73.3
}
```

### `estimate_savings`

Returns token statistics and a recommendation without the compressed text. Useful for agents that want to decide whether compression is worthwhile before committing.

**Input:**

```json
{
  "markdown": "Some markdown content..."
}
```

**Output:**

```json
{
  "original_tokens": 500,
  "compressed_tokens": 420,
  "tokens_saved": 80,
  "savings_pct": 16.0,
  "recommendation": "Compress — 16% savings available."
}
```

## Typical Agent Workflow

1. Agent retrieves a document for context injection
2. Agent calls `estimate_savings` to check if compression is worthwhile
3. If savings exceed a threshold (e.g., 5%), agent calls `compress_markdown`
4. Agent uses the compressed text in its prompt

This keeps the agent in control of the cost/benefit tradeoff.

## Testing the Server

You can test the MCP server manually by piping JSON-RPC messages:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | laconic-mcp
```

This returns the list of available tools and their schemas.
