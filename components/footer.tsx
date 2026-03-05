import Link from "next/link";
import { Github, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Terminal className="h-4 w-4" />
            <span>Laconic</span>
            <span className="text-border">|</span>
            <span>Maximum meaning, minimum tokens</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/docs/introduction"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </Link>
            <Link
              href="/docs/overview"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Patient Docs
            </Link>
            <a
              href="https://github.com/copyleftdev/laconic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            Released under the{" "}
            <a
              href="https://github.com/copyleftdev/laconic/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
