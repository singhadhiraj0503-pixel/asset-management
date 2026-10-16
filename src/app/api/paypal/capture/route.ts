import { recordPurchaseAction } from "@/actions/payment-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalApiUrl = process.env.PAYPAL_API_URL;

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const assetId = searchParams.get("assetId");
  const payerId = searchParams.get("PayerID");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token || !assetId || !payerId) {
    // return {
    //   success: false,
    //   message: "Params are missing in!!",
    // };
    return NextResponse.redirect(
      new URL(`/gallery?error?=missing-params`, request.url),
    );
  }
  try {
    if (!clientId || !clientSecret || !paypalApiUrl) {
      throw new Error("PayPal environment variables are missing");
    }

    // 1. Exchange client credentials for an OAuth access token.
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("PayPal OAuth error:", tokenData);
      throw new Error("Could not authenticate with PayPal");
    }

    // 2. Capture the approved order using the OAuth access token.
    const response = await fetch(
      `${paypalApiUrl}/v2/checkout/orders/${encodeURIComponent(token)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        cache: "no-store",
      },
    );
    // console.log(response);

    const data = await response.json();
    console.log(data, "paypal-capture");

    if (!response.ok) {
      console.error("PayPal capture error:", {
        status: response.status,
        name: data.name,
        message: data.message,
        details: data.details,
        debug_id: data.debug_id,
      });

      throw new Error(data.message || "PayPal payment capture failed");
    }

    if (data.status === "COMPLETED") {
      // store the data in the Databse
      const saveToDB = await recordPurchaseAction(
        assetId,
        token,
        session.user.id,
        20.0,
      );

      if (!saveToDB.success) {
        return NextResponse.redirect(
          new URL(`/gallery/${assetId}?error=recording_failed`, request.url),
        );
      }

      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?success=true`, request.url),
      );
    } else {
      return NextResponse.redirect(
        new URL(`/gallery/${assetId}?error=payment_failed`, request.url),
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      new URL(`/gallery/${assetId}?error=server_error`, request.url),
    );
  }
};
