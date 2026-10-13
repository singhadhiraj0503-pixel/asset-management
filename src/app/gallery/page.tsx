import {
  getCategoriesAction,
  getPublicAssetsAction,
} from "@/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

const GalleryPage = async ({ searchParams }: GalleryPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role === "admin") {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <GalleryContent searchParams={searchParams} />
    </Suspense>
  );
};

export default GalleryPage;

const GalleryContent = async ({ searchParams }: GalleryPageProps) => {
  const params = await searchParams;

  const categoryId = params.category
    ? Number.parseInt(params.category, 10)
    : undefined;

  const [categories, assets] = await Promise.all([
    getCategoriesAction(),
    getPublicAssetsAction(categoryId),
  ]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-8 sm:px-6 lg:px-12">
        {/* Category filters */}
        <nav
          aria-label="Asset categories"
          className="mb-10 mt-10 flex flex-wrap items-center gap-2 sm:gap-3"
        >
          <Button
            asChild
            variant="ghost"
            className={`h-9 rounded-full border-0 px-5 text-sm font-medium transition-colors ${
              !categoryId
                ? "bg-teal-400 text-slate-950 hover:bg-teal-300"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Link href="/gallery">ALL</Link>
          </Button>

          {categories.map((category) => {
            const isActive = categoryId === category.id;

            return (
              <Button
                key={category.id}
                asChild
                variant="ghost"
                className={`h-9 rounded-full border-0 px-5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-400 text-slate-950 hover:bg-teal-300"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Link href={`/gallery?category=${category.id}`}>
                  {category.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Asset gallery */}
        {assets.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold">No assets found</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              There are no approved assets in this category yet. Try selecting
              another category.
            </p>

            {categoryId && (
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <Link href="/gallery">View all assets</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map(({ asset, categoryName, userName }) => (
              <Link
                href={`/gallery/${asset.id}`}
                key={asset.id}
                aria-label={`View ${asset.title}`}
                className="group block min-w-0 overflow-hidden rounded-xl bg-card outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={asset.fileUrl}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-2 text-base font-semibold text-white">
                      {asset.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      {userName && (
                        <span className="text-xs text-white/80">
                          {userName}
                        </span>
                      )}

                      {categoryName && (
                        <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                          {categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
