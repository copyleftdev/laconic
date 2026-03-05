import Link from "next/link";
import { getAllDocs } from "@/lib/docs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocNavigationProps {
  currentSlug: string;
}

export function DocNavigation({ currentSlug }: DocNavigationProps) {
  const allDocs = getAllDocs();
  const currentIndex = allDocs.findIndex((doc) => doc.slug === currentSlug);

  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  if (!prevDoc && !nextDoc) return null;

  return (
    <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
      {prevDoc ? (
        <Link
          href={`/docs/${prevDoc.slug}`}
          className="group flex items-center gap-2 rounded-md px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <div className="text-left">
            <div className="text-xs text-muted-foreground">Previous</div>
            <div className="font-medium text-foreground">{prevDoc.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextDoc ? (
        <Link
          href={`/docs/${nextDoc.slug}`}
          className="group flex items-center gap-2 rounded-md px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next</div>
            <div className="font-medium text-foreground">{nextDoc.title}</div>
          </div>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
