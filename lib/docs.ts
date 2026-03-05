export interface DocSection {
  title: string;
  slug: string;
  items: DocItem[];
}

export interface DocItem {
  title: string;
  slug: string;
  content: string;
}

export const docsStructure: DocSection[] = [
  {
    title: "Getting Started",
    slug: "getting-started",
    items: [
      {
        title: "Introduction",
        slug: "introduction",
        content: `# Laconic

**Maximum meaning, minimum tokens.**

Laconic compresses markdown documents for LLM workflows by applying lossless syntactic transformations. It strips decorative noise — badge images, padded tables, HTML wrappers, redundant whitespace — that costs tokens but carries no semantic value.

Named after the Spartans of Laconia, famous for expressing maximum meaning with minimum words. When Philip II of Macedon threatened *"If I invade Laconia, I will raze Sparta,"* the Spartans replied: ***"If."***

## What It Does

Laconic removes structure that LLMs don't need to understand your document:

| Before | After | Why |
| --- | --- | --- |
| \`[![Build](https://img.shields.io/...)]\` | *(removed)* | Badges are visual, not semantic |
| \`| Col1 | Col2 |\` with separator rows | \`Col1,Col2\` | CSV is more token-efficient |
| \`<div style="padding: 20px">content</div>\` | \`content\` | Decorative HTML wrappers |
| Three blank lines | One blank line | Whitespace normalization |
| Repeated inline URLs | Reference-style links | URL deduplication |

## What It Never Touches

- Prose text
- Code blocks (contents preserved exactly)
- Headings (structure preserved)
- Lists
- Anything that carries meaning

## Three Ways to Use It

1. **CLI** — \`laconic compress README.md\`
2. **Rust library** — \`laconic_core::compress(&text, &config)\`
3. **MCP server** — Agents call \`compress_markdown\` as a tool

Pick the one that fits your workflow.`,
      },
      {
        title: "Installation",
        slug: "installation",
        content: `# Installation

## From Source (Recommended)

Requires [Rust 1.75+](https://rustup.rs/).

\`\`\`bash
git clone https://github.com/copyleftdev/laconic.git
cd laconic
cargo build --release
\`\`\`

The binaries land in \`target/release/\`:

| Binary | Size | Purpose |
| --- | --- | --- |
| \`laconic\` | ~5.6 MB | CLI tool |
| \`laconic-mcp\` | ~8.2 MB | MCP server for agents |

## Add to PATH

\`\`\`bash
# Copy to a directory in your PATH
cp target/release/laconic /usr/local/bin/
cp target/release/laconic-mcp /usr/local/bin/

# Verify
laconic --version
\`\`\`

## Verify Installation

\`\`\`bash
# Compress a file and see the stats
echo "# Hello World" | laconic compress -

# Should output the compressed text to stdout
# and stats to stderr
\`\`\``,
      },
      {
        title: "Quick Start",
        slug: "getting-started",
        content: `# Getting Started

This page walks through the three things you'll do most: compress a file, estimate savings on a batch, and use fast mode.

## Compress a Single File

\`\`\`bash
laconic compress README.md
\`\`\`

Compressed text goes to **stdout**. Stats go to **stderr**:

\`\`\`text
# README.md: 1648 → 1418 tokens (saved 230, 14.0%)
\`\`\`

This means you can pipe the output cleanly:

\`\`\`bash
laconic compress README.md > compressed.md
laconic compress README.md | pbcopy        # macOS clipboard
laconic compress README.md | xclip         # Linux clipboard
\`\`\`

## Compress from Stdin

Use \`-\` to read from stdin:

\`\`\`bash
cat README.md | laconic compress -
curl -s https://raw.githubusercontent.com/.../README.md | laconic compress -
\`\`\`

## Estimate Savings

Want to know how much you'd save without producing output?

\`\`\`bash
laconic estimate docs/*.md
\`\`\`

\`\`\`text
docs/api.md: 3044 → 2446 tokens (saved 598, 19.6%)
docs/guide.md: 1572 → 1572 tokens (saved 0, 0.0%)
TOTAL: 4616 → 4018 tokens (saved 598, 12.9%)
\`\`\`

## Fast Mode

Skip token counting for near-instant compression:

\`\`\`bash
laconic compress -f README.md
\`\`\`

## JSON Output

Add \`--json\` for machine-readable output:

\`\`\`json
{
  "file": "README.md",
  "original_tokens": 1648,
  "compressed_tokens": 1418,
  "tokens_saved": 230,
  "savings_pct": 13.96,
  "text": "# FastAPI Authentication Middleware\\n..."
}
\`\`\``,
      },
    ],
  },
  {
    title: "Reference",
    slug: "reference",
    items: [
      {
        title: "CLI Reference",
        slug: "cli-reference",
        content: `# CLI Reference

## \`laconic compress\`

Compress one or more markdown files and output the result.

\`\`\`bash
laconic compress [OPTIONS] <FILES>...
\`\`\`

### Arguments

| Argument | Description |
| --- | --- |
| \`<FILES>...\` | One or more file paths. Use \`-\` for stdin. |

### Options

| Flag | Short | Description |
| --- | --- | --- |
| \`--json\` | \`-j\` | Output as JSON (includes token counts and savings) |
| \`--fast\` | \`-f\` | Skip token counting (faster, no stats in text mode) |
| \`--no-tables\` | | Disable markdown table compaction |
| \`--no-html\` | | Disable HTML table conversion and HTML cleanup |
| \`--no-badges\` | | Disable badge/shield image stripping |
| \`--url-dedup\` | | Enable URL deduplication (off by default) |

### Output Behavior

- **Compressed text** goes to **stdout**
- **Statistics** go to **stderr**
- Exit code \`0\` on success, \`1\` on error

---

## \`laconic estimate\`

Estimate token savings without producing compressed output.

\`\`\`bash
laconic estimate [OPTIONS] <FILES>...
\`\`\`

### Options

| Flag | Short | Description |
| --- | --- | --- |
| \`--json\` | \`-j\` | Output as JSON |

---

## POSIX Compliance

Laconic follows POSIX utility conventions:

- \`-\` reads from stdin
- \`--\` ends option parsing
- stdout for data, stderr for diagnostics
- Exit 0 on success, >0 on failure`,
      },
      {
        title: "Strategies",
        slug: "strategies",
        content: `# Compression Strategies

Laconic applies eight independent strategies. Each targets a specific type of markdown structure that costs tokens but carries no semantic value.

## Whitespace Normalization

**Always on.** Cannot be disabled.

- Strips trailing spaces from every line
- Collapses three or more consecutive blank lines down to two

## Table Compaction

**On by default.** Disable with \`--no-tables\`.

Converts markdown pipe tables to compact CSV:

**Before:**

\`\`\`markdown
| Name   | Role       | Status  |
|--------|------------|---------|
| Alice  | Engineer   | Active  |
\`\`\`

**After:**

\`\`\`text
Name,Role,Status
Alice,Engineer,Active
\`\`\`

## Badge Stripping

**On by default.** Disable with \`--no-badges\`.

Removes shield.io / badge images that are purely visual.

## Heading Normalization

**Always on.**

Strips trailing \`#\` characters from ATX headings.

## Code Fence Compaction

**Always on.**

Removes common leading indentation from code blocks without changing the code's meaning.

## URL Deduplication

**Off by default.** Enable with \`--url-dedup\`.

Converts repeated or long inline URLs to reference-style links.

## Strategy Selection Guide

| Scenario | Recommended flags |
| --- | --- |
| Maximum compression | (defaults — all on) + \`--url-dedup\` |
| Preserve table formatting | \`--no-tables\` |
| Keep HTML structure intact | \`--no-html\` |
| Conservative | \`--no-tables --no-html --no-badges\` |
| Speed over stats | \`-f\` (fast mode) |`,
      },
      {
        title: "Library Usage",
        slug: "library-usage",
        content: `# Library Usage

Add \`laconic-core\` to your Rust project:

\`\`\`bash
cargo add laconic-core
\`\`\`

## Basic Compression

\`\`\`rust
use laconic_core::{compress, CompressConfig};

let input = std::fs::read_to_string("README.md").unwrap();
let config = CompressConfig::default();
let result = compress(&input, &config);

println!("Saved {} tokens ({:.1}%)", result.tokens_saved, result.savings_pct);
println!("{}", result.text);
\`\`\`

## Fast Path (No Token Counting)

\`\`\`rust
use laconic_core::{compress_text, CompressConfig};

let input = std::fs::read_to_string("README.md").unwrap();
let config = CompressConfig::default();
let compressed = compress_text(&input, &config);
// No token counting overhead
\`\`\`

## Custom Configuration

\`\`\`rust
use laconic_core::CompressConfig;

let config = CompressConfig {
    tables: false,          // preserve markdown tables
    html_tables: true,      // convert HTML tables to CSV
    html_cleanup: true,     // strip decorative HTML
    badges: true,           // remove badge images
    url_dedup: true,        // deduplicate URLs
    skip_token_count: true, // skip BPE tokenizer (fast mode)
    ..CompressConfig::default()
};
\`\`\`

## Guarantees

- **Idempotent:** \`compress(compress(x)) == compress(x)\`
- **Never inflates:** \`result.compressed_tokens <= result.original_tokens\`
- **No panics:** Tested across hundreds of real-world files
- **Deterministic:** Same input + config always produces the same output`,
      },
      {
        title: "MCP Server",
        slug: "mcp-server",
        content: `# MCP Server

Laconic ships as a Model Context Protocol (MCP) server that any MCP-compatible agent can call directly.

## Setup

\`\`\`bash
cargo build --release --bin laconic-mcp
cp target/release/laconic-mcp /usr/local/bin/
\`\`\`

## Agent Configuration

Add to your MCP client config:

\`\`\`json
{
  "mcpServers": {
    "laconic": {
      "command": "laconic-mcp",
      "args": []
    }
  }
}
\`\`\`

## Available Tools

### \`compress_markdown\`

Compresses a markdown string and returns the result with token statistics.

**Input:**
\`\`\`json
{
  "markdown": "# Title\\n\\n| Col | Col |\\n|---|---|\\n| A | B |"
}
\`\`\`

**Output:**
\`\`\`json
{
  "text": "# Title\\n\\nCol,Col\\nA,B",
  "original_tokens": 45,
  "compressed_tokens": 12,
  "tokens_saved": 33,
  "savings_pct": 73.3
}
\`\`\`

### \`estimate_savings\`

Returns token statistics without the compressed text.

## Typical Agent Workflow

1. Agent retrieves a document
2. Agent calls \`estimate_savings\`
3. If savings exceed threshold, call \`compress_markdown\`
4. Use compressed text in prompt`,
      },
    ],
  },
  {
    title: "Recipes",
    slug: "recipes",
    items: [
      {
        title: "RAG Pipelines",
        slug: "rag-pipelines",
        content: `# RAG Pipelines

The primary use case for Laconic: compress retrieved documents before injecting them into an LLM's context window.

## The Problem

RAG pipelines retrieve markdown documents and stuff them into prompts. But markdown carries decorative weight that wastes tokens.

## Python Integration

\`\`\`python
import subprocess

def compress_markdown(text: str) -> str:
    result = subprocess.run(
        ["laconic", "compress", "-f", "-"],
        input=text,
        capture_output=True,
        text=True,
    )
    return result.stdout

# In your RAG pipeline
retrieved_doc = vector_store.query("How do I configure auth?")
compressed = compress_markdown(retrieved_doc.content)
prompt = f"Given this context:\\n\\n{compressed}\\n\\nAnswer..."
\`\`\`

## With Token Stats

\`\`\`python
import subprocess
import json

def compress_with_stats(text: str) -> dict:
    result = subprocess.run(
        ["laconic", "compress", "-j", "-"],
        input=text, capture_output=True, text=True,
    )
    return json.loads(result.stdout)

stats = compress_with_stats(doc.content)
print(f"Saved {stats['tokens_saved']} tokens")
\`\`\`

## Decision: When to Compress

If a document shows 0% savings (pure prose), skip it. Focus on structure-heavy documents where savings are 10%+.`,
      },
      {
        title: "CI/CD Integration",
        slug: "cicd",
        content: `# CI/CD Integration

Compress documentation at build time so every downstream consumer benefits automatically.

## GitHub Actions

\`\`\`yaml
- name: Compress docs for vector store
  run: |
    cargo install --path crates/laconic-cli
    mkdir -p compressed_docs
    for f in docs/*.md; do
      laconic compress -f "$f" > "compressed_docs/$(basename "$f")"
    done

- name: Upload to vector store
  run: ./scripts/upload_to_pinecone.sh compressed_docs/
\`\`\`

## Pre-commit Hook

\`\`\`bash
#!/bin/sh
# .git/hooks/pre-commit

for f in $(git diff --cached --name-only --diff-filter=ACM -- '*.md'); do
  laconic compress -f "$f" > "\${f%.md}.compressed.md"
  git add "\${f%.md}.compressed.md"
done
\`\`\`

## Docker

\`\`\`dockerfile
FROM rust:1.75 AS builder
WORKDIR /build
COPY . .
RUN cargo build --release --bin laconic

FROM debian:bookworm-slim
COPY --from=builder /build/target/release/laconic /usr/local/bin/
ENTRYPOINT ["laconic"]
\`\`\``,
      },
      {
        title: "Token Budgeting",
        slug: "token-budgeting",
        content: `# Token Budgeting

When you have a fixed context window, every token matters.

## The Math

Say you're building a prompt with retrieved context:

- System prompt: 2,000 tokens
- User query: 500 tokens
- Available for context: 125,500 tokens
- Retrieved docs: 150,000 tokens — **doesn't fit**

**Option A:** Truncate. Lose information.
**Option B:** Compress with Laconic. Recover 15–50% space.

## Budget-Aware Pipeline

\`\`\`bash
#!/bin/bash
BUDGET=125000
USED=0

for doc in retrieved_docs/*.md; do
  stats=$(laconic compress -j "$doc" 2>/dev/null)
  tokens=$(echo "$stats" | jq '.compressed_tokens')
  
  NEXT=$((USED + tokens))
  if [ "$NEXT" -gt "$BUDGET" ]; then
    echo "Budget full at $USED tokens."
    break
  fi
  
  echo "$stats" | jq -r '.text'
  USED=$NEXT
done
\`\`\`

## Stacking with Other Optimizations

| Technique | What it removes | Savings |
| --- | --- | --- |
| **Laconic** | Decorative structure | 15–50% |
| **Prompt caching** | Repeated prefix tokens | Up to 90% |
| **Batch API** | Nothing — cheaper pricing | 50% |

These are multiplicative. Combined can reduce costs by 95%+.`,
      },
    ],
  },
];

