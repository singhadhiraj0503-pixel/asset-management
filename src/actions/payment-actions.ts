"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, payment, purchase, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { createInvoiceAction } from "./invoice-actions";

export const createPaypalOrderAction = async (assetId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const [getAsset] = await db.select().from(asset).where(eq(asset.id, assetId));
  if (!getAsset) throw new Error("Asset not found");

  const existingPurchase = await db
    .select()
    .from(purchase)
    .where(
      and(eq(purchase.assetId, assetId), eq(purchase.userId, session.user.id)),
    )
    .limit(1);

  if (existingPurchase.length > 0) {
    return {
      success: false,
      message: "Asset has already been purchased",
      alreadyPurchased: true,
    };
  }

  try {
    // 1. Get PayPal access token in the same action
    const credentials = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenResponse = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("PayPal authentication error:", tokenData);
      throw new Error("PayPal authentication failed");
    }

    // 2. Create the PayPal order using the access token
    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: assetId,
              description: `Purchase of ${getAsset.title}`,
              amount: {
                currency_code: "USD",
                value: "20.00",
              },
              custom_id: `${session.user.id}|${assetId}`,
            },
          ],
          application_context: {
            return_url: `${process.env.APP_URL}/api/paypal/capture?assetId=${encodeURIComponent(assetId)}`,
            cancel_url: `${process.env.APP_URL}/gallery/${encodeURIComponent(assetId)}?cancelled=true`,
          },
        }),
        cache: "no-store",
      },
    );

    const data = await response.json();
    console.log(data);

    // 3. Log the actual PayPal error if the request fails
    if (!response.ok) {
      console.error(
        "PayPal order error:",
        JSON.stringify(
          {
            status: response.status,
            data,
          },
          null,
          2,
        ),
      );

      throw new Error(data.message || "PayPal rejected the order request");
    }

    // 4. Return the order ID and approval URL
    const approvalLink = data.links?.find(
      (link: { rel: string; href: string }) => link.rel === "approve",
    )?.href;

    if (!data.id || !approvalLink) {
      console.error("Unexpected PayPal response:", data);
      throw new Error("PayPal order ID or approval URL is missing");
    }

    return {
      success: true,
      orderId: data.id,
      approvalLink,
    };
  } catch (error) {
    console.error("PayPal purchase error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create the PayPal order",
    );
  }
};

export const recordPurchaseAction = async (
  assetId: string,
  paypalOrderId: string,
  userId: string,
  price = 20.0,
) => {
  try {
    const existingPurchase = await db
      .select()
      .from(purchase)
      .where(and(eq(purchase.assetId, assetId), eq(purchase.userId, userId)))
      .limit(1);

    if (existingPurchase.length > 0) {
      return {
        success: true,
        alreadyExists: true,
      };
    }

    const paymentUuid = uuidv4();
    const purchaseUuid = uuidv4();

    await db.insert(payment).values({
      id: paymentUuid,
      amount: Math.round(price * 100),
      currency: "USD",
      status: "completed",
      provider: "paypal",
      providerId: paypalOrderId,
      userId: userId,
      createdAt: new Date(),
    });

    await db.insert(purchase).values({
      id: purchaseUuid,
      assetId,
      userId,
      paymentId: paymentUuid,
      price: Math.round(price * 100),
      createdAt: new Date(),
    });

    // create invoice later
    const invoiceResult = await createInvoiceAction(purchaseUuid);
    if (!invoiceResult.success) {
      console.error("Failed to create invoice");
    }

    revalidatePath(`/gallery/${assetId}`);
    revalidatePath(`/dashboard/purchases`);

    return {
      success: true,
      purchaseId: purchaseUuid,
      message: "Purchase and payment information saved successfuully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: true,
      message: "Failed to save purchase and payment information",
    };
  }
};

export const hasUserPurchasedAssetAction = async (assetId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return false;

  try {
    const existingPurchase = await db
      .select()
      .from(purchase)
      .where(
        and(
          eq(purchase.assetId, assetId),
          eq(purchase.userId, session.user.id),
        ),
      )
      .limit(1);

    return existingPurchase.length > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getAllUserPurchasedAssetsAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) redirect("/login");

  try {
    const userPurchases = await db
      .select({
        purchase: purchase,
        asset: asset,
      })
      .from(purchase)
      .innerJoin(asset, eq(purchase.assetId, asset.id))
      .where(eq(purchase.userId, session.user.id))
      .orderBy(purchase.createdAt);

    return userPurchases;
  } catch (error) {
    console.error(error);
    return [];
  }
};
