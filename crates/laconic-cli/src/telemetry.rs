//! Anonymous usage telemetry — fire-and-forget, opt-out via LACONIC_TELEMETRY=0.
//!
//! Collects: version, OS, arch, hashed hostname/username, command, file count,
//! token stats, duration. Sends to a Cloudflare Worker that enriches with IP/geo.
//! Never blocks the CLI. Silently drops on any failure.

use std::time::Duration;

use sha2::{Digest, Sha256};

const TELEMETRY_ENDPOINT: &str = "https://laconic-telemetry.copyleftdev.workers.dev/v1/event";
const TIMEOUT: Duration = Duration::from_secs(2);

/// Telemetry payload collected client-side.
#[derive(serde::Serialize)]
pub struct TelemetryEvent {
    pub v: &'static str,
    pub os: &'static str,
    pub arch: &'static str,
    pub hostname_hash: String,
    pub username_hash: String,
    pub cmd: String,
    pub files: usize,
    pub tokens_in: usize,
    pub tokens_out: usize,
    pub tokens_saved: usize,
    pub duration_ms: u128,
    pub fast_mode: bool,
}

/// Check if telemetry is enabled (opt-out via env var).
pub fn is_enabled() -> bool {
    match std::env::var("LACONIC_TELEMETRY") {
        Ok(val) => val != "0" && val.to_lowercase() != "false" && val.to_lowercase() != "off",
        Err(_) => true,
    }
}

/// Hash a string into a short hex fingerprint (first 12 chars of SHA-256).
fn fingerprint(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex_encode(&result[..6])
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn get_hostname() -> String {
    std::fs::read_to_string("/etc/hostname")
        .map(|s| s.trim().to_string())
        .or_else(|_| std::env::var("HOSTNAME"))
        .or_else(|_| std::env::var("COMPUTERNAME"))
        .unwrap_or_default()
}

fn get_username() -> String {
    std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .or_else(|_| std::env::var("LOGNAME"))
        .unwrap_or_default()
}

/// Build a telemetry event from command execution results.
pub fn build_event(
    cmd: &str,
    files: usize,
    tokens_in: usize,
    tokens_out: usize,
    duration_ms: u128,
    fast_mode: bool,
) -> TelemetryEvent {
    TelemetryEvent {
        v: env!("CARGO_PKG_VERSION"),
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        hostname_hash: fingerprint(&get_hostname()),
        username_hash: fingerprint(&get_username()),
        cmd: cmd.to_string(),
        files,
        tokens_in,
        tokens_out,
        tokens_saved: tokens_in.saturating_sub(tokens_out),
        duration_ms,
        fast_mode,
    }
}

/// Send telemetry in a background thread. Never blocks, never panics.
pub fn send(event: TelemetryEvent) {
    std::thread::spawn(move || {
        let _ = ureq::post(TELEMETRY_ENDPOINT)
            .timeout(TIMEOUT)
            .set("Content-Type", "application/json")
            .set("User-Agent", &format!("laconic/{}", event.v))
            .send_json(&event);
    });
}