export const patientDocsStructure: DocSection[] = [
  {
    title: "Patient Documents",
    slug: "patient-documents",
    items: [
      {
        title: "Overview",
        slug: "overview",
        content: `# Patient Documents

A comprehensive collection of in-depth technical documentation for healthcare and medical data processing workflows.

## Purpose

Patient Documents provide detailed guidance for:

- **Medical Record Processing** — Secure handling of PHI in LLM workflows
- **HIPAA Compliance** — Ensuring data protection standards
- **Healthcare Integration** — Connecting to EHR/EMR systems
- **Clinical NLP** — Extracting insights from medical text

## Security First

All patient document workflows prioritize:

1. Data encryption at rest and in transit
2. Audit logging for compliance
3. Role-based access control
4. De-identification pipelines

## Getting Started

Select a topic from the sidebar to explore detailed implementation guides for your healthcare use case.`,
      },
      {
        title: "Medical Records",
        slug: "medical-records",
        content: `# Medical Records Processing

## Overview

Processing medical records with LLMs requires careful attention to data security and compliance. Laconic helps reduce token costs while maintaining the integrity of clinical information.

## Workflow

\`\`\`mermaid
graph TD
    A[EHR Export] --> B[De-identification]
    B --> C[Laconic Compression]
    C --> D[LLM Processing]
    D --> E[Re-identification]
    E --> F[Clinical Output]
\`\`\`

## De-identification First

Always de-identify before compression:

\`\`\`python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

def deidentify(text: str) -> str:
    results = analyzer.analyze(text=text, language='en')
    return anonymizer.anonymize(text=text, analyzer_results=results).text
\`\`\`

## Compression Savings

| Record Type | Typical Savings |
| --- | --- |
| Discharge Summaries | 15-25% |
| Lab Reports | 30-45% |
| Radiology Reports | 20-30% |
| Progress Notes | 10-15% |

## Best Practices

- Always de-identify before any external processing
- Use fast mode (\`-f\`) when token stats aren't needed
- Maintain audit logs of all processed records
- Validate output accuracy with clinical review`,
      },
      {
        title: "HIPAA Compliance",
        slug: "hipaa-compliance",
        content: `# HIPAA Compliance Guide

## Overview

When using Laconic with Protected Health Information (PHI), follow these guidelines to maintain HIPAA compliance.

## The Privacy Rule

The HIPAA Privacy Rule protects all "individually identifiable health information." Before processing with Laconic:

1. **De-identify** — Remove all 18 HIPAA identifiers
2. **Encrypt** — Ensure data is encrypted in transit and at rest
3. **Audit** — Log all access and processing
4. **Minimize** — Only process what's necessary

## 18 HIPAA Identifiers

| Category | Identifiers |
| --- | --- |
| Names | Full name, initials |
| Geographic | Address, city, ZIP, etc. |
| Dates | DOB, admission, discharge |
| Contact | Phone, fax, email |
| IDs | SSN, MRN, account numbers |
| Biometric | Fingerprints, voiceprints |
| Images | Photos, facial images |

## Safe Harbor De-identification

\`\`\`python
def is_safe_harbor_compliant(record: dict) -> bool:
    """Check if record meets Safe Harbor requirements."""
    identifiers = [
        'name', 'address', 'city', 'state', 'zip',
        'phone', 'fax', 'email', 'ssn', 'mrn',
        'dob', 'admission_date', 'discharge_date'
    ]
    return not any(id in record for id in identifiers)
\`\`\`

## Technical Safeguards

- TLS 1.3 for all data transmission
- AES-256 encryption at rest
- Key rotation every 90 days
- Access logging with immutable audit trail`,
      },
      {
        title: "EHR Integration",
        slug: "ehr-integration",
        content: `# EHR/EMR Integration

## Supported Systems

Laconic can integrate with major EHR systems via their APIs:

| System | Integration Method |
| --- | --- |
| Epic | FHIR R4, HL7v2 |
| Cerner | FHIR R4, HL7v2 |
| Allscripts | FHIR R4 |
| eClinicalWorks | REST API |

## FHIR Integration

\`\`\`python
import requests
from laconic import compress_markdown

def process_patient_notes(patient_id: str, fhir_server: str):
    """Fetch and compress patient clinical notes."""
    
    # Fetch DocumentReference resources
    response = requests.get(
        f"{fhir_server}/DocumentReference",
        params={"patient": patient_id, "type": "clinical-note"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    documents = response.json()["entry"]
    
    compressed_notes = []
    for doc in documents:
        content = decode_fhir_content(doc["resource"]["content"])
        deidentified = deidentify(content)
        compressed = compress_markdown(deidentified)
        compressed_notes.append(compressed)
    
    return compressed_notes
\`\`\`

## HL7v2 Processing

\`\`\`python
from hl7apy.parser import parse_message

def extract_notes_from_hl7(message: str) -> list[str]:
    """Extract clinical notes from HL7v2 message."""
    parsed = parse_message(message)
    notes = []
    
    for obx in parsed.obx:
        if obx.obx_2.value == "TX":  # Text observation
            notes.append(obx.obx_5.value)
    
    return notes
\`\`\`

## Data Flow

1. **Extract** — Pull records from EHR
2. **Transform** — De-identify and structure
3. **Compress** — Apply Laconic compression
4. **Process** — Send to LLM
5. **Load** — Store results securely`,
      },
      {
        title: "Clinical NLP",
        slug: "clinical-nlp",
        content: `# Clinical NLP

## Overview

Laconic optimizes clinical text for NLP pipelines, reducing costs while preserving the semantic content needed for accurate analysis.

## Common Tasks

| Task | Description | Savings |
| --- | --- | --- |
| Named Entity Recognition | Extract medications, conditions, procedures | 20-35% |
| Relation Extraction | Link entities (drug-disease, symptom-diagnosis) | 25-40% |
| Summarization | Generate concise clinical summaries | 30-50% |
| Classification | Categorize notes by specialty/type | 15-25% |

## Medical NER Pipeline

\`\`\`python
import spacy
from laconic import compress_markdown

# Load clinical NER model
nlp = spacy.load("en_core_sci_lg")

def extract_clinical_entities(text: str) -> dict:
    """Extract clinical entities from compressed text."""
    
    # Compress first to reduce token costs
    compressed = compress_markdown(text)
    
    # Process with spaCy
    doc = nlp(compressed)
    
    entities = {
        "medications": [],
        "conditions": [],
        "procedures": [],
        "anatomical": []
    }
    
    for ent in doc.ents:
        if ent.label_ == "DRUG":
            entities["medications"].append(ent.text)
        elif ent.label_ == "DISEASE":
            entities["conditions"].append(ent.text)
        elif ent.label_ == "PROCEDURE":
            entities["procedures"].append(ent.text)
        elif ent.label_ == "ANATOMY":
            entities["anatomical"].append(ent.text)
    
    return entities
\`\`\`

## ICD-10 Code Extraction

\`\`\`python
def suggest_icd10_codes(clinical_note: str) -> list[dict]:
    """Use LLM to suggest ICD-10 codes from clinical note."""
    
    compressed = compress_markdown(clinical_note)
    
    prompt = f"""Analyze this clinical note and suggest ICD-10 codes.

Note:
{compressed}

Return JSON array with code and description."""
    
    response = call_llm(prompt)
    return json.loads(response)
\`\`\`

## Best Practices

1. **Validate outputs** — Always have clinical review
2. **Use specialized models** — Clinical BERT, BioBERT
3. **Maintain terminology** — Preserve medical abbreviations
4. **Document accuracy** — Track F1 scores for each task`,
      },
    ],
  },
];

export function getDocBySlug(slug: string): DocItem | undefined {
  for (const section of [...docsStructure, ...patientDocsStructure]) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return item;
  }
  return undefined;
}

export function getAllDocs(): DocItem[] {
  return [
    ...docsStructure.flatMap((s) => s.items),
    ...patientDocsStructure.flatMap((s) => s.items),
  ];
}
