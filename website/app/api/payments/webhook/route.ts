
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("Paystack secret key is missing.");
      return NextResponse.json(
        { error: "Webhook is not configured." },
        { status: 500 }
      );
    }

    const signature = request.headers.get("x-paystack-signature");

    if (
      !signature ||
      !/^[a-fA-F0-9]{128}$/.test(signature)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid webhook signature." },
        { status: 401 }
      );
    }

    const rawBody = await request.text();

    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    let event;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    if (event.event !== "charge.success" || !event.data) {
      return NextResponse.json({ received: true });
    }

    const transaction = event.data;
    const reference = transaction.reference;

    if (
      typeof reference !== "string" ||
      transaction.status !== "success"
    ) {
      return NextResponse.json({ received: true });
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("amount, currency, reference, status")
      .eq("reference", reference)
      .maybeSingle();

    if (paymentError) {
      console.error("Webhook payment lookup error:", paymentError);
      return NextResponse.json(
        { error: "Payment lookup failed." },
        { status: 500 }
      );
    }

    if (!payment) {
      console.error("Webhook received an unknown payment reference.");
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    const expectedAmount = Math.round(Number(payment.amount) * 100);

    const paymentIsValid =
      transaction.reference === payment.reference &&
      transaction.currency === payment.currency &&
      Number(transaction.amount) === expectedAmount;

    if (!paymentIsValid) {
      console.error("Webhook transaction details do not match.");
      return NextResponse.json(
        { error: "Transaction details do not match." },
        { status: 400 }
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        received: true,
        message: "Payment already processed.",
      });
    }

    if (payment.status !== "pending") {
      return NextResponse.json({
        received: true,
        message: "Payment is not pending.",
      });
    }

    const { data: confirmation, error: confirmationError } =
      await supabaseAdmin.rpc("confirm_abujafix_payment", {
        p_reference: reference,
        p_amount_kobo: Number(transaction.amount),
        p_currency: transaction.currency,
        p_paid_at: transaction.paid_at || new Date().toISOString(),
      });

    if (confirmationError || !confirmation?.success) {
      console.error("Webhook atomic confirmation error:", confirmationError);
      return NextResponse.json(
        { error: "Could not record the confirmed payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      received: true,
      message: "Payment successfully recorded.",
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
