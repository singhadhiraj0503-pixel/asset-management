import { getUserInvoicesAction } from "@/actions/invoice-actions";
import { getAllUserPurchasedAssetsAction } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  HardDrive,
  Package,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

const PurchasesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) return null;

  if (!session.user) redirect("/login");
  if (session.user.role === "admin") redirect("/");

  const purchasesResult = await getAllUserPurchasedAssetsAction();
  const invoiceResult = await getUserInvoicesAction();

  const purchases = Array.isArray(purchasesResult) ? purchasesResult : [];

  const invoices =
    invoiceResult.success && invoiceResult.invoices
      ? invoiceResult.invoices
      : [];

  const purchaseToInvoiceMap = new Map<string, string>();
  invoices.forEach((invoice) =>
    purchaseToInvoiceMap.set(invoice.purchaseId, invoice.id),
  );

  const totalAssets = purchases.length;

  // Estimate the total stored size only if your purchase data includes
  // fileSize. Otherwise, avoid displaying fabricated storage usage.
  const totalFileSize = purchases.reduce((total, item) => {
    const asset = item.asset as typeof item.asset & {
      fileSize?: number;
    };

    return total + (asset.fileSize ?? 0);
  }, 0);

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "—";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      {/* Page heading */}
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Personal Repository
          </p>

          <h1 className="text-xl font-semibold tracking-tight">My Purchases</h1>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Your licensed digital assets, high-resolution source packages, and
            fiscal invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Archive className="size-4 text-emerald-500" />
            <span>{totalAssets} Assets Synced</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Active License</span>
          </div>
        </div>
      </section>

      {/* Purchase filters / sorting display */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium">All Purchases ({totalAssets})</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-muted-foreground">Commercial Rights</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-muted-foreground">Archived</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          <span>Sorted by Acquisition Date (Newest)</span>
        </div>
      </section>

      {/* Purchased assets */}
      {purchases.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-muted/50">
            <Package className="size-5 text-muted-foreground" />
          </div>

          <h2 className="font-medium">Your repository is empty</h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Assets you purchase will appear here, ready to download whenever you
            need them.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {purchases.map(({ purchase, asset }) => {
            const invoiceId = purchaseToInvoiceMap.get(purchase.id);

            return (
              <article
                key={purchase.id}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 transition-colors duration-200 hover:bg-card/80 sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4"
              >
                {/* Asset thumbnail */}
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:size-[82px]">
                  <Image
                    src={asset.thumbnailUrl || asset.fileUrl}
                    alt={asset.title}
                    fill
                    sizes="82px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                    Asset
                  </span>
                </div>

                {/* Asset details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-medium sm:text-base">
                      {asset.title}
                    </h2>

                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-500">
                      Pro
                    </span>

                    {invoiceId && (
                      <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-500">
                        Receipt Ready
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                    <CalendarDays className="size-3.5 shrink-0" />

                    <span>
                      Purchased at:{" "}
                      {new Date(purchase.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        },
                      )}
                    </span>

                    <span className="hidden text-muted-foreground/40 sm:inline">
                      •
                    </span>

                    <span className="font-mono">
                      Order #{purchase.id.slice(0, 8).toUpperCase()}
                    </span>

                    {totalFileSize > 0 && (
                      <>
                        <span className="hidden text-muted-foreground/40 sm:inline">
                          •
                        </span>
                        <span className="font-mono">
                          {formatSize(
                            (
                              asset as typeof asset & {
                                fileSize?: number;
                              }
                            ).fileSize ?? 0,
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Existing download and invoice actions */}
                <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <Button size="sm" asChild className="flex-1 sm:flex-none">
                    <a
                      href={`/api/download/${asset.id}`}
                      download
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="size-4 text-emerald-500" />
                      Download
                    </a>
                  </Button>

                  {invoiceId && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 sm:flex-none"
                    >
                      <a
                        href={`/api/invoice/${invoiceId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <FileText className="size-4" />
                        Invoice
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Storage / entitlement panel */}
      <section className="mt-10 rounded-2xl border border-border bg-card/40 p-5 sm:mt-12 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-emerald-500">
              <Sparkles className="size-4" />
              Unlimited Asset Vault
            </p>

            <h2 className="mt-3 text-base font-medium">
              Storage &amp; Download Entitlement
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Purchased assets remain available in your cloud vault. Access your
              purchased files and invoices from this page.
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3 md:w-64">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Vault Packages</span>
              <span className="font-mono text-emerald-500">
                {totalAssets} / {totalAssets}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                {totalAssets} Purchased Assets
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="size-3.5" />
                Cloud Vault
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PurchasesPage;
