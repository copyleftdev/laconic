# Contributing to Laconic

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/copyleftdev/laconic.git
cd laconic
cargo build
cargo test -p laconic-core
```

Requires Rust 1.75+.

## Making Changes

1. **Fork** the repo and create a branch from `main`
2. **Write tests** for any new functionality
3. **Run the test suite** before submitting: `cargo test -p laconic-core`
4. **Keep commits focused** — one logical change per commit
5. **Open a pull request** with a clear description of what changed and why

## What We're Looking For

- Bug fixes with regression tests
- New compression strategies (must be lossless on semantic content)
- Performance improvements with benchmarks
- Documentation improvements
- Integration examples (Python, Node, Go wrappers)

## Code Style

- Follow existing patterns — the codebase is intentionally minimal
- All regex patterns must be cached in `LazyLock<Regex>` statics
- New strategies go in `crates/laconic-core/src/strategies/`
- Every strategy must pass the idempotency invariant: `compress(compress(x)) == compress(x)`
- Every strategy must pass the no-inflation invariant: `compressed_tokens <= original_tokens`

## Reporting Bugs

Open an issue with:
- Input markdown that triggers the bug
- Expected output
- Actual output
- Laconic version (`laconic --version`)

## Questions?

Open a discussion or issue. We're happy to help.
