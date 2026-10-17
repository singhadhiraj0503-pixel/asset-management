import { getUserInvoicesAction } from "@/actions/invoice-actions";
import { getAllUserPurchasedAssetsAction } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Download, FileText } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const PurchasesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) return null;

  if (!session.user) redirect("/login");
  if (session?.user?.role === "admin") redirect("/");

  const purchasesResult = await getAllUserPurchasedAssetsAction();
  const invoiceResult = await getUserInvoicesAction();

  const purchases = Array.isArray(purchasesResult) ? purchasesResult : [];
  const invoices =
    invoiceResult.success && invoiceResult.invoices
      ? invoiceResult.invoices
      : [];

  const purchaseToInvoiceMap = new Map();
  invoices.forEach((inv) => purchaseToInvoiceMap.set(inv.purchaseId, inv.id));

  console.log(purchases, invoices, "invoices");

  return (
    <div className="conatainer py-12">
      <h1 className="text-2xl font-bold mb-5">My Purchases</h1>
      {purchases.length === 0 ? (
        <p>You have not purchased any asset yet !!</p>
      ) : (
        <div className="space-y-4">
          {purchases.map(({ purchase, asset }) => {
            return (
              <div
                key={purchase.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-sm"
              >
                <div className="size-16 relative rounded-md overflow-hidden flex shrink-0">
                  <Image
                    src={asset.fileUrl}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col grow min-w-0">
                  <h3 className="font-medium truncate">{asset.title}</h3>
                  <p className="text-sm mt-1 text-gray-600">
                    Purchased at:{" "}
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Button size={"sm"} asChild>
                    <a
                      href={`/api/download/${asset.id}`}
                      download
                      className="flex items-center"
                    >
                      <Download className="size-4 mr-2" />
                      <span>Download</span>
                    </a>
                  </Button>
                  {purchaseToInvoiceMap.has(purchase.id) && (
                    <Button variant={"outline"} size={"sm"} asChild>
                      <a
                        href={`/api/invoice/${purchaseToInvoiceMap.get(purchase.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <FileText className="size-4 mr-2" />
                        <span>Invoice</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
