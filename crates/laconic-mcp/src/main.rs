//! # Laconic MCP Server
//!
//! Exposes markdown compression as MCP tools for AI agents.
//!
//! Tools:
//! - `compress_markdown` — compress markdown text, return compressed text + stats
//! - `estimate_savings` — estimate token savings without returning compressed text
//!
//! Transport: stdio (works with Cursor, Windsurf, Claude Desktop, etc.)
//!
//! ## Configuration (in your MCP client config):
//!
//! ```json
//! {
//!   "mcpServers": {
//!     "laconic": {
//!       "command": "laconic-mcp",
//!       "args": []
//!     }
//!   }
//! }
//! ```

use rmcp::{
    ServerHandler,
    handler::server::{router::tool::ToolRouter, wrapper::Parameters},
    model::{ServerCapabilities, ServerInfo},
    schemars, tool, tool_router, ServiceExt,
};
use serde::Deserialize;
use tokio::io::{stdin, stdout};

use laconic_core::{compress, estimate, CompressConfig};

// ---------------------------------------------------------------------------
// Tool parameter types
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize, schemars::JsonSchema)]
pub struct CompressRequest {
    #[schemars(description = "The markdown text to compress")]
    pub markdown: String,

    #[schemars(description = "Disable table compaction (default: false)")]
    pub no_tables: Option<bool>,

    #[schemars(description = "Disable HTML cleanup (default: false)")]
    pub no_html: Option<bool>,

    #[schemars(description = "Disable badge stripping (default: false)")]
    pub no_badges: Option<bool>,

    #[schemars(description = "Enable URL deduplication (default: false)")]
    pub url_dedup: Option<bool>,
}

#[derive(Debug, Deserialize, schemars::JsonSchema)]
pub struct EstimateRequest {
    #[schemars(description = "The markdown text to estimate savings for")]
    pub markdown: String,
}

// ---------------------------------------------------------------------------
// MCP Service
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct LaconicService {
    tool_router: ToolRouter<Self>,
}

impl LaconicService {
    pub fn new() -> Self {
        Self {
            tool_router: Self::tool_router(),
        }
    }
}

fn build_config(req: &CompressRequest) -> CompressConfig {
    CompressConfig {
        tables: !req.no_tables.unwrap_or(false),
        html_tables: !req.no_html.unwrap_or(false),
        html_cleanup: !req.no_html.unwrap_or(false),
        badges: !req.no_badges.unwrap_or(false),
        url_dedup: req.url_dedup.unwrap_or(false),
        ..CompressConfig::default()
    }
}

#[tool_router]
impl LaconicService {
    #[tool(
        description = "Compress markdown text for LLM token efficiency. Returns the compressed text along with token count statistics. Strips decorative HTML, compacts tables to CSV format, removes badge images, and normalizes whitespace."
    )]
    fn compress_markdown(
        &self,
        Parameters(req): Parameters<CompressRequest>,
    ) -> String {
        let config = build_config(&req);
        let result = compress(&req.markdown, &config);

        serde_json::json!({
            "compressed_text": result.text,
            "original_tokens": result.original_tokens,
            "compressed_tokens": result.compressed_tokens,
            "tokens_saved": result.tokens_saved,
            "savings_pct": (result.savings_pct * 100.0).round() / 100.0,
        })
        .to_string()
    }

    #[tool(
        description = "Estimate token savings from compressing markdown text without returning the compressed output. Useful for deciding whether compression is worthwhile for a given document."
    )]
    fn estimate_savings(
        &self,
        Parameters(req): Parameters<EstimateRequest>,
    ) -> String {
        let config = CompressConfig::default();
        let result = estimate(&req.markdown, &config);

        serde_json::json!({
            "original_tokens": result.original_tokens,
            "compressed_tokens": result.compressed_tokens,
            "tokens_saved": result.tokens_saved,
            "savings_pct": (result.savings_pct * 100.0).round() / 100.0,
            "recommendation": if result.savings_pct > 5.0 {
                "Compression recommended — significant token savings available."
            } else if result.savings_pct > 1.0 {
                "Marginal savings — compression available but impact is small."
            } else {
                "Minimal savings — this document is already token-efficient."
            },
        })
        .to_string()
    }
}

impl ServerHandler for LaconicService {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            instructions: Some(
                "Laconic compresses markdown for LLM token efficiency. \
                 Use compress_markdown to reduce token count of markdown text before \
                 sending it as context to an LLM. Use estimate_savings to check if \
                 compression is worthwhile for a given document."
                    .into(),
            ),
            capabilities: ServerCapabilities::builder().enable_tools().build(),
            ..Default::default()
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("laconic_mcp=info".parse()?),
        )
        .with_writer(std::io::stderr)
        .init();

    tracing::info!("Starting Laconic MCP server (stdio)");

    let service = LaconicService::new();
    let server = service.serve((stdin(), stdout())).await?;
    let reason = server.waiting().await?;

    tracing::info!(?reason, "Server stopped");
    Ok(())
}
