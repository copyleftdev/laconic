"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { docsStructure, patientDocsStructure } from "@/lib/docs";
import { ChevronRight, FileText, Stethoscope } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const currentSlug = pathname?.split("/").pop();

  return (
    <aside className={cn("flex flex-col", className)}>
      <nav className="flex-1 space-y-6 px-4 py-6">
        {/* Documentation Section */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Documentation
          </div>
          {docsStructure.map((section, idx) => (
            <div key={section.slug} className={cn(idx > 0 && "mt-4")}>
              <div className="mb-1 px-2 text-sm font-medium text-foreground">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = currentSlug === item.slug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 transition-transform duration-150",
                            isActive
                              ? "text-primary"
                              : "text-transparent group-hover:text-muted-foreground",
                            isActive && "translate-x-0.5"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Patient Documents Section */}
        <div className="border-t border-border pt-6">
          <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5" />
            Patient Documents
          </div>
          {patientDocsStructure.map((section) => (
            <div key={section.slug}>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = currentSlug === item.slug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 transition-transform duration-150",
                            isActive
                              ? "text-primary"
                              : "text-transparent group-hover:text-muted-foreground",
                            isActive && "translate-x-0.5"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
