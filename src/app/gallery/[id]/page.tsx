import { getAssetByIdAction } from "@/actions/dashboard-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Download, Info, Loader2, ShoppingCart, Tag } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";

interface GalleryDetailsPageProps {
  params: Promise<{ id: string }>;
}

const GalleryDetailsPage = ({ params }: GalleryDetailsPageProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <GalleryContent params={params} />
    </Suspense>
  );
};

export default GalleryDetailsPage;

const GalleryContent = async ({ params }: GalleryDetailsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session?.user?.role === "admin") {
    redirect("/");
  }

  const { id } = await params;
  const result = await getAssetByIdAction(id);
  if (!result) {
    notFound();
  }

  console.log(result);

  const { asset, categoryName, userName, userImage, userId } = result;
  const isAuthor = session?.user?.id === userId;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const hasPurchasedAsset = false;

  return (
    <div className="min-h-screen container px-4">
      <div className="container py-25">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <div className="rounded-lg overflow-hidden border">
              <div className="relative w-full ">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{asset?.title}</h1>
                {categoryName && (
                  <Badge className="mt-2 text-gray-700 hover:bg-gray-600">
                    <Tag className="size-4 mr-2" />
                    {categoryName}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500">Creator</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-24">
              <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Premium Asset</h3>
                  <div>
                    <span className="text-3xl font-bold">20rs</span>
                    <span className="ml-2 text-gray-400">
                      One Time Purchase
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {session?.user ? (
                      isAuthor ? (
                        <div className="bg-red-200 text-red-800 p-5 rounded-lg flex items-start gap-3">
                          <Info className="size-5 text-red-800 mt-1 shrink-0" />
                          <p className="text-sm">
                            This is your own Asset. You cannot purchase your own
                            asset.
                          </p>
                        </div>
                      ) : hasPurchasedAsset ? (
                        <Button
                          asChild
                          className="w-full h-12 bg-emerald-600 cursor-pointer"
                        >
                          <a
                            href=""
                            download
                            className="flex items-center gap-2"
                          >
                            <Download className="size-5 mr-2" />
                            <span className="">Download Asset</span>
                          </a>
                        </Button>
                      ) : (
                        <form action="">
                          <Button
                            type="submit"
                            className={"w-full h-12 cursor-pointer"}
                          >
                            <ShoppingCart className="size-6 mr-2" />
                            Purchase Now
                          </Button>
                        </form>
                      )
                    ) : (
                      <>
                        <Button className="w-full h-12">
                          <Link href={"/login"}>Sign in to purchase</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
