"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, invoice, payment, purchase, user } from "@/lib/db/schema";
import { generateInvoiceHtml } from "@/lib/invoice/invoice-html-generator";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export const createInvoiceAction = async (purchaseId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "Not Authenticated" };
    }

    const [purchasedData] = await db
      .select({
        purchase: purchase,
        asset: asset,
        payment: payment,
        user: user,
      })
      .from(purchase)
      .innerJoin(asset, eq(purchase.assetId, asset.id))
      .innerJoin(payment, eq(purchase.paymentId, payment.id))
      .innerJoin(user, eq(purchase.userId, user.id))
      .where(eq(purchase.id, purchaseId))
      .limit(1);

    if (!purchasedData) {
      return {
        success: false,
        error: "Purchase not found",
      };
    }

    if (
      purchasedData.purchase.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "User not Authorized",
      };
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const htmlContent = generateInvoiceHtml(
      invoiceNumber,
      new Date(purchasedData.purchase.createdAt),
      purchasedData.asset.title,
      purchasedData.purchase.price,
    );

    const [newInvoice] = await db
      .insert(invoice)
      .values({
        id: uuidv4(),
        invoiceNumber,
        purchaseId: purchasedData.purchase.id,
        userId: purchasedData.user.id,
        amount: purchasedData.purchase.price,
        currency: "USD",
        status: "paid",
        htmlContent: htmlContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/purchases");

    return {
      success: true,
      message: "Invoice Created Successfully",
      invoiceId: newInvoice.id,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to create Invoice",
    };
  }
};

export const getUserInvoicesAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return {
        success: false,
        error: "User not Authorized",
      };
    }

    const userInvoices = await db
      .select()
      .from(invoice)
      .where(eq(invoice.userId, session.user.id))
      .orderBy(invoice.createdAt);

    return {
      success: true,
      message: "User Invoices fetched Successfully",
      invoices: userInvoices,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch user invoices",
    };
  }
};

export const getInvoiceHtmlAction = async (invoiceId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "User not Authorized" };
    }

    const [invoiceData] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, invoiceId))
      .limit(1);

    if (!invoiceData) {
      return { success: false, error: "Invoice not fount" };
    }

    if (
      invoiceData.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return { success: false, error: "User Not Authotized" };
    }

    if (!invoiceData.htmlContent) {
      return { success: false, error: "Invoice HTML Conten not found" };
    }

    return {
      success: true,
      message: "Invoice HTML Content fetched Successfully",
      html: invoiceData.htmlContent,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch invoice html content" };
  }
};

export const getInvoiceByIdAction = async (invoiceId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return { success: false, error: "User not Authorized" };
    }

    const [invoiceData] = await db
      .select()
      .from(invoice)
      .where(eq(invoice.id, invoiceId))
      .limit(1);

    if (!invoiceData) {
      return { success: false, error: "Invoice not found" };
    }

    if (
      invoiceData.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return { success: false, error: "User not authorized" };
    }

    if (!invoiceData) {
      return { success: false, error: "Invoice not found" };
    }

    return {
      success: true,
      message: "Fetched User Invoice HTML Content Successfully",
      invoice: invoiceData,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch user's invoice" };
  }
};
