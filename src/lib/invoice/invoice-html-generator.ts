import { numeric } from "drizzle-orm/pg-core";
import { purchase } from "../db/schema";

export const generateInvoiceHtml = (
  invoiceNumber: string,
  purchaseDate: Date,
  assetTitle: string,
  price: number,
): string => {
  const formattedDate = purchaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedPrice = (price / 100).toFixed(2);

  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset='utf-8'
  <title>Invoice ${invoiceNumber}</title>
  </head>
  <body>
  <div>
  <div>${invoiceNumber}</div>
  <div>${assetTitle}</div>
  <div>${formattedPrice}</div>
  <div>${formattedDate}</div>
  </div>
  </body>
  </html>
  `;
};
