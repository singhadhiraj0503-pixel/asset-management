import {
  approveAssetAction,
  getPendingAssetsAction,
  rejectAssetAction,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Clock3,
  FileImage,
  Info,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";

export const instant = false;

const AssetApprovalPage = async () => {
  const pendingAssets = await getPendingAssetsAction();

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      {/* Page heading */}
      <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-emerald-500">Asset Approval</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Asset Approval
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review user-submitted assets, inspect metadata and file specs, and
            grant or reject platform publishing permissions with automated
            compliance checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-amber-400" />
            Review Stream: Live Ingestion
          </div>

          <div className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">
            Session: Admin
          </div>
        </div>
      </section>

      {/* Approval summary */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md border bg-muted px-3 py-2 font-medium">
            Pending{" "}
            <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-500">
              {pendingAssets.length}
            </span>
          </span>
          <span className="px-2 text-muted-foreground">Awaiting review</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          Admin review required
        </div>
      </section>

      {/* Pending assets */}
      {pendingAssets.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4">
              <Check className="size-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold">All assets reviewed</h2>
            <p className="text-sm text-muted-foreground">
              There are no assets waiting for approval right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {pendingAssets.map(({ asset, userName }) => (
            <Card
              key={asset.id}
              className="overflow-hidden rounded-2xl border-border bg-card py-0 shadow-sm transition-colors hover:border-emerald-500/30"
            >
              {/* Image preview */}
              <div className="relative aspect-[16/7] overflow-hidden bg-muted">
                <Image
                  src={asset.fileUrl}
                  alt={asset.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                />

                <div className="absolute left-4 top-4 rounded-md border border-emerald-500/30 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500 backdrop-blur">
                  {asset.categoryId ? "Asset" : "Digital Asset"}
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-background/90 px-3 py-1 text-xs font-medium text-amber-500 backdrop-blur">
                  <Clock3 className="size-3.5" />
                  Pending
                </div>
              </div>

              <CardContent className="space-y-4 p-4 sm:p-5">
                {/* Asset details */}
                <div>
                  <h2 className="truncate text-lg font-semibold tracking-tight">
                    {asset.title}
                  </h2>

                  {asset.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {asset.description}
                    </p>
                  )}
                </div>

                {/* Contributor */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                      <UserRound className="size-4 text-emerald-500" />
                    </span>
                    <span className="truncate font-medium text-foreground">
                      {userName || "Unknown contributor"}
                    </span>
                  </div>

                  <span>
                    {formatDistanceToNow(new Date(asset.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* File metadata */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                    <FileImage className="size-3.5" />
                    Image asset
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-xs text-emerald-500">
                    <ShieldCheck className="size-3.5" />
                    Awaiting verification
                  </span>
                </div>

                {/* Existing actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <a href={asset.fileUrl} target="_blank" rel="noreferrer">
                      <Info className="size-4" />
                      Inspect
                    </a>
                  </Button>

                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await rejectAssetAction(asset.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      >
                        <X className="size-4" />
                        Reject
                      </Button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await approveAssetAction(asset.id);
                      }}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        className="gap-1.5 bg-emerald-500 text-black hover:bg-emerald-400"
                      >
                        <Check className="size-4" />
                        Approve
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Footer */}
      <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-border py-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          All Asset Platform systems operational
        </span>
        <span>© 2026 Asset Platform. All rights reserved.</span>
      </footer>
    </main>
  );
};

export default AssetApprovalPage;
