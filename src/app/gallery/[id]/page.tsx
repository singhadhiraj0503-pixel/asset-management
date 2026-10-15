import { getAssetByIdAction } from "@/actions/dashboard-actions";
import { createPaypalOrderAction } from "@/actions/payment-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileImage,
  Info,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React, { Suspense } from "react";
import { toast } from "sonner";

interface GalleryDetailsPageProps {
  params: Promise<{ id: string }>;
}

const GalleryDetailsPage = ({ params }: GalleryDetailsPageProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
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

  if (session?.user?.role === "admin") {
    redirect("/");
  }

  const { id } = await params;
  const result = await getAssetByIdAction(id);

  if (!result) {
    notFound();
  }

  const { asset, categoryName, userName, userImage, userId } = result;

  const isAuthor = session?.user?.id === userId;

  const initials = userName
    ? userName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    : "U";

  // Keep the existing purchase-state logic unchanged.
  const hasPurchasedAsset = false;

  const isApproved = asset.isApproved === "approved";

  const handlePurchase = async () => {
    "use server";
    const result = await createPaypalOrderAction(id);

    if (result.alreadyPurchased) {
      redirect(`/gallery/${id}?success=true`);
    }

    if (result.approvalLink) {
      redirect(result.approvalLink);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Navigation and asset identifier */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 mt-10">
          <Button
            asChild
            variant="ghost"
            className="gap-2 rounded-lg px-3 text-muted-foreground hover:text-foreground"
          >
            <Link href="/gallery" className="flex items-center gap-4">
              <ArrowLeft className="size-4" />
              <span>Back to Gallery</span>
            </Link>
          </Button>

          <Badge
            variant="outline"
            className="flex items-center gap-2 rounded-full border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
          >
            <span className="size-2 rounded-full bg-emerald-400" />
            Asset ID: <span className="font-medium text-foreground">{id}</span>
          </Badge>
        </div>

        {/* Main content */}
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)] xl:gap-10">
          {/* Left column */}
          <section className="min-w-0 space-y-7">
            {/* Asset preview */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-3">
              <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-black/40 sm:min-h-[400px] lg:min-h-[460px] xl:min-h-[500px]">
                <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
                  <Badge className="border border-white/10 bg-black/75 text-white hover:bg-black/75">
                    <FileImage className="mr-1.5 size-3.5" />
                    Asset Preview
                  </Badge>

                  {isApproved && (
                    <Badge className="border border-emerald-500/30 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-950/80">
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      Approved
                    </Badge>
                  )}
                </div>

                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  width={1600}
                  height={1200}
                  priority
                  className="h-auto max-h-[620px] w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
              </div>
            </div>

            {/* Asset title and description */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="min-w-0 flex-1 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
                  {asset.title}
                </h1>

                {categoryName && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1.5 rounded-full px-3 py-1"
                  >
                    <Tag className="size-3.5 text-emerald-500" />
                    {categoryName}
                  </Badge>
                )}
              </div>

              {asset.description ? (
                <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                  {asset.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description has been provided for this asset.
                </p>
              )}
            </div>

            {/* Creator card */}
            <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-none">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 text-base font-semibold text-emerald-500">
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={userName ?? "Creator"}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">
                        {userName ?? "Unknown Creator"}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-xs text-emerald-500"
                      >
                        Creator
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Asset contributor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-5 text-emerald-500" />
                  <span
                    className={
                      isApproved ? "text-emerald-500" : "text-muted-foreground"
                    }
                  >
                    {isApproved ? "Approved Asset" : "Pending Approval"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Asset information */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Asset Information</h2>
                <span className="text-xs text-muted-foreground">
                  File and publishing details
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="rounded-xl border-border bg-card shadow-none">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-lg bg-muted p-2">
                      <FileImage className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Asset title
                      </p>
                      <p className="mt-1 break-words text-sm font-medium">
                        {asset.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-border bg-card shadow-none">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-lg bg-muted p-2">
                      <Tag className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="mt-1 break-words text-sm font-medium">
                        {categoryName ?? "Uncategorized"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-border bg-card shadow-none sm:col-span-2">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-lg bg-muted p-2">
                      <ShieldCheck className="size-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Publishing status
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {asset.isApproved === "approved"
                          ? "Approved for publishing"
                          : asset.isApproved === "rejected"
                            ? "Rejected"
                            : "Pending review"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </section>

          {/* Right column: purchase panel */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="space-y-5">
              <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                <div className="space-y-4 border-b border-border p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10">
                      PREMIUM ASSET
                    </Badge>

                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Digital Asset
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-4xl font-bold tracking-tight sm:text-5xl">
                      20rs
                    </span>
                    <span className="text-sm text-muted-foreground">
                      One Time Purchase
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    Purchase this asset for your collection. Access depends on
                    your account and purchase status.
                  </p>
                </div>

                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Existing author and purchase conditions */}
                  {session?.user ? (
                    isAuthor ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-300">
                        <Info className="mt-0.5 size-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">
                            Author Ownership Notice
                          </p>
                          <p className="mt-1 text-sm leading-5 opacity-90">
                            This is your own asset. You cannot purchase your own
                            asset.
                          </p>
                        </div>
                      </div>
                    ) : hasPurchasedAsset ? (
                      <Button
                        asChild
                        className="cursor-pointer h-12 w-full bg-emerald-500 font-medium text-black hover:bg-emerald-400"
                      >
                        <a
                          href={asset.fileUrl}
                          download
                          className="flex items-center"
                        >
                          <Download className="mr-2 size-5" />
                          <span>Download Asset</span>
                        </a>
                      </Button>
                    ) : (
                      <form action={handlePurchase}>
                        <Button
                          type="submit"
                          className="cursor-pointer h-12 w-full bg-emerald-500 font-medium text-black hover:bg-emerald-400"
                        >
                          <ShoppingCart className="mr-2 size-5" />
                          Purchase Now
                        </Button>
                      </form>
                    )
                  ) : (
                    <Button
                      asChild
                      className="h-12 w-full bg-emerald-500 font-medium text-black hover:bg-emerald-400"
                    >
                      <Link href="/login">Sign in to purchase</Link>
                    </Button>
                  )}

                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        Purchase information
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Digital
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                      <LockKeyhole className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Sign in to continue. The purchase and download options
                        depend on the account&apos;s purchase status.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-5">
                    <h3 className="text-sm font-semibold">
                      ASSET SPECIFICATIONS
                    </h3>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="size-4" />
                        Category
                      </span>
                      <span className="max-w-[55%] truncate text-right font-medium">
                        {categoryName ?? "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="size-4" />
                        Approval Status
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-right text-xs font-medium ${
                          isApproved
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            isApproved
                              ? "bg-emerald-400"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {isApproved ? "Approved" : "Not approved"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock3 className="size-4" />
                        Access
                      </span>
                      <span className="text-right font-medium">
                        One-time purchase
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage and integrity information */}
              <Card className="rounded-2xl border-border bg-card shadow-none">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                    <ShieldCheck className="size-5" />
                    Asset Access & Security
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    Access to this asset is managed through the platform.
                    Sign-in and ownership restrictions are applied before
                    purchase.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Asset Platform. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            Asset Platform
          </p>
        </footer>
      </div>
    </main>
  );
};
