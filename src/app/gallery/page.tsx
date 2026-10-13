import { getCategoriesAction } from "@/actions/dashboard-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { headers } from "next/headers";
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

  if (session && session?.user?.role === "admin") redirect("/");
  return (
    <Suspense
      fallback={
        <div className="min-h-[65vh] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-black" />
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
    ? Number.parseInt(params.category)
    : undefined;

  const categories = await getCategoriesAction();

  console.log("Gallery Content");

  return (
    <div className="min-h-screen container px-4">
      <div className="sticky top-0 z-30 border-b py-3 px-4">
        <div className="container flex overflow-x-auto gap-2 py-15  ">
          <Button
            variant={!categoryId ? "default" : "outline"}
            size={"sm"}
            className={!categoryId ? "bg-black text-white" : ""}
          >
            <Link href={`/gallery`}>ALL</Link>
          </Button>
          {categories.map((c) => {
            return (
              <Button
                key={c.id}
                variant={categoryId === c.id ? "default" : "outline"}
                size="sm"
                className={categoryId === c.id ? "bg-black text-white" : ""}
                asChild
              >
                <Link href={`/gallery?category=${c.id}`}>{c.name}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
