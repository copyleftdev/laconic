import { notFound } from "next/navigation";
import { getDocBySlug, getAllDocs } from "@/lib/docs";
import { MarkdownContent } from "@/components/markdown-content";
import { TableOfContents } from "@/components/table-of-contents";
import { MobileNav } from "@/components/mobile-nav";
import { DocNavigation } from "@/components/doc-navigation";
import type { Metadata } from "next";

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return { title: "Not Found | Laconic" };
  }

  return {
    title: `${doc.title} | Laconic`,
    description: `${doc.title} - Laconic documentation`,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex">
      {/* Mobile navigation */}
      <MobileNav />

      {/* Content */}
      <article className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <MarkdownContent content={doc.content} />

          {/* Navigation */}
          <DocNavigation currentSlug={slug} />
        </div>
      </article>

      {/* Table of Contents - Hidden on mobile */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-20 py-8 pr-4">
          <TableOfContents content={doc.content} />
        </div>
      </aside>
    </div>
  );
}
