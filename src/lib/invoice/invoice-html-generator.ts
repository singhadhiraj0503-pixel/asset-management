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

  // Escape dynamic text before inserting it into HTML.
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeInvoiceNumber = escapeHtml(invoiceNumber);
  const safeAssetTitle = escapeHtml(assetTitle);

  //   return `
  //   <!DOCTYPE html>
  //   <html>
  //   <head>
  //   <meta charset='utf-8'
  //   <title>Invoice ${invoiceNumber}</title>
  //   </head>
  //   <body>
  //   <div>
  //   <div>${invoiceNumber}</div>
  //   <div>${assetTitle}</div>
  //   <div>${formattedPrice}</div>
  //   <div>${formattedDate}</div>
  //   </div>
  //   </body>
  //   </html>
  //   `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice ${safeInvoiceNumber}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 48px 20px;
            background: #f4f6f5;
            color: #202a27;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-font-smoothing: antialiased;
          }

          .invoice {
            width: 100%;
            max-width: 760px;
            margin: 0 auto;
            padding: 56px;
            background: #ffffff;
            border: 1px solid #e7ece9;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(20, 40, 32, 0.05);
          }

          .top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            padding-bottom: 36px;
            border-bottom: 1px solid #e9eeeb;
          }

          .brand {
            margin: 0 0 8px;
            color: #07976d;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .document-title {
            margin: 0;
            font-size: 34px;
            font-weight: 700;
            letter-spacing: -1.2px;
          }

          .invoice-number {
            margin: 10px 0 0;
            color: #78827d;
            font-size: 13px;
            overflow-wrap: anywhere;
          }

          .status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 12px;
            border: 1px solid #c8efdf;
            border-radius: 999px;
            background: #effaf5;
            color: #087f5b;
            font-size: 12px;
            font-weight: 700;
          }

          .status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
          }

          .date-section {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 30px 0 38px;
          }

          .label {
            margin: 0 0 9px;
            color: #89928d;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }

          .date {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
          }

          .section-title {
            margin: 0 0 20px;
            font-size: 17px;
            font-weight: 700;
          }

          .items {
            width: 100%;
            border-collapse: collapse;
          }

          .items th {
            padding: 14px 12px;
            background: #f7f9f8;
            color: #737d77;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.8px;
            text-align: left;
            text-transform: uppercase;
          }

          .items th:first-child {
            border-radius: 8px 0 0 8px;
          }

          .items th:last-child {
            border-radius: 0 8px 8px 0;
            text-align: right;
          }

          .items td {
            padding: 24px 12px;
            border-bottom: 1px solid #e9eeeb;
            font-size: 14px;
            line-height: 1.6;
          }

          .items td:last-child {
            text-align: right;
            font-weight: 600;
            white-space: nowrap;
          }

          .asset-name {
            font-weight: 600;
            overflow-wrap: anywhere;
          }

          .total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-top: 24px;
            padding: 24px;
            border-radius: 12px;
            background: #f2faf6;
          }

          .total-label {
            margin: 0 0 6px;
            color: #64736b;
            font-size: 13px;
          }

          .total-note {
            margin: 0;
            color: #87928b;
            font-size: 12px;
          }

          .total-amount {
            margin: 0;
            color: #07845e;
            font-size: 30px;
            font-weight: 700;
            letter-spacing: -0.8px;
            white-space: nowrap;
          }

          .footer {
            margin-top: 42px;
            padding-top: 22px;
            border-top: 1px solid #e9eeeb;
            color: #89928d;
            font-size: 12px;
            line-height: 1.7;
            text-align: center;
          }

          .footer p {
            margin: 4px 0;
          }

          @media (max-width: 600px) {
            body {
              padding: 16px 10px;
            }

            .invoice {
              padding: 26px 20px;
              border-radius: 12px;
            }

            .top {
              flex-direction: column;
              gap: 18px;
              padding-bottom: 26px;
            }

            .document-title {
              font-size: 29px;
            }

            .date-section {
              padding: 24px 0 30px;
            }

            .items th,
            .items td {
              padding: 14px 8px;
              font-size: 12px;
            }

            .total {
              padding: 18px 14px;
            }

            .total-amount {
              font-size: 24px;
            }
          }

          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }

            .invoice {
              max-width: none;
              border: none;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>

      <body>
        <main class="invoice">
          <header class="top">
            <div>
              <p class="brand">Asset Platform</p>
              <h1 class="document-title">Invoice</h1>
              <p class="invoice-number">
                Invoice No. ${safeInvoiceNumber}
              </p>
            </div>

            <div class="status">
              <span class="status-dot"></span>
              Paid
            </div>
          </header>

          <section class="date-section">
            <div>
              <p class="label">Purchase date</p>
              <p class="date">${formattedDate}</p>
            </div>

            <div style="text-align: right">
              <p class="label">Currency</p>
              <p class="date">USD</p>
            </div>
          </section>

          <section>
            <h2 class="section-title">Purchase summary</h2>

            <table class="items">
              <thead>
                <tr>
                  <th scope="col">Description</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <span class="asset-name">${safeAssetTitle}</span>
                  </td>
                  <td>$${formattedPrice}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="total">
            <div>
              <p class="total-label">Total paid</p>
              <p class="total-note">One-time asset purchase</p>
            </div>

            <p class="total-amount">$${formattedPrice}</p>
          </section>

          <footer class="footer">
            <p>Thank you for your purchase.</p>
            <p>Invoice ${safeInvoiceNumber}</p>
          </footer>
        </main>
      </body>
    </html>
  `;
};
