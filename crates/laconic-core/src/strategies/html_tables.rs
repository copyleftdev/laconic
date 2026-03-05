//! HTML table → compact CSV conversion.

use std::sync::LazyLock;

use regex::Regex;

static TABLE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<table[^>]*>.*?</table>").expect("valid regex"));
static TH_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<th[^>]*>(.*?)</th>").expect("valid regex"));
static TR_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<tr[^>]*>(.*?)</tr>").expect("valid regex"));
static TD_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<td[^>]*>(.*?)</td>").expect("valid regex"));
static TAG_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"<[^>]+>").expect("valid regex"));
static CODE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?si)<code>(.*?)</code>").expect("valid regex"));

/// Convert HTML `<table>` blocks to compact CSV-like format.
pub fn compact(input: &str) -> String {

    TABLE_RE
        .replace_all(input, |caps: &regex::Captures| {
            let table_html = &caps[0];

            let headers: Vec<String> = TH_RE
                .captures_iter(table_html)
                .map(|c| TAG_RE.replace_all(c[1].trim(), "").trim().to_string())
                .collect();

            let mut data_rows = Vec::new();
            for tr_cap in TR_RE.captures_iter(table_html) {
                let row_html = &tr_cap[1];
                let cells: Vec<String> = TD_RE
                    .captures_iter(row_html)
                    .map(|c| {
                        let cell = CODE_RE.replace_all(&c[1], "`$1`");
                        TAG_RE.replace_all(&cell, "").trim().to_string()
                    })
                    .collect();
                if !cells.is_empty() {
                    data_rows.push(cells);
                }
            }

            if headers.is_empty() || data_rows.is_empty() {
                return table_html.to_string();
            }

            let mut lines = vec![format!("[{}]", headers.join(","))];
            for row in &data_rows {
                lines.push(row.join(","));
            }
            lines.join("\n")
        })
        .into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_html_table() {
        let input = "<table><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>30</td></tr></table>";
        let expected = "[Name,Age]\nAlice,30";
        assert_eq!(compact(input), expected);
    }

    #[test]
    fn preserves_code_in_cells() {
        let input =
            "<table><tr><th>Prop</th><th>Type</th></tr><tr><td><code>name</code></td><td>string</td></tr></table>";
        let expected = "[Prop,Type]\n`name`,string";
        assert_eq!(compact(input), expected);
    }
}
