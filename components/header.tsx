"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Github,
  BookOpen,
  Terminal,
  FileText,
  Search,
} from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all group-hover:shadow-md group-hover:shadow-primary/20">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">Laconic</span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 justify-center px-8 md:flex">
          <div
            className={cn(
              "relative flex w-full max-w-md items-center rounded-md border bg-secondary/50 transition-all duration-200",
              searchFocused
                ? "border-primary shadow-sm shadow-primary/10"
                : "border-border"
            )}
          >
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="h-9 w-full bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="mr-2 hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
              /
            </kbd>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/docs/introduction"
            className="group relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            <span>Docs</span>
          </Link>
          <Link
            href="/docs/overview"
            className="group relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            <span>Patient Docs</span>
          </Link>
          <a
            href="https://github.com/copyleftdev/laconic"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground md:hidden active:scale-95"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="animate-fade-in border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            {/* Mobile Search */}
            <div className="relative mb-3 flex items-center rounded-md border border-border bg-secondary/50">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <Link
              href="/docs/introduction"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </Link>
            <Link
              href="/docs/overview"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              Patient Documents
            </Link>
            <a
              href="https://github.com/copyleftdev/laconic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
