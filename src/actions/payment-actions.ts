"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, purchase } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
