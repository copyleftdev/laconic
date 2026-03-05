# Installation

## From Source (Recommended)

Requires [Rust 1.75+](https://rustup.rs/).

```bash
git clone https://github.com/copyleftdev/laconic.git
cd laconic
cargo build --release
```

The binaries land in `target/release/`:

| Binary | Size | Purpose |
| --- | --- | --- |
| `laconic` | ~5.6 MB | CLI tool |
| `laconic-mcp` | ~8.2 MB | MCP server for agents |

## Add to PATH

```bash
# Copy to a directory in your PATH
cp target/release/laconic /usr/local/bin/
cp target/release/laconic-mcp /usr/local/bin/

# Verify
laconic --version
```

## Verify Installation

```bash
# Compress a file and see the stats
echo "# Hello World" | laconic compress -

# Should output the compressed text to stdout
# and stats to stderr
```

## Shell Completions

Laconic uses `clap`, so you can generate shell completions:

```bash
# Bash
laconic compress --help

# The CLI supports standard POSIX conventions:
#   -j  for --json
#   -f  for --fast
#   -   for stdin
#   --  to end option parsing
```
