# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email **don@codetestcode.io** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. You will receive a response within 48 hours
4. A fix will be developed privately and released as a patch

## Scope

Laconic processes untrusted markdown input. Security-relevant areas include:

- **Regex denial of service (ReDoS)** — All regex patterns are pre-compiled and cached. Pathological input should not cause excessive backtracking.
- **Memory exhaustion** — Large inputs are processed in-memory. The streaming API (`compress_reader`) mitigates this for pipeline use.
- **No network access** — The core library and CLI make no network connections. The MCP server communicates only over stdio.

## Disclosure Policy

We follow coordinated disclosure. Fixes will be released before public disclosure of the vulnerability.
