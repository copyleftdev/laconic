## What Changed

<!-- Brief description of the change -->

## Why

<!-- Motivation: bug fix, new feature, performance, docs, etc. -->

## Testing

- [ ] `cargo test -p laconic-core` passes
- [ ] New tests added for new functionality
- [ ] No token inflation on any test input
- [ ] Idempotency holds: `compress(compress(x)) == compress(x)`

## Checklist

- [ ] Code follows existing style
- [ ] Commit messages are descriptive
- [ ] Documentation updated (if applicable)
- [ ] No new dependencies added (or justified if so)
