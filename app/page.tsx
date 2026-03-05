import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Terminal,
  Zap,
  Lock,
  GitBranch,
  FileText,
  Stethoscope,
  ArrowRight,
  Github,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>Sub-millisecond compression</span>
              </div>

              <h1 className="animate-fade-in text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Maximum meaning,
                <br />
                <span className="text-primary">minimum tokens</span>
              </h1>

              <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
                Cut your LLM token costs by up to 50%. Laconic compresses markdown
                with lossless transformations — zero semantic loss, zero config.
              </p>

              <div className="animate-fade-in mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/docs/introduction"
                  className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="https://github.com/copyleftdev/laconic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:border-primary/50 active:scale-[0.98]"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>

              {/* Code Preview */}
              <div className="animate-scale-in mt-12 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-muted-foreground">Terminal</span>
                </div>
                <div className="p-4 text-left font-mono text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <span className="text-primary">$</span>
                    <span className="ml-2 text-foreground">laconic compress README.md</span>
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    # README.md: 1648 → 1418 tokens (saved 230, 14.0%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Laconic?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Eight lossless strategies that remove decorative noise while
                preserving every word that matters.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Sub-millisecond",
                  description:
                    "Near-instant compression even on large batches. No ML models, no latency.",
                },
                {
                  icon: Lock,
                  title: "100% Lossless",
                  description:
                    "Zero semantic loss. Every meaningful word stays intact, only decorative structure removed.",
                },
                {
                  icon: GitBranch,
                  title: "Three Interfaces",
                  description:
                    "CLI for scripts, Rust library for integration, MCP server for AI agents.",
                },
                {
                  icon: Terminal,
                  title: "Single Binary",
                  description:
                    "5.6MB static binary. No runtime dependencies, no Python, no Docker required.",
                },
                {
                  icon: FileText,
                  title: "Smart Strategies",
                  description:
                    "Badge stripping, table compaction, HTML cleanup, URL dedup — all configurable.",
                },
                {
                  icon: Stethoscope,
                  title: "Healthcare Ready",
                  description:
                    "Patient document workflows with HIPAA compliance guidance and EHR integration.",
                },
              ].map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Savings Section */}
        <section className="border-y border-border bg-card/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Real Savings
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Expected token reduction by document type
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Savings
                    </th>
                    <th className="hidden px-6 py-3 text-left text-sm font-semibold text-foreground sm:table-cell">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      type: "HTML-heavy docs",
                      savings: "40–55%",
                      example: "React, Angular component libraries",
                    },
                    {
                      type: "Awesome-lists",
                      savings: "20–30%",
                      example: "Badge-heavy curated lists",
                    },
                    {
                      type: "API documentation",
                      savings: "15–25%",
                      example: "Table-heavy references, OpenAPI",
                    },
                    {
                      type: "READMEs",
                      savings: "10–15%",
                      example: "Typical open-source projects",
                    },
                    {
                      type: "Pure prose",
                      savings: "0%",
                      example: "Blog posts, essays — never touched",
                    },
                  ].map((row) => (
                    <tr
                      key={row.type}
                      className="transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {row.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                          {row.savings}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground sm:table-cell">
                        {row.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to cut your token costs?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Install Laconic in under a minute and start saving immediately.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/docs/installation"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Installation Guide
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/docs/overview"
                  className="group inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                >
                  <Stethoscope className="h-4 w-4" />
                  Patient Documents
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
